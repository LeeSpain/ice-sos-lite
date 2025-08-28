import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  try {
    const { action, contentId, platforms, scheduledTime } = await req.json();
    console.log(`Content Publisher - Action: ${action}`);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      supabaseClient.auth.setSession({ access_token: authHeader.replace('Bearer ', ''), refresh_token: '' });
    }

    if (action === 'publish') {
      return await publishContent(contentId, platforms, supabaseClient, scheduledTime);
    } else if (action === 'schedule') {
      return await scheduleContent(contentId, platforms, scheduledTime, supabaseClient);
    } else if (action === 'process_queue') {
      return await processPublishingQueue(supabaseClient);
    } else {
      throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Content Publisher Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function publishContent(contentId: string, platforms: string[], supabase: any, scheduledTime?: string) {
  // Get content details
  const { data: content, error: contentError } = await supabase
    .from('marketing_content')
    .select('*')
    .eq('id', contentId)
    .single();

  if (contentError || !content) {
    throw new Error('Content not found');
  }

  const results = [];

  for (const platform of platforms) {
    try {
      // Get platform account
      const { data: account } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('platform', platform)
        .eq('is_active', true)
        .single();

      if (!account) {
        throw new Error(`No active ${platform} account found`);
      }

      // Check if token needs refresh
      if (account.token_expires_at && new Date(account.token_expires_at) <= new Date()) {
        await refreshAccountToken(account, supabase);
      }

      let publishResult;
      if (scheduledTime && new Date(scheduledTime) > new Date()) {
        // Schedule for later
        publishResult = await schedulePost(content, account, scheduledTime, supabase);
      } else {
        // Publish immediately
        publishResult = await publishToPost(content, account);
      }

      // Update content with platform post ID
      await supabase
        .from('marketing_content')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          metadata: {
            ...content.metadata,
            [platform]: publishResult
          }
        })
        .eq('id', contentId);

      // Record analytics
      await supabase
        .from('social_media_analytics')
        .insert({
          content_id: contentId,
          platform,
          platform_post_id: publishResult.id,
          synced_at: new Date().toISOString()
        });

      results.push({
        platform,
        success: true,
        postId: publishResult.id,
        url: publishResult.url
      });

    } catch (error) {
      console.error(`Failed to publish to ${platform}:`, error);
      results.push({
        platform,
        success: false,
        error: error.message
      });
    }
  }

  return new Response(
    JSON.stringify({ results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function scheduleContent(contentId: string, platforms: string[], scheduledTime: string, supabase: any) {
  // Add to posting queue
  const queueItems = platforms.map(platform => ({
    content_id: contentId,
    platform,
    scheduled_time: scheduledTime,
    status: 'scheduled'
  }));

  const { error } = await supabase
    .from('posting_queue')
    .insert(queueItems);

  if (error) {
    throw new Error(`Failed to schedule content: ${error.message}`);
  }

  return new Response(
    JSON.stringify({ success: true, scheduled: platforms.length }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function processPublishingQueue(supabase: any) {
  // Get all scheduled posts that are ready to publish
  const { data: queueItems } = await supabase
    .from('posting_queue')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_time', new Date().toISOString())
    .limit(50);

  if (!queueItems || queueItems.length === 0) {
    return new Response(
      JSON.stringify({ processed: 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  let processed = 0;

  for (const item of queueItems) {
    try {
      // Update status to processing
      await supabase
        .from('posting_queue')
        .update({ status: 'processing' })
        .eq('id', item.id);

      // Publish the content
      await publishContent(item.content_id, [item.platform], supabase);

      // Mark as completed
      await supabase
        .from('posting_queue')
        .update({ 
          status: 'completed',
          posted_at: new Date().toISOString()
        })
        .eq('id', item.id);

      processed++;

    } catch (error) {
      console.error(`Failed to process queue item ${item.id}:`, error);
      
      // Update retry count and status
      await supabase
        .from('posting_queue')
        .update({ 
          status: 'failed',
          error_message: error.message,
          retry_count: (item.retry_count || 0) + 1
        })
        .eq('id', item.id);
    }
  }

  return new Response(
    JSON.stringify({ processed }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function publishToPost(content: any, account: any) {
  const platform = account.platform;
  
  switch (platform) {
    case 'facebook':
      return await publishToFacebook(content, account);
    case 'instagram':
      return await publishToInstagram(content, account);
    case 'twitter':
      return await publishToTwitter(content, account);
    case 'linkedin':
      return await publishToLinkedIn(content, account);
    case 'youtube':
      return await publishToYouTube(content, account);
    case 'tiktok':
      return await publishToTikTok(content, account);
    default:
      throw new Error(`Publishing to ${platform} not implemented`);
  }
}

async function publishToFacebook(content: any, account: any) {
  const pageId = account.page_id;
  const url = `https://graph.facebook.com/v18.0/${pageId}/feed`;
  
  const postData = {
    message: content.body,
    access_token: account.access_token
  };

  if (content.image_url) {
    postData.link = content.image_url;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData)
  });

  if (!response.ok) {
    throw new Error(`Facebook API error: ${await response.text()}`);
  }

  const result = await response.json();
  return {
    id: result.id,
    url: `https://facebook.com/${result.id}`
  };
}

async function publishToInstagram(content: any, account: any) {
  // Instagram requires a two-step process: create media object, then publish
  const mediaUrl = `https://graph.facebook.com/v18.0/${account.platform_user_id}/media`;
  
  const mediaData = {
    image_url: content.image_url,
    caption: content.body,
    access_token: account.access_token
  };

  const mediaResponse = await fetch(mediaUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mediaData)
  });

  if (!mediaResponse.ok) {
    throw new Error(`Instagram media creation error: ${await mediaResponse.text()}`);
  }

  const mediaResult = await mediaResponse.json();
  
  // Publish the media
  const publishUrl = `https://graph.facebook.com/v18.0/${account.platform_user_id}/media_publish`;
  const publishData = {
    creation_id: mediaResult.id,
    access_token: account.access_token
  };

  const publishResponse = await fetch(publishUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(publishData)
  });

  if (!publishResponse.ok) {
    throw new Error(`Instagram publish error: ${await publishResponse.text()}`);
  }

  const result = await publishResponse.json();
  return {
    id: result.id,
    url: `https://instagram.com/p/${result.id}`
  };
}

async function publishToTwitter(content: any, account: any) {
  const url = 'https://api.twitter.com/2/tweets';
  
  const tweetData = {
    text: content.body
  };

  // Add media if available
  if (content.image_url) {
    // Would need to upload media first, then attach media_ids
    // This is a simplified version
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${account.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(tweetData)
  });

  if (!response.ok) {
    throw new Error(`Twitter API error: ${await response.text()}`);
  }

  const result = await response.json();
  return {
    id: result.data.id,
    url: `https://twitter.com/user/status/${result.data.id}`
  };
}

async function publishToLinkedIn(content: any, account: any) {
  const url = 'https://api.linkedin.com/v2/ugcPosts';
  
  const postData = {
    author: `urn:li:person:${account.platform_user_id}`,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text: content.body
        },
        shareMediaCategory: 'NONE'
      }
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${account.access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(postData)
  });

  if (!response.ok) {
    throw new Error(`LinkedIn API error: ${await response.text()}`);
  }

  const result = await response.json();
  return {
    id: result.id,
    url: `https://linkedin.com/feed/update/${result.id}`
  };
}

async function publishToYouTube(content: any, account: any) {
  // YouTube uploads are more complex and require video files
  // This is a placeholder for the implementation
  throw new Error('YouTube publishing not yet implemented');
}

async function publishToTikTok(content: any, account: any) {
  // TikTok uploads require video files
  // This is a placeholder for the implementation
  throw new Error('TikTok publishing not yet implemented');
}

async function refreshAccountToken(account: any, supabase: any) {
  // Call the OAuth handler to refresh the token
  const refreshResponse = await supabase.functions.invoke('social-oauth-handler', {
    body: {
      platform: account.platform,
      action: 'refresh'
    }
  });

  if (refreshResponse.error) {
    throw new Error(`Failed to refresh token: ${refreshResponse.error}`);
  }
}

async function schedulePost(content: any, account: any, scheduledTime: string, supabase: any) {
  // Add to posting queue
  const { error } = await supabase
    .from('posting_queue')
    .insert({
      content_id: content.id,
      platform: account.platform,
      scheduled_time: scheduledTime,
      status: 'scheduled'
    });

  if (error) {
    throw new Error(`Failed to schedule post: ${error.message}`);
  }

  return {
    id: 'scheduled',
    scheduled_time: scheduledTime
  };
}