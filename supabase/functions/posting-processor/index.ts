import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from "node:crypto";

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

interface OAuthAccount {
  id: string;
  user_id: string;
  platform: string;
  access_token: string | null;
  refresh_token: string | null;
  platform_user_id: string | null;
  platform_account_id: string | null;
  connection_status: string;
}

interface PublishResult {
  postId: string;
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

// ============ X (Twitter) OAuth 1.0a Publishing ============

function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(
    Object.entries(params)
      .sort()
      .map(([k, v]) => `${k}=${v}`)
      .join("&")
  )}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const hmacSha1 = createHmac("sha1", signingKey);
  return hmacSha1.update(signatureBaseString).digest("base64");
}

function generateOAuthHeader(method: string, url: string, accessToken: string, accessTokenSecret: string): string {
  const apiKey = Deno.env.get('X_API_KEY')?.trim();
  const apiSecret = Deno.env.get('X_API_KEY_SECRET')?.trim();

  if (!apiKey || !apiSecret) {
    throw new Error('Missing X_API_KEY or X_API_KEY_SECRET');
  }

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: apiKey,
    oauth_nonce: Math.random().toString(36).substring(2),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
  };

  const signature = generateOAuthSignature(method, url, oauthParams, apiSecret, accessTokenSecret);

  const signedOAuthParams = {
    ...oauthParams,
    oauth_signature: signature,
  };

  return (
    "OAuth " +
    Object.entries(signedOAuthParams)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(", ")
  );
}

async function publishToX(accessToken: string, accessTokenSecret: string, text: string): Promise<PublishResult> {
  // X/Twitter v2 API for posting tweets
  const url = 'https://api.x.com/2/tweets';
  const method = 'POST';

  // For OAuth 2.0 Bearer token (if that's what we have)
  // Check if we have OAuth 1.0a secrets available
  const apiKey = Deno.env.get('X_API_KEY')?.trim();
  const apiSecret = Deno.env.get('X_API_KEY_SECRET')?.trim();

  let authHeader: string;
  
  if (apiKey && apiSecret && accessTokenSecret) {
    // OAuth 1.0a flow
    authHeader = generateOAuthHeader(method, url, accessToken, accessTokenSecret);
  } else {
    // OAuth 2.0 Bearer token flow
    authHeader = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  const responseText = await response.text();
  console.log('[publishToX] Response:', response.status, responseText);

  if (!response.ok) {
    throw new Error(`X API error: ${response.status} - ${responseText}`);
  }

  const data = JSON.parse(responseText);
  if (!data.data?.id) {
    throw new Error('X API did not return a post ID');
  }

  return { postId: data.data.id };
}

// ============ LinkedIn Publishing ============

async function publishToLinkedIn(
  accessToken: string,
  text: string,
  platformAccountId?: string | null,
  platformUserId?: string | null
): Promise<PublishResult> {
  // LinkedIn requires author URN - use platformAccountId (org) or platformUserId (person)
  const authorUrn = platformAccountId 
    ? `urn:li:organization:${platformAccountId}`
    : `urn:li:person:${platformUserId}`;

  if (!platformAccountId && !platformUserId) {
    throw new Error('LinkedIn requires platform_account_id or platform_user_id');
  }

  const postData = {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: text,
        },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(postData),
  });

  const responseText = await response.text();
  console.log('[publishToLinkedIn] Response:', response.status, responseText);

  if (!response.ok) {
    throw new Error(`LinkedIn API error: ${response.status} - ${responseText}`);
  }

  const data = JSON.parse(responseText);
  // LinkedIn returns the post ID in the 'id' field or in the header 'x-restli-id'
  const postId = data.id || response.headers.get('x-restli-id');
  
  if (!postId) {
    throw new Error('LinkedIn API did not return a post ID');
  }

  return { postId };
}

// ============ Facebook Page Publishing ============

