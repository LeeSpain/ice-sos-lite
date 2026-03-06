// Clar AI — Notify Emergency Contacts
// Fires simultaneously: Twilio calls, WhatsApp messages, and push notifications
// to ALL emergency contacts who have the relevant channels enabled.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  incident_id: string;
  member_id: string;
  member_name: string;
  location: string;
  situation_summary: string;
}

function getSupabaseClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

function getTwilioAuth() {
  const sid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const token = Deno.env.get("TWILIO_AUTH_TOKEN");
  if (!sid || !token) throw new Error("Twilio credentials not configured");
  return { sid, auth: btoa(`${sid}:${token}`) };
}

// Twilio call to a single emergency contact
async function callContact(
  contactPhone: string,
  contactName: string,
  memberName: string,
  location: string,
  situationSummary: string,
  incidentId: string,
  incidentContactId: string,
  twilio: { sid: string; auth: string }
): Promise<string> {
  const FROM = Deno.env.get("TWILIO_PHONE_NUMBER")!;
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

  const summary = situationSummary || "Emergency alert activated";
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural" language="en-US">
    Hello ${contactName}, this is Clar from ICE SOS.
    ${memberName} has activated their emergency SOS alert.
    Situation: ${summary}.
    Their location is ${location}.
    Please press 1 if you are on your way to help, or press 2 if you cannot respond.
  </Say>
  <Gather numDigits="1" action="${SUPABASE_URL}/functions/v1/incident-update?incidentContactId=${incidentContactId}&amp;incidentId=${incidentId}" method="POST" timeout="15">
    <Say voice="Polly.Joanna-Neural">Press 1 if you are on your way, or 2 if you cannot respond.</Say>
  </Gather>
  <Say voice="Polly.Joanna-Neural">We did not receive your input. Please check your messages for a location link. Stay safe.</Say>
</Response>`;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilio.sid}/Calls.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${twilio.auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: contactPhone,
        From: FROM,
        Twiml: twiml,
        StatusCallback: `${SUPABASE_URL}/functions/v1/incident-update`,
        StatusCallbackEvent: "completed",
        StatusCallbackMethod: "POST",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Call to ${contactPhone} failed: ${err}`);
  }

  const data = await res.json();
  return data.sid;
}

// WhatsApp message via Twilio
async function sendWhatsApp(
  contactPhone: string,
  memberName: string,
  location: string,
  situationSummary: string,
  twilio: { sid: string; auth: string }
): Promise<void> {
  const FROM = `whatsapp:${Deno.env.get("TWILIO_WHATSAPP_NUMBER") || Deno.env.get("TWILIO_PHONE_NUMBER")}`;
  const TO = `whatsapp:${contactPhone}`;

  const googleMapsUrl = location !== "Location unavailable"
    ? `https://maps.google.com/?q=${encodeURIComponent(location)}`
    : null;

  const body = `🚨 *ICE SOS Emergency Alert*\n\n` +
    `*${memberName}* has activated their SOS emergency.\n\n` +
    `📋 *Situation:* ${situationSummary || "Emergency alert activated"}\n\n` +
    (googleMapsUrl ? `📍 *Location:* ${googleMapsUrl}\n\n` : `📍 Location unavailable\n\n`) +
    `Please respond to Clar's call or reply *ON MY WAY* if you are heading to help.\n\n` +
    `_ICE SOS — Always There_`;

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${twilio.sid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${twilio.auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: TO, From: FROM, Body: body }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error(`WhatsApp to ${contactPhone} failed: ${err}`);
    // Don't throw — WhatsApp failure shouldn't block calls
  }
}

