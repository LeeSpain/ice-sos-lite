import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Platform character limits
const PLATFORM_LIMITS: Record<string, number> = {
  twitter: 280,
  x: 280,
  instagram: 2200,
  facebook: 63206,
  linkedin: 3000,
};

interface QueueRow {
  id: string;
  content_id: string;
  platform: string;
  status: string;
  scheduled_time: string;
  posted_at: string | null;
  retry_count: number;
  max_retries: number;
  platform_post_id: string | null;
  error_message: string | null;
}

interface ContentRow {
  id: string;
  title: string | null;
  body_text: string | null;
}

function nowISO(): string {
  return new Date().toISOString();
}

function minutesFromNow(mins: number): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + mins);
  return d.toISOString();
}

function validateContentLength(platform: string, text: string): void {
  const key = platform.toLowerCase();
  const limit = PLATFORM_LIMITS[key] ?? 3000;
  if (text.length > limit) {
    throw new Error(`Content exceeds ${key} limit (${text.length}/${limit})`);
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceKey) {
    console.error('[posting-processor] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return new Response(
      JSON.stringify({ ok: false, error: 'Server misconfigured: missing env vars' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    const now = nowISO();
    console.log('[posting-processor] Processing queue at', now);

    // Load up to 10 queue items ready to process
    const { data: queueItems, error: loadError } = await supabase
      .from('social_media_posting_queue')
      .select('*')
      .in('status', ['queued', 'retry_scheduled'])
      .lte('scheduled_time', now)
      .order('scheduled_time', { ascending: true })
      .limit(10);

    if (loadError) {
      throw new Error(`Failed to load queue: ${loadError.message}`);
    }

    const items = (queueItems as QueueRow[] | null) ?? [];
    console.log('[posting-processor] Found', items.length, 'items to process');

    let processed = 0;
    let succeeded = 0;
    let failed = 0;
    const details: Array<Record<string, unknown>> = [];

    for (const item of items) {
      processed++;
      console.log('[posting-processor] Processing item', item.id, 'platform:', item.platform);

      try {
        // Load related marketing_content
        const { data: contentData, error: contentError } = await supabase
          .from('marketing_content')
          .select('id, title, body_text')
          .eq('id', item.content_id)
          .maybeSingle();

        if (contentError) {
          throw new Error(`Failed to load content: ${contentError.message}`);
        }
        if (!contentData) {
          throw new Error('Related content not found');
        }

        const content = contentData as ContentRow;
        const text = `${content.title ?? ''}\n\n${content.body_text ?? ''}`.trim();
        const platform = item.platform.toLowerCase();

        // Validate content length
        validateContentLength(platform, text);

        // SIMULATION MODE: Generate simulated post ID instead of real API call
        const simulatedPostId = `sim_${crypto.randomUUID()}`;
        console.log('[posting-processor] Simulated publish for', platform, '-> post_id:', simulatedPostId);

        // Update queue row to posted
        const { error: updateError } = await supabase
          .from('social_media_posting_queue')
          .update({
            status: 'posted',
            posted_at: now,
            platform_post_id: simulatedPostId,
            error_message: null,
            updated_at: now,
          })
          .eq('id', item.id);

        if (updateError) {
          throw new Error(`Failed to update queue: ${updateError.message}`);
        }

        succeeded++;
        details.push({
          id: item.id,
          platform: item.platform,
          status: 'posted',
          platform_post_id: simulatedPostId,
        });

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[posting-processor] Error processing item', item.id, ':', errorMessage);

        const nextRetryCount = (item.retry_count ?? 0) + 1;
        const maxRetries = item.max_retries ?? 3;
        const willRetry = nextRetryCount <= maxRetries;

        // Calculate new status and scheduled time
        const newStatus = willRetry ? 'retry_scheduled' : 'failed';
        const delayMinutes = Math.min(30, nextRetryCount * 5);
        const newScheduledTime = willRetry ? minutesFromNow(delayMinutes) : item.scheduled_time;

        // Update queue with error info
        const { error: updateError } = await supabase
          .from('social_media_posting_queue')
          .update({
            status: newStatus,
            retry_count: nextRetryCount,
            scheduled_time: newScheduledTime,
            error_message: errorMessage,
            updated_at: nowISO(),
          })
          .eq('id', item.id);

        if (updateError) {
          console.error('[posting-processor] Failed to update queue after error:', updateError.message);
        }

        if (newStatus === 'failed') {
          failed++;
        }

        details.push({
          id: item.id,
          platform: item.platform,
          status: newStatus,
          retry_count: nextRetryCount,
          error: errorMessage,
        });
      }
    }

    const result = { ok: true, processed, succeeded, failed, details };
    console.log('[posting-processor] Completed:', result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('[posting-processor] Fatal error:', errorMessage);

    return new Response(
      JSON.stringify({ ok: false, error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
