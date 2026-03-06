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
  adapted_text: string | null;
  adapted_hashtags: string[] | null;
  metadata: Record<string, any> | null;
  oauth_account_id: string | null;
}

interface ContentRow {
  id: string;
  title: string | null;
  body_text: string | null;
  image_url: string | null;
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
  expires_at: string | null;
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

// ============ Token Refresh Helper ============

async function refreshTokenIfNeeded(account: OAuthAccount, supabase: any): Promise<OAuthAccount> {
  if (!account.expires_at) return account; // token has no expiry info

  const expiresAt = new Date(account.expires_at).getTime();
  const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;

  if (expiresAt > fiveMinutesFromNow) return account; // still valid

  console.log(`[posting-processor] Token expiring soon for ${account.platform}, refreshing...`);

  try {
    const { data, error } = await supabase.functions.invoke('social-media-oauth', {
      body: { action: 'refresh', platform: account.platform, user_id: account.user_id },
    });
    if (error) throw error;

    // Re-fetch updated account
    const { data: refreshed } = await supabase
      .from('social_media_oauth')
      .select('id, user_id, platform, access_token, refresh_token, platform_user_id, platform_account_id, connection_status, expires_at')
      .eq('id', account.id)
      .single();

    return refreshed || account;
  } catch (e) {
    console.warn(`[posting-processor] Token refresh failed for ${account.platform}:`, e);
    return account; // Proceed with existing token; will fail if truly expired
  }
}

// ============ X/Twitter Publishing ============

async function publishToX(accessToken: string, text: string, imageUrl?: string | null): Promise<PublishResult> {
  console.log('[publishToX] Posting tweet');

  let mediaIds: string[] | undefined;

  if (imageUrl && imageUrl.startsWith('http')) {
    try {
      // Download image and upload to Twitter v1.1 media endpoint
      const imgResponse = await fetch(imageUrl);
      if (imgResponse.ok) {
        const imgBuffer = await imgResponse.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(imgBuffer)));

        const mediaResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ media_data: base64 }),
        });

        if (mediaResponse.ok) {
          const mediaData = await mediaResponse.json();
          if (mediaData.media_id_string) {
            mediaIds = [mediaData.media_id_string];
            console.log('[publishToX] Uploaded media:', mediaIds);
          }
        } else {
          console.warn('[publishToX] Media upload failed, posting text-only');
        }
      }
    } catch (mediaErr) {
      console.warn('[publishToX] Media upload error:', mediaErr);
    }
  }

  const tweetBody: Record<string, any> = { text };
  if (mediaIds) {
    tweetBody.media = { media_ids: mediaIds };
  }

  const response = await fetch('https://api.twitter.com/2/tweets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(tweetBody),
  });

  const responseText = await response.text();
  console.log('[publishToX] Response:', response.status, responseText);

  if (!response.ok) {
    throw new Error(`X API error ${response.status}: ${responseText}`);
  }

  const data = JSON.parse(responseText);
  const postId = data.data?.id;

  if (!postId) {
    throw new Error(`X API did not return post ID. Response: ${responseText}`);
  }

  return { postId };
}

// ============ LinkedIn Publishing ============

