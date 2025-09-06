import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');

    // Validate user via anon client and token
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: userError } = await userSupabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Service client for DB operations
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });

    // Ensure user is admin
    const { data: profile, error: profileError } = await serviceSupabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: admin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request payload once
    const payload = await req.json().catch(() => ({}));
    const { action, contentId } = payload as { action?: string; contentId?: string };

    switch (action) {
      case 'process_queue':
        return await processPostingQueue(serviceSupabase);
      case 'post_now':
        if (!contentId) {
          return new Response(JSON.stringify({ error: 'contentId is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        return await postContentNow(contentId, serviceSupabase);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Posting processor error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processPostingQueue(supabase: any) {
  console.log('Processing posting queue...');
  
  // Get scheduled posts that are ready to be published
  const { data: queueItems, error } = await supabase
    .from('posting_queue')
    .select(`
      *,
      marketing_content (*)
    `)
    .eq('status', 'scheduled')
    .lte('scheduled_time', new Date().toISOString())
    .limit(10);

  if (error) {
    console.error('Error fetching queue items:', error);
    throw error;
  }

  const processed = [];
  
  for (const item of queueItems || []) {
    try {
      await postToSocialMedia(item.marketing_content, item.platform);
      
      // Update queue item status
      await supabase
        .from('posting_queue')
        .update({
          status: 'completed',
          posted_at: new Date().toISOString()
        })
        .eq('id', item.id);

      // Update content status
      await supabase
        .from('marketing_content')
        .update({
          status: 'published',
          posted_at: new Date().toISOString()
        })
        .eq('id', item.content_id);

      processed.push(item.id);
      console.log(`Posted content ${item.content_id} to ${item.platform}`);
      
    } catch (error) {
      console.error(`Error posting ${item.id}:`, error);
      
      // Update with error status
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

  return new Response(JSON.stringify({ 
    processed: processed.length,
    failed: (queueItems?.length || 0) - processed.length 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function postContentNow(contentId: string, supabase: any) {
  console.log(`Posting content ${contentId} immediately`);
  
  const { data: content, error } = await supabase
    .from('marketing_content')
    .select('*')
    .eq('id', contentId)
    .single();

  if (error || !content) {
    throw new Error('Content not found');
  }

  await postToSocialMedia(content, content.platform);

  // Update content status
  await supabase
    .from('marketing_content')
    .update({
      status: 'published',
      posted_at: new Date().toISOString()
    })
    .eq('id', contentId);

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function postToSocialMedia(content: any, platform: string) {
  console.log(`Posting to ${platform}:`, content.title);
  
  // Get user's OAuth tokens for the platform
  const { data: accountData, error: accountError } = await supabase
    .from('social_media_accounts')
    .select('*')
    .eq('platform', platform)
    .eq('connection_status', 'connected')
    .single();

  if (accountError || !accountData) {
    throw new Error(`No connected ${platform} account found`);
  }

  // Check if token needs refresh
  if (accountData.token_expires_at && new Date(accountData.token_expires_at) <= new Date()) {
    throw new Error(`${platform} token expired. Please reconnect your account.`);
  }

  const platformAPIs = {
    facebook: postToFacebook,
    twitter: postToTwitter,
    linkedin: postToLinkedIn,
    instagram: postToInstagram,
    youtube: postToYouTube
  };

  const postFunction = platformAPIs[platform];
  if (!postFunction) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  return await postFunction(content, accountData);
}

async function postToFacebook(content: any, oauth: any) {
  console.log('Posting to Facebook:', content.title);
  
  try {
    const postData = {
      message: `${content.title}\n\n${content.body_text}`,
      access_token: oauth.access_token
    };

    // Add image if available
    if (content.image_url) {
      postData.link = content.image_url;
    }

    const response = await fetch(`https://graph.facebook.com/me/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Facebook API error');
    }

    return { platform_post_id: result.id };
  } catch (error) {
    console.error('Facebook posting error:', error);
    throw error;
  }
}

async function postToTwitter(content: any, oauth: any) {
  console.log('Posting to Twitter:', content.title);
  
  try {
    let tweetText = `${content.title}\n\n${content.body_text}`;
    
    // Twitter character limit
    if (tweetText.length > 280) {
      tweetText = content.title.length > 250 ? 
        content.title.substring(0, 250) + '...' : 
        `${content.title}\n\n${content.body_text.substring(0, 280 - content.title.length - 5)}...`;
    }

    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${oauth.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: tweetText })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.detail || result.title || 'Twitter API error');
    }

    return { platform_post_id: result.data.id };
  } catch (error) {
    console.error('Twitter posting error:', error);
    throw error;
  }
}

async function postToLinkedIn(content: any, oauth: any) {
  console.log('Posting to LinkedIn:', content.title);
  
  try {
    const postData = {
      author: `urn:li:person:${oauth.platform_user_id}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: `${content.title}\n\n${content.body_text}`
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    if (content.image_url) {
      postData.specificContent['com.linkedin.ugc.ShareContent'].shareMediaCategory = 'IMAGE';
      postData.specificContent['com.linkedin.ugc.ShareContent'].media = [{
        status: 'READY',
        description: {
          text: content.title
        },
        media: content.image_url,
        title: {
          text: content.title
        }
      }];
    }

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
      throw new Error(result.message || 'LinkedIn API error');
    }

    return { platform_post_id: result.id };
  } catch (error) {
    console.error('LinkedIn posting error:', error);
    throw error;
  }
}

async function postToInstagram(content: any, oauth: any) {
  console.log('Posting to Instagram:', content.title);
  throw new Error('Instagram posting requires Instagram Business API and Facebook Page connection. Please use Facebook posting for now.');
}

async function postToYouTube(content: any, oauth: any) {
  console.log('Posting to YouTube:', content.title);
  throw new Error('YouTube posting requires video content and YouTube Data API v3. Text-only posting not supported.');
}