async function publishToFacebookPage(
  accessToken: string,
  text: string,
  pageId: string | null
): Promise<PublishResult> {
  if (!pageId) {
    throw new Error('Facebook publishing requires platform_account_id (page ID)');
  }

  // First, get page access token
  const pageTokenUrl = `https://graph.facebook.com/v18.0/${pageId}?fields=access_token&access_token=${accessToken}`;
  const pageTokenResponse = await fetch(pageTokenUrl);
  const pageTokenData = await pageTokenResponse.json();

  if (!pageTokenResponse.ok || !pageTokenData.access_token) {
    console.log('[publishToFacebookPage] Page token response:', pageTokenData);
    throw new Error(`Failed to get Facebook page access token: ${pageTokenData.error?.message || 'Unknown error'}`);
  }

  const pageAccessToken = pageTokenData.access_token;

  // Post to the page feed
  const postUrl = `https://graph.facebook.com/v18.0/${pageId}/feed`;
  const response = await fetch(postUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: text,
      access_token: pageAccessToken,
    }),
  });

  const responseText = await response.text();
  console.log('[publishToFacebookPage] Response:', response.status, responseText);

  if (!response.ok) {
    const errorData = JSON.parse(responseText);
    throw new Error(`Facebook API error: ${response.status} - ${errorData.error?.message || responseText}`);
  }

  const data = JSON.parse(responseText);
  if (!data.id) {
    throw new Error('Facebook API did not return a post ID');
  }

  return { postId: data.id };
}

// ============ Main Handler ============

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
        // 1. Load related marketing_content
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

        // 2. Load connected OAuth account for this platform
        const { data: oauthData, error: oauthError } = await supabase
          .from('social_media_oauth')
          .select('id, user_id, platform, access_token, refresh_token, platform_user_id, platform_account_id, connection_status')
          .eq('platform', platform === 'x' ? 'twitter' : platform) // Handle x/twitter alias
          .eq('connection_status', 'connected')
          .limit(1)
          .maybeSingle();

        if (oauthError) {
          throw new Error(`Failed to load OAuth account: ${oauthError.message}`);
        }

        // Also try 'twitter' if platform is 'x' and no result
        let account = oauthData as OAuthAccount | null;
        if (!account && platform === 'x') {
          const { data: twitterData } = await supabase
            .from('social_media_oauth')
            .select('id, user_id, platform, access_token, refresh_token, platform_user_id, platform_account_id, connection_status')
            .eq('platform', 'x')
            .eq('connection_status', 'connected')
            .limit(1)
            .maybeSingle();
          account = twitterData as OAuthAccount | null;
        }

        if (!account || !account.access_token) {
          throw new Error(`No connected ${platform} account with valid access token`);
        }

        console.log('[posting-processor] Found OAuth account:', account.id, 'platform:', account.platform);

        // 3. Publish to the platform
        let result: PublishResult;

        switch (platform) {
          case 'x':
          case 'twitter':
            // For X, we need the refresh_token as access_token_secret for OAuth 1.0a
            // Or just use OAuth 2.0 bearer token if that's what we stored
            result = await publishToX(
              account.access_token,
              account.refresh_token || '', // OAuth 1.0a token secret, empty for OAuth 2.0
              text
            );
            break;

          case 'linkedin':
            result = await publishToLinkedIn(
              account.access_token,
              text,
              account.platform_account_id,
              account.platform_user_id
            );
            break;

          case 'facebook':
            result = await publishToFacebookPage(
              account.access_token,
              text,
              account.platform_account_id
            );
            break;

          case 'instagram':
            // Instagram publishing requires different approach (Instagram Graph API)
            // For now, throw not implemented
            throw new Error('Instagram publishing not yet implemented - requires Instagram Graph API with media upload');

          default:
            throw new Error(`Unsupported platform: ${platform}`);
        }

        console.log('[posting-processor] Published successfully:', platform, '-> post_id:', result.postId);

        // 4. Update queue row to posted
        const { error: updateError } = await supabase
          .from('social_media_posting_queue')
          .update({
            status: 'posted',
            posted_at: now,
            platform_post_id: result.postId,
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
          platform_post_id: result.postId,
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
