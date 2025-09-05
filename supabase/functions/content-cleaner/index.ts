import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { action = 'dry_run', confirm = false } = body || {};

    // Require auth and admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Missing Authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false }, global: { headers: { Authorization: authHeader } } });
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const { data: userData, error: userErr } = await userSupabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ success: false, error: 'Authentication failed' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: profile, error: profileErr } = await serviceSupabase
      .from('profiles')
      .select('role')
      .eq('user_id', userData.user.id)
      .single();

    if (profileErr || profile?.role !== 'admin') {
      return new Response(JSON.stringify({ success: false, error: 'Admin privileges required' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 1) Count non-published marketing content
    const { count: nonPublishedCount, error: countErr } = await serviceSupabase
      .from('marketing_content')
      .select('id', { count: 'exact', head: true })
      .neq('status', 'published');

    if (countErr) throw countErr;

    // 2) Determine campaigns that have published content
    const { data: pubRows, error: pubErr } = await serviceSupabase
      .from('marketing_content')
      .select('campaign_id')
      .eq('status', 'published');
    if (pubErr) throw pubErr;

    const publishedCampaignIds = new Set<string>((pubRows || []).map(r => r.campaign_id).filter(Boolean));

    // 3) Fetch campaigns not running
    const { data: campaignRows, error: cErr } = await serviceSupabase
      .from('marketing_campaigns')
      .select('id,status');
    if (cErr) throw cErr;

    const campaignsToDelete = (campaignRows || [])
      .filter(c => c.status !== 'running' && !publishedCampaignIds.has(c.id));

    const result = {
      action,
      candidates: {
        nonPublishedContent: nonPublishedCount || 0,
        campaignsWithoutPublished: campaignsToDelete.length,
      },
      deleted: { content: 0, campaigns: 0 },
      success: true,
    } as any;

    if (action === 'execute') {
      if (!confirm) {
        return new Response(JSON.stringify({ success: false, error: 'Confirmation required. Pass { confirm: true }.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      // Delete non-published content first
      if ((nonPublishedCount || 0) > 0) {
        const { error: delContentErr } = await serviceSupabase
          .from('marketing_content')
          .delete()
          .neq('status', 'published');
        if (delContentErr) throw delContentErr;
        result.deleted.content = nonPublishedCount || 0;
      }

      // Then delete campaigns that have no published content and are not running
      const ids = campaignsToDelete.map(c => c.id);
      if (ids.length > 0) {
        const { error: delCampErr } = await serviceSupabase
          .from('marketing_campaigns')
          .delete()
          .in('id', ids);
        if (delCampErr) throw delCampErr;
        result.deleted.campaigns = ids.length;
      }
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('content-cleaner error', e);
    return new Response(JSON.stringify({ success: false, error: e?.message || String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
