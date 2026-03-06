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
      // Instagram Business uses Facebook Graph API OAuth
      clientId = Deno.env.get('FACEBOOK_APP_ID') || Deno.env.get('FACEBOOK_CLIENT_ID') || '';
      authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish,business_management`;
      break;
      
    case 'linkedin':
      clientId = Deno.env.get('LINKEDIN_CLIENT_ID') || '';
      authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=w_member_social,profile,email`;
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
    authUrl: authUrl,
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

  // Calculate expires_at from expires_in if provided
  const expiresAt = tokenData.expires_in 
    ? new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString()
    : tokenData.expires_at || null;

  // Store OAuth data in social_media_oauth table
  const { error } = await supabase
    .from('social_media_oauth')
    .upsert({
      user_id: userId,
      platform,
      platform_user_id: tokenData.platform_user_id,
      platform_name: tokenData.name || null,
      platform_username: tokenData.username || null,
      platform_account_id: tokenData.platform_account_id || null,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token || null,
      expires_at: expiresAt,
      token_expires_at: expiresAt, // Keep legacy field in sync
      token_type: tokenData.token_type || 'Bearer',
      scope: tokenData.scope || null,
      permissions: tokenData.permissions || null,
      follower_count: tokenData.follower_count || null,
      connection_status: 'connected',
      metadata: tokenData.metadata || {},
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,platform'
    });

  if (error) {
    console.error('Failed to store OAuth data:', error);
    throw error;
  }

  console.log(`OAuth callback success: ${platform} connected for user ${userId}`);

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
  const clientId = Deno.env.get('FACEBOOK_APP_ID') || Deno.env.get('FACEBOOK_CLIENT_ID');
  const clientSecret = Deno.env.get('FACEBOOK_APP_SECRET') || Deno.env.get('FACEBOOK_CLIENT_SECRET');
  
  // Exchange code for access token
  const tokenResponse = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`);
  const tokenData = await tokenResponse.json();
  
  if (!tokenResponse.ok) throw new Error(tokenData.error?.message || 'Facebook token exchange failed');
  
  // Get user info
  const userResponse = await fetch(`https://graph.facebook.com/me?access_token=${tokenData.access_token}&fields=id,name,picture`);
  const userData = await userResponse.json();

  // Get pages the user manages (for posting)
  let pageId = null;
  let pageName = null;
  try {
    const pagesResponse = await fetch(`https://graph.facebook.com/me/accounts?access_token=${tokenData.access_token}`);
    const pagesData = await pagesResponse.json();
    if (pagesData.data && pagesData.data.length > 0) {
      pageId = pagesData.data[0].id;
      pageName = pagesData.data[0].name;
    }
  } catch (e) {
    console.log('Could not fetch Facebook pages:', e);
  }
  
  return {
    platform_user_id: userData.id,
    platform_account_id: pageId, // Facebook Page ID for posting
    access_token: tokenData.access_token,
    refresh_token: null,
    expires_in: tokenData.expires_in,
    token_type: tokenData.token_type || 'Bearer',
    scope: 'pages_manage_posts,pages_read_engagement',
    username: userData.name,
    name: userData.name,
    permissions: ['pages_manage_posts', 'pages_read_engagement'],
    metadata: { page_name: pageName }
  };
}

async function exchangeInstagramToken(code: string, redirectUri: string) {
  const clientId = Deno.env.get('FACEBOOK_APP_ID') || Deno.env.get('FACEBOOK_CLIENT_ID');
  const clientSecret = Deno.env.get('FACEBOOK_APP_SECRET') || Deno.env.get('FACEBOOK_CLIENT_SECRET');

  // Instagram Business uses Facebook Graph API OAuth flow
  const tokenResponse = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${clientSecret}&code=${code}`);
  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) throw new Error(tokenData.error?.message || 'Instagram token exchange failed');

  // Get Facebook user info
  const userResponse = await fetch(`https://graph.facebook.com/me?access_token=${tokenData.access_token}&fields=id,name`);
  const userData = await userResponse.json();

  // Get managed Facebook Pages
  const pagesResponse = await fetch(`https://graph.facebook.com/me/accounts?access_token=${tokenData.access_token}`);
  const pagesData = await pagesResponse.json();

  // For each page, get the linked Instagram Business account
  let igBusinessUserId: string | null = null;
  let igUsername: string | null = null;
  if (pagesData.data && pagesData.data.length > 0) {
    for (const page of pagesData.data) {
      const igResponse = await fetch(`https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${tokenData.access_token}`);
      const igData = await igResponse.json();
      if (igData.instagram_business_account?.id) {
        igBusinessUserId = igData.instagram_business_account.id;
        // Get Instagram username
        const igUserResponse = await fetch(`https://graph.facebook.com/v19.0/${igBusinessUserId}?fields=username&access_token=${tokenData.access_token}`);
        const igUserData = await igUserResponse.json();
        igUsername = igUserData.username || null;
        break;
      }
    }
  }

  if (!igBusinessUserId) {
    console.warn('No Instagram Business account found linked to this Facebook Page. Ensure the Facebook Page is linked to an Instagram Business account.');
  }

  return {
    platform_user_id: userData.id,
    platform_account_id: igBusinessUserId || userData.id,
    access_token: tokenData.access_token,
    refresh_token: null,
    expires_in: tokenData.expires_in || null,
    token_type: 'Bearer',
    scope: 'instagram_content_publish,pages_manage_posts',
    username: igUsername || userData.name || 'instagram_user',
    name: igUsername || userData.name || 'Instagram Business User',
    permissions: ['instagram_basic', 'instagram_content_publish'],
    metadata: { instagram_business_user_id: igBusinessUserId, facebook_user_id: userData.id }
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
  
  // Get user info using userinfo endpoint (OpenID Connect)
  const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
  });
  const userData = await userResponse.json();
  
  const fullName = userData.name || `${userData.given_name || ''} ${userData.family_name || ''}`.trim();
  
  return {
    platform_user_id: userData.sub,
    platform_account_id: userData.sub, // LinkedIn person URN for posting
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || null,
    expires_in: tokenData.expires_in,
    token_type: tokenData.token_type || 'Bearer',
    scope: tokenData.scope || 'w_member_social,profile,email',
    username: fullName,
    name: fullName,
    permissions: ['w_member_social', 'profile', 'email'],
    metadata: { email: userData.email }
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
  
  const clientId = Deno.env.get('X_CLIENT_ID') || Deno.env.get('TWITTER_CLIENT_ID');
  const clientSecret = Deno.env.get('X_CLIENT_SECRET') || Deno.env.get('TWITTER_CLIENT_SECRET');
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
    platform_account_id: userData.data.id, // Twitter user ID for posting
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token || null,
    expires_in: tokenData.expires_in,
    token_type: tokenData.token_type || 'Bearer',
    scope: tokenData.scope || 'tweet.read tweet.write users.read',
    username: userData.data.username,
    name: userData.data.name,
    follower_count: userData.data.public_metrics?.followers_count || 0,
    permissions: ['tweet.read', 'tweet.write', 'users.read'],
    metadata: { handle: `@${userData.data.username}` }
  };
}

