// Clar AI — SOS Trigger Orchestrator
// Receives SOS event, creates incident, calls member first via Clar, then escalates if needed.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SOSTriggerRequest {
  trigger_method: "app_button" | "pendant";
  latitude?: number;
  longitude?: number;
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

async function callMemberViaClar(
  memberPhone: string,
  memberName: string,
  incidentId: string,
  location: string,
  twilio: { sid: string; auth: string }
): Promise<string> {
  const FROM = Deno.env.get("TWILIO_PHONE_NUMBER");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

  if (!FROM) throw new Error("TWILIO_PHONE_NUMBER not configured");

  // TwiML: Connects Clar (Claude AI via clar-sos-voice edge function) to the member
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="wss://${SUPABASE_URL?.replace("https://", "")}/functions/v1/clar-sos-voice">
      <Parameter name="incidentId" value="${incidentId}" />
      <Parameter name="memberName" value="${encodeURIComponent(memberName)}" />
      <Parameter name="location" value="${encodeURIComponent(location)}" />
      <Parameter name="role" value="member_assessment" />
    </Stream>
  </Connect>
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
        To: memberPhone,
        From: FROM,
        Twiml: twiml,
        StatusCallback: `${SUPABASE_URL}/functions/v1/clar-call-status`,
        StatusCallbackEvent: "initiated,answered,completed",
        StatusCallbackMethod: "POST",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Twilio call failed: ${err}`);
  }

  const data = await res.json();
  return data.sid;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = getSupabaseClient();

    // Authenticate the request — must be a logged-in member
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: SOSTriggerRequest = await req.json();

    console.log(`🚨 SOS triggered by user ${user.id} via ${body.trigger_method}`);

    // Get member profile (name + phone)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("first_name, last_name, phone")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile || !profile.phone) {
      return new Response(
        JSON.stringify({ error: "Member profile or phone not found. Please update your profile." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const memberName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Member";
    const location = body.latitude && body.longitude
      ? `${body.latitude.toFixed(5)}, ${body.longitude.toFixed(5)}`
      : "Location unavailable";

    // Create the incident record
    const { data: incident, error: incidentError } = await supabase
      .from("sos_incidents")
      .insert({
        member_id: user.id,
        trigger_method: body.trigger_method,
        status: "active",
      })
      .select()
      .single();

    if (incidentError || !incident) {
      throw new Error(`Failed to create incident: ${incidentError?.message}`);
    }

    console.log(`✅ Incident created: ${incident.id}`);

    // Log trigger event
    await supabase.from("incident_timeline").insert({
      incident_id: incident.id,
      event_type: "sos_triggered",
      event_data: {
        trigger_method: body.trigger_method,
        latitude: body.latitude,
        longitude: body.longitude,
        member_name: memberName,
      },
    });

    // Call the member via Clar (Claude AI voice)
    let memberCallSid: string | null = null;
    try {
      const twilio = getTwilioAuth();
      memberCallSid = await callMemberViaClar(
        profile.phone,
        memberName,
        incident.id,
        location,
        twilio
      );

      console.log(`📞 Clar calling member: ${memberCallSid}`);

      // Update incident with call SID
      await supabase
        .from("sos_incidents")
        .update({ member_call_sid: memberCallSid })
        .eq("id", incident.id);

      await supabase.from("incident_timeline").insert({
        incident_id: incident.id,
        event_type: "clar_called_member",
        event_data: { call_sid: memberCallSid, member_phone: profile.phone },
      });
    } catch (callError) {
      console.error("❌ Failed to call member:", callError);
      // Even if the call fails, we keep the incident active and will notify contacts
      await supabase.from("incident_timeline").insert({
        incident_id: incident.id,
        event_type: "clar_call_failed",
        event_data: { error: String(callError), member_phone: profile.phone },
      });

      // Auto-escalate since we couldn't reach the member
      await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/notify-contacts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            incident_id: incident.id,
            member_id: user.id,
            member_name: memberName,
            location,
            situation_summary: "Member could not be reached by voice — location shared as precaution",
          }),
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        incident_id: incident.id,
        member_call_sid: memberCallSid,
        message: "SOS activated. Clar is calling you now.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ SOS trigger error:", error);
    return new Response(
      JSON.stringify({ error: String(error?.message || error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