// In-app push notification via Supabase realtime broadcast
async function sendPushNotification(
  supabase: ReturnType<typeof getSupabaseClient>,
  memberId: string,
  memberName: string,
  incidentId: string,
  situationSummary: string
): Promise<void> {
  // Broadcast to any family member apps subscribed to this member's alerts
  await supabase.channel(`sos-alerts-${memberId}`).send({
    type: "broadcast",
    event: "sos_alert",
    payload: {
      incident_id: incidentId,
      member_name: memberName,
      situation_summary: situationSummary,
      triggered_at: new Date().toISOString(),
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient();
    const body: NotifyRequest = await req.json();

    console.log(`📢 Notifying contacts for incident: ${body.incident_id}`);

    // Get emergency contacts for this member — only those with allow_calls or allow_notifications
    const { data: contacts, error: contactsError } = await supabase
      .from("emergency_contacts")
      .select("id, name, phone, email, allow_calls, allow_notifications")
      .eq("user_id", body.member_id)
      .or("allow_calls.eq.true,allow_notifications.eq.true")
      .order("priority", { ascending: true });

    if (contactsError) throw contactsError;
    if (!contacts || contacts.length === 0) {
      console.log("⚠️ No contacts with notifications enabled");
      return new Response(
        JSON.stringify({ success: true, message: "No contacts to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const twilio = getTwilioAuth();
    const results: Array<{ contact: string; methods: string[]; success: boolean }> = [];

    // Fire all contact notifications in parallel
    await Promise.allSettled(
      contacts.map(async (contact) => {
        const methods: string[] = [];

        // Create incident_contacts record first to get the ID for the call webhook
        const { data: incidentContact, error: icError } = await supabase
          .from("incident_contacts")
          .insert({
            incident_id: body.incident_id,
            contact_id: contact.id,
            contact_phone: contact.phone,
            contact_name: contact.name,
            notification_methods: [],
            response_status: "notified",
          })
          .select()
          .single();

        if (icError || !incidentContact) {
          console.error(`Failed to create incident_contact for ${contact.name}:`, icError);
          return;
        }

        try {
          // Voice call
          if (contact.allow_calls && contact.phone) {
            try {
              const callSid = await callContact(
                contact.phone,
                contact.name,
                body.member_name,
                body.location,
                body.situation_summary,
                body.incident_id,
                incidentContact.id,
                twilio
              );
              methods.push("call");

              await supabase
                .from("incident_contacts")
                .update({ call_sid: callSid })
                .eq("id", incidentContact.id);

              await supabase.from("incident_timeline").insert({
                incident_id: body.incident_id,
                event_type: "contact_called",
                event_data: { contact_name: contact.name, call_sid: callSid },
              });

              console.log(`📞 Called ${contact.name}: ${callSid}`);
            } catch (err) {
              console.error(`Call failed for ${contact.name}:`, err);
            }
          }

          // WhatsApp
          if (contact.allow_notifications && contact.phone) {
            try {
              await sendWhatsApp(
                contact.phone,
                body.member_name,
                body.location,
                body.situation_summary,
                twilio
              );
              methods.push("whatsapp");
              console.log(`💬 WhatsApp sent to ${contact.name}`);
            } catch (err) {
              console.error(`WhatsApp failed for ${contact.name}:`, err);
            }
          }

          // Push notification (in-app)
          if (contact.allow_notifications) {
            try {
              await sendPushNotification(
                supabase,
                body.member_id,
                body.member_name,
                body.incident_id,
                body.situation_summary
              );
              methods.push("push");
            } catch (err) {
              console.error(`Push failed for ${contact.name}:`, err);
            }
          }

          // Update notification methods used
          await supabase
            .from("incident_contacts")
            .update({ notification_methods: methods })
            .eq("id", incidentContact.id);

          results.push({ contact: contact.name, methods, success: true });
        } catch (err) {
          console.error(`Failed to notify ${contact.name}:`, err);
          results.push({ contact: contact.name, methods, success: false });
        }
      })
    );

    console.log(`✅ Notified ${results.length} contacts`);

    return new Response(
      JSON.stringify({ success: true, contacts_notified: results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ notify-contacts error:", error);
    return new Response(
      JSON.stringify({ error: String(error?.message || error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