async function publishToLinkedIn(
  accessToken: string,
  text: string,
  platformAccountId?: string | null,
  platformUserId?: string | null,
  imageUrl?: string | null
): Promise<PublishResult> {
  let authorUrn: string;

  if (platformAccountId && platformAccountId.startsWith('urn:')) {
    authorUrn = platformAccountId;
  } else if (platformAccountId) {
    authorUrn = `urn:li:organization:${platformAccountId}`;
    console.log('[publishToLinkedIn] Posting as organization:', authorUrn);
  } else if (platformUserId) {
    authorUrn = `urn:li:person:${platformUserId}`;
    console.log('[publishToLinkedIn] Posting as member:', authorUrn);
  } else {
    throw new Error('LinkedIn requires platform_account_id (org) or platform_user_id (person)');
  }

  let shareMediaCategory = 'NONE';
  let media: any[] | undefined;

  // Register image with LinkedIn Assets API if available
  if (imageUrl && imageUrl.startsWith('http')) {
    try {
      // Step 1: Register upload
      const registerResp = await fetch('https://api.linkedin.com/v2/assets?action=registerUpload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: authorUrn,
            serviceRelationships: [{ relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' }],
          },
        }),
      });

      if (registerResp.ok) {
        const registerData = await registerResp.json();
        const uploadUrl = registerData.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl;
        const assetId = registerData.value?.asset;

        if (uploadUrl && assetId) {
          // Step 2: Upload image bytes
          const imgResp = await fetch(imageUrl);
          if (imgResp.ok) {
            const imgBuffer = await imgResp.arrayBuffer();
            const uploadResp = await fetch(uploadUrl, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${accessToken}` },
              body: imgBuffer,
            });

            if (uploadResp.ok) {
              shareMediaCategory = 'IMAGE';
              media = [{ status: 'READY', description: { text: '' }, media: assetId, title: { text: '' } }];
              console.log('[publishToLinkedIn] Uploaded image asset:', assetId);
            }
          }
        }
      }
    } catch (imgErr) {
      console.warn('[publishToLinkedIn] Image upload failed, posting text-only:', imgErr);
    }
  }

  const postData: Record<string, any> = {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text },
        shareMediaCategory,
        ...(media ? { media } : {}),
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'X-Restli-Protocol-Version': '2.0.0',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(postData),
  });

  const responseText = await response.text();
  console.log('[publishToLinkedIn] Response:', response.status, responseText);

  if (!response.ok) {
    throw new Error(`LinkedIn API error ${response.status}: ${responseText}`);
  }

  let postId: string | null = null;
  try {
    const data = JSON.parse(responseText);
    postId = data.id;
  } catch { /* empty */ }

  if (!postId) {
    postId = response.headers.get('x-restli-id');
  }

  if (!postId) {
    throw new Error(`LinkedIn API did not return post ID. Response: ${responseText}`);
  }

  return { postId };
}

// ============ Facebook Page Publishing ============

async function publishToFacebookPage(
  accessToken: string,
  text: string,
  pageId: string | null,
  imageUrl?: string | null
): Promise<PublishResult> {
  if (!pageId) {
    throw new Error('Facebook publishing requires platform_account_id (PAGE_ID)');
  }

  console.log('[publishToFacebookPage] Posting to page:', pageId);

  const params: Record<string, string> = {
    message: text,
    access_token: accessToken,
  };

  // Add photo if image URL is a public URL
  if (imageUrl && imageUrl.startsWith('http')) {
    params.link = imageUrl; // Facebook will render as a link preview with image
  }

  const response = await fetch(`https://graph.facebook.com/v19.0/${pageId}/feed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });

  const responseText = await response.text();
  console.log('[publishToFacebookPage] Response:', response.status, responseText);

  if (!response.ok) {
    throw new Error(`Facebook API error ${response.status}: ${responseText}`);
  }

  const data = JSON.parse(responseText);
  const postId = data.id;

  if (!postId) {
    throw new Error(`Facebook API did not return post ID. Response: ${responseText}`);
  }

  return { postId };
}

// ============ Instagram Business Publishing (2-step container API) ============

async function publishToInstagram(
  accessToken: string,
  caption: string,
  igUserId: string | null,
  imageUrl?: string | null
): Promise<PublishResult> {
  if (!igUserId) {
    throw new Error('Instagram publishing requires Instagram Business User ID (platform_account_id)');
  }

  if (!imageUrl || !imageUrl.startsWith('http')) {
    throw new Error('Instagram posting requires a publicly accessible image URL');
  }

  console.log('[publishToInstagram] Step 1: Creating media container for IG user:', igUserId);

  // Step 1: Create media container
  const containerParams = new URLSearchParams({
    image_url: imageUrl,
    caption,
    access_token: accessToken,
  });

  const containerResp = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: containerParams,
  });

  const containerText = await containerResp.text();
  console.log('[publishToInstagram] Container response:', containerResp.status, containerText);

  if (!containerResp.ok) {
    throw new Error(`Instagram container creation failed ${containerResp.status}: ${containerText}`);
  }

  const containerData = JSON.parse(containerText);
  const containerId = containerData.id;

  if (!containerId) {
    throw new Error(`Instagram did not return container ID. Response: ${containerText}`);
  }

  // Step 2: Publish the container
  console.log('[publishToInstagram] Step 2: Publishing container:', containerId);

  const publishResp = await fetch(`https://graph.facebook.com/v19.0/${igUserId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      creation_id: containerId,
      access_token: accessToken,
    }),
  });

  const publishText = await publishResp.text();
  console.log('[publishToInstagram] Publish response:', publishResp.status, publishText);

  if (!publishResp.ok) {
    throw new Error(`Instagram publish failed ${publishResp.status}: ${publishText}`);
  }

  const publishData = JSON.parse(publishText);
  const postId = publishData.id;

  if (!postId) {
    throw new Error(`Instagram did not return post ID. Response: ${publishText}`);
  }

  return { postId };
}

// ============ Publish one queue item ============

async function processQueueItem(item: QueueRow, supabase: any): Promise<{ success: boolean; postId?: string; error?: string }> {
  // Load marketing content
  const { data: contentData, error: contentError } = await supabase
    .from('marketing_content')
    .select('id, title, body_text, image_url')
    .eq('id', item.content_id)
    .maybeSingle();

  if (contentError) throw new Error(`Failed to load content: ${contentError.message}`);
  if (!contentData) throw new Error('Related content not found');

  const content = contentData as ContentRow;
  // Prefer adapted_text from queue row (set by platform-content-adapter), fall back to raw content
  const text = item.adapted_text
    ? item.adapted_text
    : `${content.title ?? ''}\n\n${content.body_text ?? ''}`.trim();

  // Image: prefer queue metadata, fall back to content image_url
  const imageUrl: string | null = item.metadata?.image_url || content.image_url || null;

  const platform = item.platform.toLowerCase();
  validateContentLength(platform, text);

  // Load OAuth account — prefer oauth_account_id stored on queue row
  let account: OAuthAccount | null = null;
  if (item.oauth_account_id) {
    const { data: oauthData } = await supabase
      .from('social_media_oauth')
      .select('id, user_id, platform, access_token, refresh_token, platform_user_id, platform_account_id, connection_status, expires_at')
      .eq('id', item.oauth_account_id)
      .maybeSingle();
    account = oauthData as OAuthAccount | null;
  }

  // Fallback: find any connected account for this platform
  if (!account || !account.access_token) {
    const lookupPlatform = platform === 'x' ? 'twitter' : platform;
    const { data: oauthData } = await supabase
      .from('social_media_oauth')
      .select('id, user_id, platform, access_token, refresh_token, platform_user_id, platform_account_id, connection_status, expires_at')
      .eq('platform', lookupPlatform)
      .eq('connection_status', 'connected')
      .limit(1)
      .maybeSingle();
    account = oauthData as OAuthAccount | null;
  }

  if (!account || !account.access_token) {
    throw new Error(`No connected ${platform} account with valid access token`);
  }

  // Refresh token if expiring soon
  account = await refreshTokenIfNeeded(account, supabase);

  console.log('[posting-processor] Publishing to', platform, 'with account:', account.id);

  let result: PublishResult;

  switch (platform) {
    case 'x':
    case 'twitter':
      result = await publishToX(account.access_token, text, imageUrl);
      break;

    case 'linkedin':
      result = await publishToLinkedIn(
        account.access_token,
        text,
        account.platform_account_id,
        account.platform_user_id,
        imageUrl
      );
      break;

    case 'facebook':
      result = await publishToFacebookPage(
        account.access_token,
        text,
        account.platform_account_id,
        imageUrl
      );
      break;

    case 'instagram':
      result = await publishToInstagram(
        account.access_token,
        text,
        account.platform_account_id,
        imageUrl
      );
      break;

    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  return { success: true, postId: result.postId };
}

// ============ Main Handler ============

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceKey) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Server misconfigured: missing env vars' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  try {
    let body: Record<string, any> = {};
    try {
      body = await req.json();
    } catch { /* empty body is ok for queue processing */ }

    const action = body.action || 'process_queue';
    const now = nowISO();

    // ---- ACTION: publish_to_all ----
    // Publishes a specific content_id to all specified platforms in parallel.
    // Called from the MultiPlatformPublisher UI after platform-content-adapter has queued rows.
    if (action === 'publish_to_all') {
      const { content_id, platforms } = body;
      if (!content_id) {
        return new Response(
          JSON.stringify({ ok: false, error: 'content_id required for publish_to_all' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      console.log('[posting-processor] publish_to_all for content_id:', content_id, 'platforms:', platforms);

      // Fetch queued rows for this content
      let query = supabase
        .from('social_media_posting_queue')
        .select('*')
        .eq('content_id', content_id)
        .in('status', ['queued', 'scheduled', 'retry_scheduled']);

      if (platforms && Array.isArray(platforms) && platforms.length > 0) {
        query = query.in('platform', platforms);
      }

      const { data: queueItems, error: loadError } = await query;
      if (loadError) throw new Error(`Failed to load queue: ${loadError.message}`);

      const items = (queueItems as QueueRow[] | null) ?? [];
      console.log('[posting-processor] publish_to_all: found', items.length, 'queue rows');

      // Publish all platforms in parallel
      const publishResults = await Promise.allSettled(
        items.map(async (item) => {
          try {
            const result = await processQueueItem(item, supabase);

            await supabase.from('social_media_posting_queue').update({
              status: 'posted',
              posted_at: now,
              platform_post_id: result.postId,
              error_message: null,
              updated_at: now,
            }).eq('id', item.id);

            return { id: item.id, platform: item.platform, status: 'posted', platform_post_id: result.postId };
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            console.error('[posting-processor] publish_to_all error for', item.platform, ':', errorMessage);

            await supabase.from('social_media_posting_queue').update({
              status: 'failed',
              error_message: errorMessage,
              updated_at: nowISO(),
            }).eq('id', item.id);

            return { id: item.id, platform: item.platform, status: 'failed', error: errorMessage };
          }
        })
      );

      const details = publishResults.map((r) => r.status === 'fulfilled' ? r.value : { error: r.reason?.message });

      return new Response(
        JSON.stringify({ ok: true, content_id, details }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // ---- ACTION: process_queue (default cron run) ----
    console.log('[posting-processor] Processing queue at', now);

    const { data: queueItems, error: loadError } = await supabase
      .from('social_media_posting_queue')
      .select('*')
      .in('status', ['queued', 'retry_scheduled'])
      .lte('scheduled_time', now)
      .order('scheduled_time', { ascending: true })
      .limit(10);

    if (loadError) throw new Error(`Failed to load queue: ${loadError.message}`);

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
        const result = await processQueueItem(item, supabase);

        await supabase.from('social_media_posting_queue').update({
          status: 'posted',
          posted_at: now,
          platform_post_id: result.postId,
          error_message: null,
          updated_at: now,
        }).eq('id', item.id);

        succeeded++;
        details.push({ id: item.id, platform: item.platform, status: 'posted', platform_post_id: result.postId });

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('[posting-processor] Error processing item', item.id, ':', errorMessage);

        const nextRetryCount = (item.retry_count ?? 0) + 1;
        const maxRetries = item.max_retries ?? 3;
        const willRetry = nextRetryCount <= maxRetries;
        const newStatus = willRetry ? 'retry_scheduled' : 'failed';
        const delayMinutes = Math.min(30, nextRetryCount * 5);
        const newScheduledTime = willRetry ? minutesFromNow(delayMinutes) : item.scheduled_time;

        await supabase.from('social_media_posting_queue').update({
          status: newStatus,
          retry_count: nextRetryCount,
          scheduled_time: newScheduledTime,
          error_message: errorMessage,
          updated_at: nowISO(),
        }).eq('id', item.id);

        if (newStatus === 'failed') failed++;

        details.push({ id: item.id, platform: item.platform, status: newStatus, retry_count: nextRetryCount, error: errorMessage });
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
