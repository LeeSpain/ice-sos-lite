import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Authentication required');
    }

    const { action, platform } = await req.json();

    switch (action) {
      case 'initiate':
        return await initiateOAuth(platform, user.id);
      case 'status':
        return await getAccountStatus(user.id, supabase);
      case 'disconnect':
        return await disconnectAccount(platform, user.id, supabase);
      default:
        throw new Error('Invalid action specified');
    }

  } catch (error) {
    console.error('Error in social-media-oauth function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function initiateOAuth(platform: string, userId: string) {
  // For now, simulate OAuth connection
  // In production, this would redirect to actual OAuth providers
  
  const authUrls = {
    facebook: 'https://www.facebook.com/v18.0/dialog/oauth',
    instagram: 'https://api.instagram.com/oauth/authorize', 
    linkedin: 'https://www.linkedin.com/oauth/v2/authorization',
    twitter: 'https://twitter.com/i/oauth2/authorize'
  };

  const authUrl = authUrls[platform as keyof typeof authUrls];
  
  if (!authUrl) {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  // For demo purposes, we'll return a mock OAuth URL
  // In production, this would include proper client_id, redirect_uri, etc.
  const mockAuthUrl = `${authUrl}?client_id=demo&redirect_uri=demo&scope=demo&state=${userId}`;

  return new Response(JSON.stringify({ 
    authUrl: mockAuthUrl,
    success: true 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getAccountStatus(userId: string, supabase: any) {
  const { data, error } = await supabase
    .from('social_media_accounts')
    .select('platform, account_name, account_status, is_active, follower_count, last_sync_at')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) {
    throw new Error(`Failed to get account status: ${error.message}`);
  }

  return new Response(JSON.stringify({ 
    accounts: data || [],
    success: true 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function disconnectAccount(platform: string, userId: string, supabase: any) {
  const { error } = await supabase
    .from('social_media_accounts')
    .update({ 
      is_active: false, 
      account_status: 'disconnected',
      access_token: null,
      refresh_token: null
    })
    .eq('user_id', userId)
    .eq('platform', platform);

  if (error) {
    throw new Error(`Failed to disconnect account: ${error.message}`);
  }

  return new Response(JSON.stringify({ 
    success: true, 
    message: `${platform} account disconnected` 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}