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

    const { action, platform, code, state, user_id } = await req.json();

    switch (action) {
      case 'initiate':
        return await initiateOAuth(platform, user_id, supabaseClient);
      case 'callback':
        return await handleOAuthCallback(platform, code, state, supabaseClient);
      case 'disconnect':
        return await disconnectAccount(platform, user_id, supabaseClient);
      case 'refresh':
        return await refreshTokens(platform, user_id, supabaseClient);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Social media OAuth error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function initiateOAuth(platform: string, userId: string, supabase: any) {
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/social-media-oauth`;
  const state = `${userId}-${Date.now()}`;
  
  let authUrl = '';
  let clientId = '';
  
  switch (platform) {
    case 'facebook':
      clientId = Deno.env.get('FACEBOOK_CLIENT_ID') || '';
      authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=pages_manage_posts,pages_read_engagement,business_management`;
      break;
      
    case 'instagram':
      clientId = Deno.env.get('FACEBOOK_CLIENT_ID') || ''; // Instagram uses Facebook app
      authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user_profile,user_media&response_type=code&state=${state}`;
      break;
      
    case 'linkedin':
      clientId = Deno.env.get('LINKEDIN_CLIENT_ID') || '';
      authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=w_member_social,r_liteprofile`;
      break;
      
    case 'twitter':
      // Twitter OAuth 2.0 PKCE flow
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // Store code verifier for later use
      await supabase
        .from('social_media_oauth_state')
        .insert({
          state,
          code_verifier: codeVerifier,
          platform,
          user_id: userId,
          expires_at: new Date(Date.now() + 600000).toISOString() // 10 minutes
        });
      
      clientId = Deno.env.get('TWITTER_CLIENT_ID') || '';
      authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=tweet.read%20tweet.write%20users.read&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
      break;
      
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  return new Response(JSON.stringify({ 
    auth_url: authUrl,
    state,
    success: true 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleOAuthCallback(platform: string, code: string, state: string, supabase: any) {
  const userId = state.split('-')[0];
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/social-media-oauth`;
  
  let tokenData;
  
  switch (platform) {
    case 'facebook':
      tokenData = await exchangeFacebookToken(code, redirectUri);
      break;
    case 'instagram':
      tokenData = await exchangeInstagramToken(code, redirectUri);
      break;
    case 'linkedin':
      tokenData = await exchangeLinkedInToken(code, redirectUri);
      break;
    case 'twitter':
      tokenData = await exchangeTwitterToken(code, state, supabase);
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

  // Store the OAuth data
  const { error } = await supabase
    .from('social_media_oauth')
    .upsert({
      user_id: userId,
      platform,
      platform_user_id: tokenData.platform_user_id,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: tokenData.expires_at,
      platform_username: tokenData.username,
      platform_name: tokenData.name,
      follower_count: tokenData.follower_count || 0,
      connection_status: 'active',
      permissions: tokenData.permissions || [],
      last_used_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,platform,platform_user_id'
    });

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    platform,
    username: tokenData.username,
    connected: true
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function exchangeFacebookToken(code: string, redirectUri: string) {
  const clientId = Deno.env.get('FACEBOOK_CLIENT_ID');
  const clientSecret = Deno.env.get('FACEBOOK_CLIENT_SECRET');
  
  // Exchange code for access token
  const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`);
  const tokenData = await tokenResponse.json();
  
  if (!tokenResponse.ok) throw new Error(tokenData.error?.message || 'Facebook token exchange failed');
  
  // Get user info
  const userResponse = await fetch(`https://graph.facebook.com/me?access_token=${tokenData.access_token}&fields=id,name,picture`);
  const userData = await userResponse.json();
  
  return {
    platform_user_id: userData.id,
    access_token: tokenData.access_token,
    refresh_token: null, // Facebook doesn't use refresh tokens in this flow
    expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
    username: userData.name,
    name: userData.name,
    permissions: ['pages_manage_posts', 'pages_read_engagement']
  };
}

async function exchangeInstagramToken(code: string, redirectUri: string) {
  const clientId = Deno.env.get('FACEBOOK_CLIENT_ID');
  const clientSecret = Deno.env.get('FACEBOOK_CLIENT_SECRET');
  
  // Instagram uses Facebook's OAuth
  const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code
    })
  });
  
  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) throw new Error(tokenData.error?.message || 'Instagram token exchange failed');
  
  return {
    platform_user_id: tokenData.user_id,
    access_token: tokenData.access_token,
    refresh_token: null,
    expires_at: null, // Instagram basic tokens don't expire
    username: tokenData.username || 'instagram_user',
    name: tokenData.username || 'Instagram User',
    permissions: ['user_profile', 'user_media']
  };
}

async function exchangeLinkedInToken(code: string, redirectUri: string) {
  const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
  const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
  
  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId!,
      client_secret: clientSecret!
    })
  });
  
  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) throw new Error(tokenData.error_description || 'LinkedIn token exchange failed');
  
  // Get user info
  const userResponse = await fetch('https://api.linkedin.com/v2/people/~?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))', {
    headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
  });
  const userData = await userResponse.json();
  
  return {
    platform_user_id: userData.id,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
    username: `${userData.firstName?.localized?.en_US || ''} ${userData.lastName?.localized?.en_US || ''}`.trim(),
    name: `${userData.firstName?.localized?.en_US || ''} ${userData.lastName?.localized?.en_US || ''}`.trim(),
    permissions: ['w_member_social', 'r_liteprofile']
  };
}

async function exchangeTwitterToken(code: string, state: string, supabase: any) {
  // Get code verifier from state
  const { data: stateData } = await supabase
    .from('social_media_oauth_state')
    .select('code_verifier')
    .eq('state', state)
    .single();
    
  if (!stateData) throw new Error('Invalid state parameter');
  
  const clientId = Deno.env.get('TWITTER_CLIENT_ID');
  const clientSecret = Deno.env.get('TWITTER_CLIENT_SECRET');
  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/social-media-oauth`;
  
  const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
    },
    body: new URLSearchParams({
      code,
      grant_type: 'authorization_code',
      client_id: clientId!,
      redirect_uri: redirectUri,
      code_verifier: stateData.code_verifier
    })
  });
  
  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) throw new Error(tokenData.error_description || 'Twitter token exchange failed');
  
  // Get user info
  const userResponse = await fetch('https://api.twitter.com/2/users/me?user.fields=public_metrics,username,name', {
    headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
  });
  const userData = await userResponse.json();
  
  // Clean up state
  await supabase.from('social_media_oauth_state').delete().eq('state', state);
  
  return {
    platform_user_id: userData.data.id,
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
    username: userData.data.username,
    name: userData.data.name,
    follower_count: userData.data.public_metrics?.followers_count || 0,
    permissions: ['tweet.read', 'tweet.write', 'users.read']
  };
}

async function disconnectAccount(platform: string, userId: string, supabase: any) {
  const { error } = await supabase
    .from('social_media_oauth')
    .update({ connection_status: 'disconnected' })
    .eq('user_id', userId)
    .eq('platform', platform);

  if (error) throw error;

  return new Response(JSON.stringify({
    success: true,
    platform,
    disconnected: true
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function refreshTokens(platform: string, userId: string, supabase: any) {
  // Implementation depends on platform - some platforms auto-refresh, others need manual refresh
  return new Response(JSON.stringify({
    success: true,
    message: 'Token refresh not implemented for this platform'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

// Helper functions for Twitter PKCE
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}