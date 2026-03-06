// Clar AI — Incident Update Handler
// Receives Twilio DTMF responses from emergency contacts (1 = on route, 2 = can't help)
// Also handles manual status updates from the app.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

// Update the member's call with Clar to inform them a contact is on route
async function updateMemberCall(
  incidentId: string,
  contactName: string,
  status: string,
  supabase: ReturnType<typeof getSupabaseClient>
) {
  const { data: incident } = await supabase
    .from("sos_incidents")
    .select("member_call_sid")
    .eq("id", incidentId)
    .single();

  if (!incident?.member_call_sid) return;

  const twilio = getTwilioAuth();

  let message = "";
  if (status === "on_route") {
    message = `Good news! ${contactName} has confirmed they are on their way to help you. Please stay calm and stay on the line.`;
  } else if (status === "arrived") {
    message = `${contactName} has arrived at your location. Are you safe now?`;
  }

  if (!message) return;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural" language="en-US">${message}</Say>
  <Pause length="3"/>
</Response>`;

  try {
    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilio.sid}/Calls/${incident.member_call_sid}.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${twilio.auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ Twiml: twiml }),
      }
    );
    console.log(`✅ Member updated: ${contactName} is ${status}`);
  } catch (err) {
    console.error("Failed to update member call:", err);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient();
    const url = new URL(req.url);

    // Twilio DTMF webhook — form-encoded body
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      // Twilio Gather callback (contact pressed 1 or 2)
      const formData = await req.formData();
      const digit = formData.get("Digits") as string;
      const incidentContactId = url.searchParams.get("incidentContactId");
      const incidentId = url.searchParams.get("incidentId");

      if (!incidentContactId || !incidentId) {
        return new Response(
          `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Thank you. Goodbye.</Say></Response>`,
          { status: 200, headers: { "Content-Type": "text/xml" } }
        );
      }

      const newStatus = digit === "1" ? "on_route" : "declined";

      await supabase
        .from("incident_contacts")
        .update({
          response_status: newStatus,
          responded_at: new Date().toISOString(),
        })
        .eq("id", incidentContactId);

      // Get contact name to inform member
      const { data: ic } = await supabase
        .from("incident_contacts")
        .select("contact_name")
        .eq("id", incidentContactId)
        .single();

      await supabase.from("incident_timeline").insert({
        incident_id: incidentId,
        event_type: newStatus === "on_route" ? "contact_confirmed_route" : "contact_declined",
        event_data: {
          incident_contact_id: incidentContactId,
          contact_name: ic?.contact_name,
          digit,
        },
      });

      if (newStatus === "on_route" && ic?.contact_name) {
        await updateMemberCall(incidentId, ic.contact_name, "on_route", supabase);
      }

      const responseMessage = newStatus === "on_route"
        ? `Thank you! We've let ${ic?.contact_name || "the member"} know you're on your way. Please drive safely.`
        : `Thank you for letting us know. We hope everything stays okay.`;

      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural" language="en-US">${responseMessage}</Say>
</Response>`,
        { status: 200, headers: { "Content-Type": "text/xml" } }
      );
    }

    // JSON API for app-based status updates (member confirms safe, contact confirms arrived)
    const body = await req.json();
    const { incident_id, incident_contact_id, status } = body;

    if (!incident_id || !status) {
      return new Response(JSON.stringify({ error: "incident_id and status required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (status === "resolved") {
      // Member confirmed safe — close the incident
      await supabase
        .from("sos_incidents")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("id", incident_id);

      await supabase.from("incident_timeline").insert({
        incident_id,
        event_type: "resolved",
        event_data: { resolved_by: "member_confirmed" },
      });

      console.log(`✅ Incident ${incident_id} resolved`);
    } else if (incident_contact_id && ["on_route", "arrived"].includes(status)) {
      await supabase
        .from("incident_contacts")
        .update({ response_status: status, responded_at: new Date().toISOString() })
        .eq("id", incident_contact_id);

      const { data: ic } = await supabase
        .from("incident_contacts")
        .select("contact_name")
        .eq("id", incident_contact_id)
        .single();

      await supabase.from("incident_timeline").insert({
        incident_id,
        event_type: status === "arrived" ? "contact_arrived" : "contact_confirmed_route",
        event_data: { incident_contact_id, contact_name: ic?.contact_name },
      });

      if (ic?.contact_name) {
        await updateMemberCall(incident_id, ic.contact_name, status, supabase);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ incident-update error:", error);
    return new Response(
      JSON.stringify({ error: String(error?.message || error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
