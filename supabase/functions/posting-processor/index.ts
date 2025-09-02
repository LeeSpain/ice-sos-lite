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

    const { action } = await req.json();

    switch (action) {
      case 'process_queue':
        return await processPostingQueue(supabaseClient);
      case 'post_now':
        const { contentId } = await req.json();
        return await postContentNow(contentId, supabaseClient);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Posting processor error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
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
  
  // Mock implementation - in real app, would use platform APIs
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

  return await postFunction(content);
}

async function postToFacebook(content: any) {
  console.log('Posting to Facebook:', content.title);
  // Mock delay to simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { platform_post_id: `fb_${Date.now()}` };
}

async function postToTwitter(content: any) {
  console.log('Posting to Twitter:', content.title);
  await new Promise(resolve => setTimeout(resolve, 800));
  return { platform_post_id: `tw_${Date.now()}` };
}

async function postToLinkedIn(content: any) {
  console.log('Posting to LinkedIn:', content.title);
  await new Promise(resolve => setTimeout(resolve, 1200));
  return { platform_post_id: `li_${Date.now()}` };
}

async function postToInstagram(content: any) {
  console.log('Posting to Instagram:', content.title);
  await new Promise(resolve => setTimeout(resolve, 1500));
  return { platform_post_id: `ig_${Date.now()}` };
}

async function postToYouTube(content: any) {
  console.log('Posting to YouTube:', content.title);
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { platform_post_id: `yt_${Date.now()}` };
}