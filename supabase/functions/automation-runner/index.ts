// supabase/functions/automation-runner/index.ts
// Cron-safe orchestrator: runs email + social queue processors.
// Requires header: x-cron-secret matching env var CRON_SECRET.

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function unauthorized(message = "Unauthorized") {
  return json({ success: false, error: message }, 401);
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(
      { success: false, error: "Method not allowed. Use POST." },
      405
    );
  }

  // ---- CRON SECRET AUTH ----
  const provided = req.headers.get("x-cron-secret") ?? "";
  const expected = Deno.env.get("CRON_SECRET") ?? "";
  if (!expected) {
    // Safety: if secret not configured, do NOT allow runs.
    return unauthorized("CRON_SECRET is not set in environment variables.");
  }
  if (!provided || provided !== expected) {
    return unauthorized("Invalid or missing x-cron-secret header.");
  }

  // ---- SUPABASE CLIENT ----
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !serviceKey) {
    return json(
      {
        success: false,
        error:
          "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables.",
      },
      500
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const ranAt = new Date().toISOString();

  console.log(`[automation-runner] start: ${ranAt}`);

  // ---- INVOKE EXISTING PROCESSORS ----
  // NOTE: These functions already exist in your repo per audit.
  // - email-processor should process email_queue (Resend)
  // - posting-processor should process social_media_posting_queue
  // Keep bodies minimal; adjust only if your existing functions require different payloads.
  let emailResult: unknown = null;
  let postingResult: unknown = null;

  try {
    const { data, error } = await supabase.functions.invoke("email-processor", {
      body: { action: "process_queue", max_emails: 50 },
    });
    if (error) throw error;
    emailResult = data ?? { ok: true };
    console.log("[automation-runner] email-processor OK");
  } catch (e) {
    console.error("[automation-runner] email-processor ERROR:", e);
    emailResult = { ok: false, error: String(e) };
  }

  try {
    const { data, error } = await supabase.functions.invoke("posting-processor", {
      body: {}, // posting-processor usually reads queue internally
    });
    if (error) throw error;
    postingResult = data ?? { ok: true };
    console.log("[automation-runner] posting-processor OK");
  } catch (e) {
    console.error("[automation-runner] posting-processor ERROR:", e);
    postingResult = { ok: false, error: String(e) };
  }

  console.log(`[automation-runner] end: ${new Date().toISOString()}`);

  return json({
    success: true,
    ran_at: ranAt,
    email: emailResult,
    posting: postingResult,
  });
});
