// Clar AI — SOS Voice Agent (WebSocket)
// Bridges Twilio Media Streams with Claude AI for real-time emergency voice assessment.
// Handles: member assessment, false alarm detection, escalation trigger.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.27.0";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

interface TwilioMessage {
  event: string;
  streamSid?: string;
  media?: { payload: string; timestamp: string };
  start?: { streamSid: string; customParameters: Record<string, string> };
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

// System prompt for Clar's emergency voice assessment
function getClarSosSystemPrompt(memberName: string, location: string) {
  return `You are Clar, the AI emergency coordinator for ICE SOS. You are now on a live voice call with ${memberName}.

SITUATION: ${memberName} just activated their SOS emergency alert from location: ${location}.

YOUR IMMEDIATE MISSION:
1. Greet them calmly by name and confirm this is Clar from ICE SOS
2. Ask: "Are you okay? Did you mean to activate your SOS?"
3. Based on their answer:

   IF FALSE ALARM (they say they're fine / accidental press):
   - Confirm once: "Are you absolutely sure you're safe and don't need help?"
   - If yes: "No problem at all, ${memberName}. Stay safe. Goodbye." → then trigger false_alarm
   - DO NOT contact emergency contacts

   IF CONFIRMED EMERGENCY (they need help / describe danger):
   - Stay calm, keep them talking
   - Ask: "Can you briefly describe what's happening?"
   - Say: "I'm now alerting all your emergency contacts simultaneously. Help is on the way."
   - Trigger escalation → contacts will be called
   - Keep ${memberName} on the line and calm until help arrives

   IF NO CLEAR RESPONSE / DISTRESS / SILENCE (15-20 seconds of no coherent response):
   - Say: "I'm alerting your emergency contacts as a precaution. Please stay on the line."
   - Trigger escalation

VOICE STYLE:
- Extremely calm, warm, reassuring — never robotic or clinical
- Short sentences — this is an emergency
- Always use ${memberName}'s name
- Never panic, never rush

ABSOLUTE RULES:
- NEVER mention calling 911, 112, or any emergency services
- If asked about emergency services: "Your family contacts can call emergency services if needed"
- Never end the call until the incident is resolved or clearly a false alarm
- Keep speaking gently even if member is not responding`;
}

// Assess transcript to determine call outcome
function assessTranscript(transcript: string): "false_alarm" | "emergency" | "unclear" {
  const falsePhrases = /\b(accident|mistake|wrong|okay|fine|sorry|no help|don't need|didn't mean|false alarm)\b/i;
  const emergencyPhrases = /\b(help|hurt|danger|pain|attack|fell|fall|can't|bleeding|sick|emergency|scared|trapped|fire)\b/i;

  if (falsePhrases.test(transcript)) return "false_alarm";
  if (emergencyPhrases.test(transcript)) return "emergency";
  return "unclear";
}

Deno.serve(async (req: Request) => {
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("Expected WebSocket", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const supabase = getSupabaseClient();
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  let streamSid: string | null = null;
  let incidentId: string | null = null;
  let memberName: string = "Member";
  let location: string = "unknown location";
  let isEscalated = false;
  let isFalseAlarm = false;
  let silenceTimer: number | null = null;
  let conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = [];

  // TTS: Send text back to Twilio via synthesized speech
  // We use a simple TTS approach by calling Twilio's <Say> verb via a call update
  async function speakToMember(text: string) {
    if (!streamSid) return;

    // Forward text to Twilio by sending a mark (Twilio will handle TTS via our stream config)
    // For real TTS we use Twilio's REST API to update the call with new TwiML
    if (!incidentId) return;

    try {
      const { data: incident } = await supabase
        .from("sos_incidents")
        .select("member_call_sid")
        .eq("id", incidentId)
        .single();

      if (!incident?.member_call_sid) return;

      const twilio = getTwilioAuth();
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural" language="en-US">${text}</Say>
  <Connect>
    <Stream url="wss://${Deno.env.get("SUPABASE_URL")?.replace("https://", "")}/functions/v1/clar-sos-voice">
      <Parameter name="incidentId" value="${incidentId}" />
      <Parameter name="memberName" value="${encodeURIComponent(memberName)}" />
      <Parameter name="location" value="${encodeURIComponent(location)}" />
      <Parameter name="role" value="member_assessment" />
    </Stream>
  </Connect>
</Response>`;

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
    } catch (err) {
      console.error("Failed to update call with speech:", err);
    }
  }

  async function triggerFalseAlarm() {
    if (isFalseAlarm || isEscalated || !incidentId) return;
    isFalseAlarm = true;

    console.log(`✅ False alarm: ${incidentId}`);

    await supabase
      .from("sos_incidents")
      .update({ status: "false_alarm", resolved_at: new Date().toISOString() })
      .eq("id", incidentId);

    await supabase.from("incident_timeline").insert({
      incident_id: incidentId,
      event_type: "false_alarm",
      event_data: { resolved_by: "member_confirmed" },
    });
  }

  async function triggerEscalation(reason: string) {
    if (isEscalated || isFalseAlarm || !incidentId) return;
    isEscalated = true;

    console.log(`🚨 Escalating incident ${incidentId}: ${reason}`);

    // Get member details for notification
    const { data: incident } = await supabase
      .from("sos_incidents")
      .select("member_id, situation_summary")
      .eq("id", incidentId)
      .single();

    if (!incident) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", incident.member_id)
      .single();

    const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || memberName;

    await supabase.from("incident_timeline").insert({
      incident_id: incidentId,
      event_type: "escalated",
      event_data: { reason },
    });

    // Fire notify-contacts (parallel WhatsApp + push + calls to all contacts)
    await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/notify-contacts`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          incident_id: incidentId,
          member_id: incident.member_id,
          member_name: name,
          location,
          situation_summary: incident.situation_summary || "SOS activated",
        }),
      }
    );
  }

  // Generate Clar's response using Claude
  async function generateClarResponse(userTranscript: string): Promise<string> {
    conversationHistory.push({ role: "user", content: userTranscript });

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 150,
      system: getClarSosSystemPrompt(memberName, location),
      messages: conversationHistory,
    });

