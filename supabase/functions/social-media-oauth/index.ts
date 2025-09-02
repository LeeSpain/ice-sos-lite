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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { platform, action, redirectUri, code, state } = await req.json();

    console.log(`Social OAuth request: ${action} for ${platform}`);

    switch (action) {
      case 'initiate':
        return await initiateOAuth(platform, redirectUri, supabaseClient);
      case 'callback':
        return await handleOAuthCallback(platform, code, state, supabaseClient);
      case 'disconnect':
        return await disconnectAccount(platform, supabaseClient);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Social OAuth error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function initiateOAuth(platform: string, redirectUri: string, supabase: any) {
  const platformConfigs = {
    facebook: {
      authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      clientId: Deno.env.get('FACEBOOK_CLIENT_ID'),
      scopes: 'pages_manage_posts,pages_read_engagement'
    },
    twitter: {
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      clientId: Deno.env.get('TWITTER_CLIENT_ID'),
      scopes: 'tweet.read tweet.write users.read'
    },
    linkedin: {
      authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      clientId: Deno.env.get('LINKEDIN_CLIENT_ID'),
      scopes: 'w_member_social r_liteprofile'
    },
    instagram: {
      authUrl: 'https://api.instagram.com/oauth/authorize',
      clientId: Deno.env.get('INSTAGRAM_CLIENT_ID'),
      scopes: 'user_profile,user_media'
    },
    youtube: {
      authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      clientId: Deno.env.get('YOUTUBE_CLIENT_ID'),
      scopes: 'https://www.googleapis.com/auth/youtube.upload'
    }
  };

  const config = platformConfigs[platform];
  if (!config) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  const state = crypto.randomUUID();
  const params = new URLSearchParams({
    client_id: config.clientId || '',
    redirect_uri: redirectUri,
    scope: config.scopes,
    response_type: 'code',
    state: state
  });

  const authUrl = `${config.authUrl}?${params.toString()}`;

  return new Response(JSON.stringify({ authUrl, state }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleOAuthCallback(platform: string, code: string, state: string, supabase: any) {
  // Mock implementation - would exchange code for access token
  console.log(`OAuth callback for ${platform} with code: ${code.substring(0, 10)}...`);
  
  // Insert or update social media account
  const accountData = {
    platform: platform,
    account_name: `${platform}_user_${Date.now()}`,
    account_status: 'connected',
    is_active: true,
    access_token: `mock_token_${platform}_${Date.now()}`,
    last_connected: new Date().toISOString(),
    follower_count: Math.floor(Math.random() * 10000) + 1000,
    posting_permissions: { post: true, story: true },
    rate_limits: { daily: 100, hourly: 10 }
  };

  const { data, error } = await supabase
    .from('social_media_accounts')
    .upsert(accountData, { 
      onConflict: 'platform',
      ignoreDuplicates: false 
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving social account:', error);
    throw error;
  }

  return new Response(JSON.stringify({ success: true, account: data }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function disconnectAccount(platform: string, supabase: any) {
  const { error } = await supabase
    .from('social_media_accounts')
    .update({ 
      is_active: false,
      account_status: 'disconnected'
    })
    .eq('platform', platform);

  if (error) {
    console.error('Error disconnecting account:', error);
    throw error;
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}