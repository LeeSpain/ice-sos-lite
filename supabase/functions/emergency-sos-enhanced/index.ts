// Enhanced Emergency SOS Edge Function
// - Creates sos_incidents record
// - Sends emails to contacts via Resend
// - Initiates sequential Twilio calls and records sos_call_attempts
// - Uses user JWT context so RLS applies to inserts/updates

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmergencyContact {
  name?: string;
  phone?: string;
  email?: string;
  relationship?: string;
}

interface EmergencySOSRequest {
  userProfile: {
    first_name?: string;
    last_name?: string;
    emergency_contacts: EmergencyContact[];
  };
  location: string;
  timestamp: string;
}

function getUserSupabaseClient(req: Request) {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization") || "";
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email to", to);
    return { skipped: true } as const;
  }
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ICE SOS <noreply@icesos.app>",
      to: [to],
      subject,
      html,
    }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Resend error: ${resp.status} ${JSON.stringify(data)}`);
  return data;
}

function toForm(data: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  Object.entries(data).forEach(([k, v]) => {
    if (Array.isArray(v)) v.forEach((vv) => params.append(k, vv));
    else if (v !== undefined) params.append(k, v);
  });
  return params;
}

async function makeTwilioCall(contact: EmergencyContact, incidentId: string, order: number, userName: string, location: string, supabaseUser: ReturnType<typeof createClient>) {
  const ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
  const AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
  const FROM = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!ACCOUNT_SID || !AUTH_TOKEN || !FROM) {
    console.warn("Twilio secrets missing, simulating call for", contact.phone);
    const { data: callAttempt, error: insErr } = await supabaseUser
      .from("sos_call_attempts")
      .insert({
        incident_id: incidentId,
        attempt_order: order,
        contact_name: contact.name || null,
        contact_phone: contact.phone || null,
        contact_email: contact.email || null,
        status: "simulated",
      })
      .select("id")
      .maybeSingle();
    if (insErr) console.error("Insert simulated call attempt failed", insErr);
    return { simulated: true, callAttemptId: callAttempt?.id } as const;
  }

  const statusCallbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/twilio-status-webhook`;
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Say voice="Polly.Joanna">This is an emergency alert for ${userName}. Their last known location is: ${location}. If you know their status, please reach out or press any key to acknowledge.</Say>\n  <Pause length="2"/>\n  <Say>If you were not able to answer, the system will contact the next person.</Say>\n</Response>`;

  const body = toForm({
    To: contact.phone!,
    From: FROM,
    Twiml: twiml,
    StatusCallback: statusCallbackUrl,
    // Twilio expects multiple entries for this key
    StatusCallbackEvent: ["initiated", "ringing", "answered", "completed"],
  });

  const auth = btoa(`${ACCOUNT_SID}:${AUTH_TOKEN}`);
  const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${ACCOUNT_SID}/Calls.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Twilio call error: ${resp.status} ${JSON.stringify(data)}`);

  const callSid = data.sid as string | undefined;
  const { error: insErr } = await supabaseUser.from("sos_call_attempts").insert({
    incident_id: incidentId,
    attempt_order: order,
    contact_name: contact.name || null,
    contact_phone: contact.phone || null,
    contact_email: contact.email || null,
    call_sid: callSid || null,
    status: "queued",
  });
  if (insErr) console.error("Insert call attempt failed", insErr);
  return { callSid } as const;
}

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUser = getUserSupabaseClient(req);
    const body = (await req.json()) as EmergencySOSRequest;

    const contacts = (body.userProfile?.emergency_contacts || []).filter(c => c && (c.email || c.phone));
    if (!contacts.length) {
      return new Response(JSON.stringify({ error: "No emergency contacts configured" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Derive user full name for messages
    const userName = `${body.userProfile?.first_name || ""} ${body.userProfile?.last_name || ""}`.trim() || "your contact";

    // Create incident under user's RLS context
    const { data: incident, error: incErr } = await supabaseUser
      .from("sos_incidents")
      .insert({ location: body.location || null, triggered_via: "app" })
      .select("id, contact_emails_sent, calls_initiated, status")
      .single();

    if (incErr || !incident) {
      console.error("Failed to create incident", incErr);
      throw new Error("Could not create SOS incident");
    }

    const incidentId = incident.id as string;

    // Send emails (best-effort)
    let emailsSent = 0;
    for (const c of contacts) {
      if (c.email) {
        try {
          await sendEmail(
            c.email,
            `Emergency alert for ${userName}`,
            `<p>This is an emergency alert for <strong>${userName}</strong>.</p><p>Last known location: ${body.location}</p><p>Time: ${new Date(body.timestamp).toLocaleString()}</p>`
          );
          emailsSent++;
        } catch (e) {
          console.error("Email send failed for", c.email, e);
        }
      }
    }

    if (emailsSent > 0) {
      const { error: updErr } = await supabaseUser
        .from("sos_incidents")
        .update({ contact_emails_sent: emailsSent, status: "in_progress" })
        .eq("id", incidentId);
      if (updErr) console.warn("Failed to update incident emails count", updErr);
    }

    // Initiate sequential calls with short spacing
    let callsInitiated = 0;
    let order = 1;
    for (const c of contacts) {
      if (c.phone) {
        try {
          await makeTwilioCall(c, incidentId, order, userName, body.location, supabaseUser);
          callsInitiated++;
          order++;
          // small delay to avoid burst; adjust as needed
          await wait(3000);
        } catch (e) {
          console.error("Twilio call failed for", c.phone, e);
          // record failed attempt as well
          await supabaseUser.from("sos_call_attempts").insert({
            incident_id: incidentId,
            attempt_order: order,
            contact_name: c.name || null,
            contact_phone: c.phone || null,
            contact_email: c.email || null,
            status: "failed",
            error: String(e?.message || e),
          });
          order++;
        }
      }
    }

    // Update incident with call count and mark as in_progress/completed
    const { error: finalUpdErr } = await supabaseUser
      .from("sos_incidents")
      .update({ calls_initiated: callsInitiated, status: "completed", completed_at: new Date().toISOString() })
      .eq("id", incidentId);
    if (finalUpdErr) console.warn("Failed to finalize incident", finalUpdErr);

    const summary = { emails_sent: emailsSent, calls_initiated: callsInitiated, incident_id: incidentId };
    return new Response(JSON.stringify({ ok: true, summary }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Emergency SOS enhanced error:", error);
    return new Response(JSON.stringify({ error: String(error?.message || error) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