async function disconnectAccount(platform: string, userId: string, supabase: any) {
  // Wipe tokens and set disconnected status
  const { error } = await supabase
    .from('social_media_oauth')
    .update({ 
      connection_status: 'disconnected',
      access_token: null,
      refresh_token: null,
      expires_at: null,
      token_expires_at: null,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('platform', platform);

  if (error) {
    console.error('Failed to disconnect account:', error);
    throw error;
  }

  console.log(`Disconnected ${platform} for user ${userId}`);

  return new Response(JSON.stringify({
    success: true,
    platform,
    disconnected: true
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function refreshTokens(platform: string, userId: string, supabase: any) {
  // Fetch current OAuth row
  const { data: oauthRow, error: fetchError } = await supabase
    .from('social_media_oauth')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .eq('platform', platform)
    .single();

  if (fetchError || !oauthRow) {
    return new Response(JSON.stringify({ success: false, error: 'OAuth account not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  let newAccessToken: string | null = null;
  let newRefreshToken: string | null = null;
  let newExpiresAt: string | null = null;

  try {
    if (platform === 'linkedin') {
      if (!oauthRow.refresh_token) {
        throw new Error('LinkedIn refresh token not available — please reconnect');
      }
      const clientId = Deno.env.get('LINKEDIN_CLIENT_ID');
      const clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET');
      const resp = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: oauthRow.refresh_token,
          client_id: clientId!,
          client_secret: clientSecret!,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error_description || 'LinkedIn refresh failed');
      newAccessToken = data.access_token;
      newRefreshToken = data.refresh_token || oauthRow.refresh_token;
      newExpiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : null;

    } else if (platform === 'twitter' || platform === 'x') {
      if (!oauthRow.refresh_token) {
        throw new Error('Twitter refresh token not available — reconnect required');
      }
      const clientId = Deno.env.get('X_CLIENT_ID') || Deno.env.get('TWITTER_CLIENT_ID');
      const clientSecret = Deno.env.get('X_CLIENT_SECRET') || Deno.env.get('TWITTER_CLIENT_SECRET');
      const resp = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: oauthRow.refresh_token,
          client_id: clientId!,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error_description || 'Twitter refresh failed');
      newAccessToken = data.access_token;
      newRefreshToken = data.refresh_token || oauthRow.refresh_token;
      newExpiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : null;

    } else if (platform === 'facebook' || platform === 'instagram') {
      // Facebook/Instagram long-lived tokens do not have a refresh_token flow
      // Exchange the current token for a new long-lived token
      const clientId = Deno.env.get('FACEBOOK_APP_ID') || Deno.env.get('FACEBOOK_CLIENT_ID');
      const clientSecret = Deno.env.get('FACEBOOK_APP_SECRET') || Deno.env.get('FACEBOOK_CLIENT_SECRET');
      const resp = await fetch(
        `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${oauthRow.access_token}`
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error?.message || 'Facebook token refresh failed');
      newAccessToken = data.access_token;
      newRefreshToken = null;
      newExpiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).toISOString()
        : null;

    } else {
      return new Response(JSON.stringify({ success: false, error: `Token refresh not supported for platform: ${platform}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Update stored tokens
    const { error: updateError } = await supabase
      .from('social_media_oauth')
      .update({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        expires_at: newExpiresAt,
        token_expires_at: newExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('platform', platform);

    if (updateError) throw new Error(`Failed to save refreshed token: ${updateError.message}`);

    console.log(`Token refreshed for ${platform}, user ${userId}`);

    return new Response(JSON.stringify({
      success: true,
      platform,
      expires_at: newExpiresAt,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error(`Token refresh failed for ${platform}:`, err);
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
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