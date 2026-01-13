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
  oauth_account_id: string | null;
}

interface ContentRow {
  id: string;
  title: string | null;
  body_text: string | null;
  platform: string | null;
  image_url: string | null;
}

interface OAuthRow {
  id: string;
  user_id: string;
  platform: string;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  platform_user_id: string | null;
  connection_status: string;
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

// ==================== REAL PLATFORM PUBLISHING ====================

async function publishToFacebook(content: ContentRow, oauth: OAuthRow): Promise<{ post_id: string; post_url: string }> {
  const postData: any = {
    message: content.body_text || content.title || '',
    access_token: oauth.access_token
  };

  // Add image if available
  if (content.image_url) {
    postData.picture = content.image_url;
  }

  const response = await fetch(`https://graph.facebook.com/v18.0/me/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'Facebook publish failed');
  }

  return {
    post_id: result.id,
    post_url: `https://facebook.com/${result.id}`
  };
}

async function publishToLinkedIn(content: ContentRow, oauth: OAuthRow): Promise<{ post_id: string; post_url: string }> {
  const postData = {
    author: `urn:li:person:${oauth.platform_user_id}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content.body_text || content.title || ''
        },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${oauth.access_token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0'
    },
    body: JSON.stringify(postData)
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'LinkedIn publish failed');
  }

  return {
    post_id: result.id,
    post_url: `https://linkedin.com/feed/update/${result.id}`
  };
}

async function publishToTwitter(content: ContentRow, oauth: OAuthRow): Promise<{ post_id: string; post_url: string }> {
  const text = (content.body_text || content.title || '').substring(0, 280); // Twitter character limit
  
  const postData = { text };

  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${oauth.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.detail || result.title || 'Twitter publish failed');
  }

  return {
    post_id: result.data.id,
    post_url: `https://twitter.com/user/status/${result.data.id}`
  };
}

async function publishToPlatform(platform: string, content: ContentRow, oauth: OAuthRow): Promise<{ post_id: string; post_url: string }> {
  const platformLower = platform.toLowerCase();
  
  switch (platformLower) {
    case 'facebook':
      return await publishToFacebook(content, oauth);
    case 'linkedin':
      return await publishToLinkedIn(content, oauth);
    case 'twitter':
    case 'x':
      return await publishToTwitter(content, oauth);
    case 'instagram':
      throw new Error('Instagram publishing requires Instagram Business API setup - please use Facebook Business Suite');
    default:
      throw new Error(`Publishing to ${platform} is not yet implemented`);
  }
}

// ==================== MAIN PROCESSOR ====================

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
        // Load content
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

        // Load OAuth credentials
        let oauth: OAuthRow | null = null;
        
        if (item.oauth_account_id) {
          const { data: oauthData, error: oErr } = await admin
            .from('social_media_oauth')
            .select('*')
            .eq('id', item.oauth_account_id)
            .eq('connection_status', 'active')
            .maybeSingle();
          
          if (oErr) {
            console.warn(`OAuth lookup error: ${oErr.message}`);
          }
          oauth = oauthData as OAuthRow | null;
        }

        let postResult: { post_id: string; post_url: string };
        
        if (oauth && oauth.access_token) {
          // Check if token is expired
          if (oauth.token_expires_at && new Date(oauth.token_expires_at) < new Date()) {
            throw new Error(`${platform} access token expired - please reconnect your account`);
          }
          
          // REAL PUBLISHING
          console.log(`[posting-processor] Publishing to ${platform} for content ${item.content_id}...`);
          postResult = await publishToPlatform(platform, c, oauth);
          console.log(`[posting-processor] Successfully published to ${platform}: ${postResult.post_id}`);
        } else {
          // No credentials - fail gracefully with clear message
          throw new Error(`No active ${platform} credentials found - please connect your ${platform} account in Social Hub`);
        }

        // Update queue to posted
        const { error: upQueueErr } = await admin
          .from('social_media_posting_queue')
          .update({
            status: 'posted',
            posted_at: now,
            platform_post_id: postResult.post_id,
            error_message: null,
          })
          .eq('id', item.id);
        if (upQueueErr) throw new Error(`Update queue failed: ${upQueueErr.message}`);

        // Update content status
        const { error: upContentErr } = await admin
          .from('marketing_content')
          .update({ status: 'posted', posted_at: now })
          .eq('id', item.content_id);
        if (upContentErr) throw new Error(`Update content failed: ${upContentErr.message}`);

        succeeded++;
        details.push({ 
          id: item.id, 
          platform, 
          status: 'posted', 
          post_id: postResult.post_id,
          post_url: postResult.post_url 
        });
        
      } catch (e: any) {
        console.error('posting-processor error on item', item.id, e?.message || e);
        const nextRetry = (item.retry_count ?? 0) + 1;
        const max = item.max_retries ?? 3;
        const willRetry = nextRetry <= max;
        
        // Don't retry auth/credential errors - they won't fix themselves
        const isAuthError = e?.message?.includes('credentials') || 
                           e?.message?.includes('expired') || 
                           e?.message?.includes('reconnect');
        
        const newStatus = (!willRetry || isAuthError) ? 'failed' : 'retry_scheduled';
        const newTime = willRetry && !isAuthError ? minutesFromNow(Math.min(30, nextRetry * 5)) : item.scheduled_time;

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

        if (newStatus === 'failed') failed++;
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
