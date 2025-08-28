import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OAuthRequest {
  platform: string;
  action: 'initiate' | 'callback' | 'disconnect';
  code?: string;
  state?: string;
  redirectUri?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { platform, action, code, state, redirectUri }: OAuthRequest = await req.json();

    console.log(`OAuth ${action} for ${platform}`, { code: !!code, state: !!state });

    switch (action) {
      case 'initiate':
        return await initiateOAuth(platform, user.id, redirectUri);
      
      case 'callback':
        return await handleOAuthCallback(platform, code!, state!, user.id, supabaseClient);
      
      case 'disconnect':
        return await disconnectAccount(platform, user.id, supabaseClient);
      
      default:
        throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('OAuth error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function initiateOAuth(platform: string, userId: string, redirectUri?: string) {
  const state = crypto.randomUUID();
  const baseRedirect = redirectUri || 'https://your-domain.com/oauth/callback';
  
  let authUrl: string;
  
  switch (platform) {
    case 'facebook':
      const fbClientId = Deno.env.get('FACEBOOK_CLIENT_ID');
      authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${fbClientId}&` +
        `redirect_uri=${encodeURIComponent(baseRedirect)}&` +
        `scope=pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish&` +
        `state=${state}&` +
        `response_type=code`;
      break;
      
    case 'twitter':
      const twitterClientId = Deno.env.get('TWITTER_CLIENT_ID');
      authUrl = `https://twitter.com/i/oauth2/authorize?` +
        `response_type=code&` +
        `client_id=${twitterClientId}&` +
        `redirect_uri=${encodeURIComponent(baseRedirect)}&` +
        `scope=tweet.read%20tweet.write%20users.read&` +
        `state=${state}&` +
        `code_challenge=challenge&` +
        `code_challenge_method=plain`;
      break;
      
    case 'linkedin':
      const linkedinClientId = Deno.env.get('LINKEDIN_CLIENT_ID');
      authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
        `response_type=code&` +
        `client_id=${linkedinClientId}&` +
        `redirect_uri=${encodeURIComponent(baseRedirect)}&` +
        `scope=w_member_social%20r_liteprofile%20r_emailaddress&` +
        `state=${state}`;
      break;
      
    default:
      throw new Error(`Platform ${platform} not supported`);
  }

  return new Response(JSON.stringify({ authUrl, state }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleOAuthCallback(platform: string, code: string, state: string, userId: string, supabase: any) {
  let accessToken: string;
  let refreshToken: string | null = null;
  let expiresAt: Date | null = null;
  let accountInfo: any = {};

  switch (platform) {
    case 'facebook':
      const fbResult = await exchangeFacebookCode(code);
      accessToken = fbResult.access_token;
      expiresAt = fbResult.expires_in ? new Date(Date.now() + fbResult.expires_in * 1000) : null;
      accountInfo = await getFacebookAccountInfo(accessToken);
      break;
      
    case 'twitter':
      const twitterResult = await exchangeTwitterCode(code);
      accessToken = twitterResult.access_token;
      refreshToken = twitterResult.refresh_token;
      expiresAt = twitterResult.expires_in ? new Date(Date.now() + twitterResult.expires_in * 1000) : null;
      accountInfo = await getTwitterAccountInfo(accessToken);
      break;
      
    case 'linkedin':
      const linkedinResult = await exchangeLinkedInCode(code);
      accessToken = linkedinResult.access_token;
      expiresAt = linkedinResult.expires_in ? new Date(Date.now() + linkedinResult.expires_in * 1000) : null;
      accountInfo = await getLinkedInAccountInfo(accessToken);
      break;
      
    default:
      throw new Error(`Platform ${platform} not supported`);
  }

  // Store account in database
  const { data, error } = await supabase
    .from('social_media_accounts')
    .upsert({
      user_id: userId,
      platform,
      account_name: accountInfo.name || accountInfo.username,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: expiresAt?.toISOString(),
      platform_user_id: accountInfo.id,
      follower_count: accountInfo.follower_count || 0,
      account_status: 'connected',
      last_connected: new Date().toISOString()
    }, {
      onConflict: 'user_id,platform'
    });

  if (error) {
    console.error('Database error:', error);
    throw new Error('Failed to save account');
  }

  return new Response(JSON.stringify({ 
    success: true, 
    account: { platform, name: accountInfo.name, follower_count: accountInfo.follower_count } 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function disconnectAccount(platform: string, userId: string, supabase: any) {
  const { error } = await supabase
    .from('social_media_accounts')
    .update({ account_status: 'disconnected', access_token: null })
    .eq('user_id', userId)
    .eq('platform', platform);

  if (error) {
    throw new Error('Failed to disconnect account');
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function exchangeFacebookCode(code: string) {
  const clientId = Deno.env.get('FACEBOOK_CLIENT_ID');
  const clientSecret = Deno.env.get('FACEBOOK_CLIENT_SECRET');
  
  const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${clientId}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code`
  });
  
  return await response.json();
}

async function exchangeTwitterCode(code: string) {
  const clientId = Deno.env.get('TWITTER_CLIENT_ID');
  const clientSecret = Deno.env.get('TWITTER_CLIENT_SECRET');
  
  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: `code=${code}&grant_type=authorization_code&code_verifier=challenge`
  });
  
  return await response.json();
}

async function exchangeLinkedInCode(code: string) {
  const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
  const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
  
  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=authorization_code&code=${code}&client_id=${clientId}&client_secret=${clientSecret}`
  });
  
  return await response.json();
}

async function getFacebookAccountInfo(accessToken: string) {
  const response = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${accessToken}`);
  return await response.json();
}

async function getTwitterAccountInfo(accessToken: string) {
  const response = await fetch('https://api.twitter.com/2/users/me?user.fields=public_metrics', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const data = await response.json();
  return {
    id: data.data.id,
    name: data.data.name,
    username: data.data.username,
    follower_count: data.data.public_metrics?.followers_count || 0
  };
}

async function getLinkedInAccountInfo(accessToken: string) {
  const response = await fetch('https://api.linkedin.com/v2/people/~?projection=(id,localizedFirstName,localizedLastName)', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const data = await response.json();
  return {
    id: data.id,
    name: `${data.localizedFirstName} ${data.localizedLastName}`
  };
}