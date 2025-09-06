import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QueueRow {
  id: string;
  content_id: string;
  scheduled_time: string;
  posted_at: string | null;
  platform: string;
  status: string; // queued | retry_scheduled | posted | failed
  retry_count: number | null;
  max_retries: number | null;
}

interface ContentRow {
  id: string;
  title: string | null;
  body_text: string | null;
  platform: string | null;
}

const PLATFORM_LIMITS: Record<string, number> = {
  twitter: 280,
  x: 280,
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
  youtube: 5000,
};

function nowISO() {
  return new Date().toISOString();
}

function minutesFromNow(mins: number) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + mins);
  return d.toISOString();
}

function validateContent(platform: string, text: string) {
  const key = platform.toLowerCase();
  const limit = PLATFORM_LIMITS[key] ?? 3000;
  if (text.length > limit) {
    throw new Error(`Content exceeds ${key} limit (${text.length}/${limit})`);
  }
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env');
    return new Response(
      JSON.stringify({ error: 'Server misconfigured: missing env vars' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const admin = createClient(supabaseUrl, serviceKey);

  try {
    const now = nowISO();

    // Load up to 10 items ready to process
    const { data: items, error: loadErr } = await admin
      .from('social_media_posting_queue')
      .select('*')
      .in('status', ['queued', 'retry_scheduled'])
      .lte('scheduled_time', now)
      .order('scheduled_time', { ascending: true })
      .limit(10);

    if (loadErr) throw new Error(`Load queue failed: ${loadErr.message}`);

    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    const details: Array<Record<string, unknown>> = [];

    for (const item of (items as QueueRow[] | null) ?? []) {
      processed++;
      try {
        const { data: content, error: cErr } = await admin
          .from('marketing_content')
          .select('*')
          .eq('id', item.content_id)
          .maybeSingle();
        if (cErr) throw new Error(`Load content failed: ${cErr.message}`);
        if (!content) throw new Error('Related content not found');

        const c = content as ContentRow;
        const platform = (item.platform || c.platform || 'unknown').toLowerCase();
        const text = `${c.title ?? ''}\n\n${c.body_text ?? ''}`.trim();

        // Validation
        validateContent(platform, text);

        // Simulated publish - replace with real API calls later
        // e.g., await publishToPlatform(platform, text, media)
        const simulatedPostId = `sim_${crypto.randomUUID()}`;

        const { error: upQueueErr } = await admin
          .from('social_media_posting_queue')
          .update({
            status: 'posted',
            posted_at: now,
            platform_post_id: simulatedPostId,
            error_message: null,
          })
          .eq('id', item.id);
        if (upQueueErr) throw new Error(`Update queue failed: ${upQueueErr.message}`);

        const { error: upContentErr } = await admin
          .from('marketing_content')
          .update({ status: 'posted', posted_at: now })
          .eq('id', item.content_id);
        if (upContentErr) throw new Error(`Update content failed: ${upContentErr.message}`);

        succeeded++;
        details.push({ id: item.id, platform, status: 'posted', simulatedPostId });
      } catch (e: any) {
        console.error('posting-processor error on item', item.id, e?.message || e);
        const nextRetry = (item.retry_count ?? 0) + 1;
        const max = item.max_retries ?? 3;
        const willRetry = nextRetry <= max;
        const newStatus = willRetry ? 'retry_scheduled' : 'failed';
        const newTime = willRetry ? minutesFromNow(Math.min(30, nextRetry * 5)) : item.scheduled_time;

        const { error: upErr } = await admin
          .from('social_media_posting_queue')
          .update({
            status: newStatus,
            retry_count: nextRetry,
            scheduled_time: newTime,
            error_message: e?.message || 'unknown_error',
          })
          .eq('id', item.id);
        if (upErr) console.error('Failed to update queue after error', upErr.message);

        if (!willRetry) failed++;
        details.push({ id: item.id, status: newStatus, retry_count: nextRetry, error: e?.message });
      }
    }

    const result = { ok: true, processed, succeeded, failed, details };
    console.log('posting-processor result', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err: any) {
    console.error('posting-processor fatal error', err?.message || err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || 'unknown_error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});