    const reply = msg.content[0].type === "text" ? msg.content[0].text : "";
    conversationHistory.push({ role: "assistant", content: reply });

    // Assess outcome from transcript
    const outcome = assessTranscript(userTranscript);

    if (outcome === "false_alarm" && conversationHistory.length >= 4) {
      // Wait for second confirmation before closing
      const recentUserMessages = conversationHistory
        .filter((m) => m.role === "user")
        .slice(-2)
        .map((m) => m.content)
        .join(" ");
      if (assessTranscript(recentUserMessages) === "false_alarm") {
        setTimeout(() => triggerFalseAlarm(), 2000);
      }
    } else if (outcome === "emergency") {
      await triggerEscalation("member_confirmed_emergency");
    }

    // Save situation summary if meaningful
    if (userTranscript.length > 20 && outcome !== "false_alarm" && incidentId) {
      await supabase
        .from("sos_incidents")
        .update({ situation_summary: userTranscript.slice(0, 500) })
        .eq("id", incidentId)
        .is("situation_summary", null);
    }

    return reply;
  }

  // Reset silence escalation timer
  function resetSilenceTimer() {
    if (silenceTimer) clearTimeout(silenceTimer);
    silenceTimer = setTimeout(async () => {
      if (!isEscalated && !isFalseAlarm) {
        console.log("⏱️ Silence timeout — auto-escalating");
        await speakToMember(`${memberName}, I'm alerting your emergency contacts as a precaution. Please stay on the line.`);
        await triggerEscalation("no_response_timeout");
      }
    }, 20000); // 20 second silence = auto-escalate
  }

  socket.onopen = () => {
    console.log("🎙️ Clar SOS voice WebSocket opened");
    resetSilenceTimer();
  };

  socket.onmessage = async (event) => {
    try {
      const msg: TwilioMessage = JSON.parse(event.data);

      switch (msg.event) {
        case "start": {
          streamSid = msg.start?.streamSid || null;
          const params = msg.start?.customParameters || {};
          incidentId = params.incidentId || null;
          memberName = decodeURIComponent(params.memberName || "Member");
          location = decodeURIComponent(params.location || "unknown location");

          console.log(`📞 Stream started. Incident: ${incidentId}, Member: ${memberName}`);

          await supabase.from("incident_timeline").insert({
            incident_id: incidentId,
            event_type: "clar_connected",
            event_data: { stream_sid: streamSid },
          });

          // Initial greeting
          const greeting = `Hello ${memberName}, this is Clar from ICE SOS. I received your emergency alert. Are you okay? Did you mean to activate your SOS?`;
          conversationHistory.push({ role: "assistant", content: greeting });
          await speakToMember(greeting);
          break;
        }

        case "media": {
          // Audio comes in as G.711 µ-Law base64 — we receive transcription events separately
          // Twilio handles ASR and will send transcription via a separate webhook
          // Here we just reset the silence timer on any audio activity
          resetSilenceTimer();
          break;
        }

        case "transcription": {
          // Twilio Voice Intelligence transcription event
          const transcript = (msg as any).transcription?.transcript || "";
          if (!transcript) break;

          console.log(`👤 ${memberName} said: ${transcript}`);
          resetSilenceTimer();

          await supabase.from("incident_timeline").insert({
            incident_id: incidentId,
            event_type: "member_speech",
            event_data: { transcript },
          });

          const reply = await generateClarResponse(transcript);
          console.log(`🤖 Clar replied: ${reply}`);
          await speakToMember(reply);
          break;
        }

        case "stop": {
          console.log("📞 Stream stopped");
          if (silenceTimer) clearTimeout(silenceTimer);
          // If neither resolved — escalate as precaution
          if (!isEscalated && !isFalseAlarm) {
            await triggerEscalation("call_ended_unresolved");
          }
          break;
        }
      }
    } catch (err) {
      console.error("❌ Message handling error:", err);
    }
  };

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  socket.onclose = () => {
    console.log("WebSocket closed");
    if (silenceTimer) clearTimeout(silenceTimer);
  };

  return response;
});
