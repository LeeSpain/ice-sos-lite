import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const cronSecret = Deno.env.get('CRON_SECRET');

  if (!supabaseUrl || !serviceKey) {
    console.error('Missing required environment variables');
    return new Response(
      JSON.stringify({ error: 'Server misconfigured: missing env vars' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // Validate cron secret if configured
  const requestCronSecret = req.headers.get('x-cron-secret');
  if (cronSecret && cronSecret !== requestCronSecret) {
    console.error('Invalid or missing x-cron-secret header');
    return new Response(
      JSON.stringify({ error: 'Unauthorized: invalid cron secret' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  // If no CRON_SECRET is set, allow the request but log warning
  if (!cronSecret) {
    console.warn('CRON_SECRET not configured - allowing request without authentication');
  }

  const admin = createClient(supabaseUrl, serviceKey);

  try {
    const startTime = Date.now();
    const results: Record<string, any> = {
      success: true,
      ran_at: new Date().toISOString(),
      email: null,
      posting: null,
      errors: []
    };

    // 1. Process email queue
    console.log('[automation-runner] Invoking email-processor...');
    try {
      const { data: emailData, error: emailError } = await admin.functions.invoke('email-processor', {
        body: { action: 'process_queue', max_emails: 50 }
      });
      
      if (emailError) {
        console.error('[automation-runner] email-processor error:', emailError);
        results.errors.push({ component: 'email-processor', error: emailError.message });
        results.email = { success: false, error: emailError.message };
      } else {
        console.log('[automation-runner] email-processor result:', emailData);
        results.email = emailData;
      }
    } catch (emailErr: any) {
      console.error('[automation-runner] email-processor exception:', emailErr);
      results.errors.push({ component: 'email-processor', error: emailErr?.message || 'unknown' });
      results.email = { success: false, error: emailErr?.message || 'unknown' };
    }

    // 2. Process social media posting queue
    console.log('[automation-runner] Invoking posting-processor...');
    try {
      const { data: postingData, error: postingError } = await admin.functions.invoke('posting-processor', {
        body: {}
      });
      
      if (postingError) {
        console.error('[automation-runner] posting-processor error:', postingError);
        results.errors.push({ component: 'posting-processor', error: postingError.message });
        results.posting = { success: false, error: postingError.message };
      } else {
        console.log('[automation-runner] posting-processor result:', postingData);
        results.posting = postingData;
      }
    } catch (postingErr: any) {
      console.error('[automation-runner] posting-processor exception:', postingErr);
      results.errors.push({ component: 'posting-processor', error: postingErr?.message || 'unknown' });
      results.posting = { success: false, error: postingErr?.message || 'unknown' };
    }

    // Calculate duration
    results.duration_ms = Date.now() - startTime;
    results.success = results.errors.length === 0;

    console.log('[automation-runner] Complete:', results);

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (err: any) {
    console.error('[automation-runner] Fatal error:', err?.message || err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err?.message || 'unknown_error',
        ran_at: new Date().toISOString()
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
