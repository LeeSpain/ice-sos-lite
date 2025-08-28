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

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  try {
    const { action, platform, contentId, campaignId } = await req.json();
    console.log(`Analytics Aggregator - Action: ${action}`);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      supabaseClient.auth.setSession({ access_token: authHeader.replace('Bearer ', ''), refresh_token: '' });
    }

    if (action === 'sync_platform_analytics') {
      return await syncPlatformAnalytics(platform, supabaseClient);
    } else if (action === 'aggregate_campaign_analytics') {
      return await aggregateCampaignAnalytics(campaignId, supabaseClient);
    } else if (action === 'sync_all_platforms') {
      return await syncAllPlatformsAnalytics(supabaseClient);
    } else if (action === 'calculate_roi') {
      return await calculateROI(campaignId, supabaseClient);
    } else {
      throw new Error('Invalid action');
    }

  } catch (error) {
    console.error('Analytics Aggregator Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function syncPlatformAnalytics(platform: string, supabase: any) {
  // Get all published content for the platform
  const { data: contentItems } = await supabase
    .from('marketing_content')
    .select('*')
    .eq('platform', platform)
    .eq('status', 'published');

  if (!contentItems || contentItems.length === 0) {
    return new Response(
      JSON.stringify({ synced: 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

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

  let synced = 0;

  for (const content of contentItems) {
    try {
      const platformPostId = content.metadata?.[platform]?.id;
      if (!platformPostId) continue;

      const analytics = await fetchPlatformAnalytics(platform, platformPostId, account);
      
      if (analytics) {
        // Update or insert analytics
        await supabase
          .from('social_media_analytics')
          .upsert({
            content_id: content.id,
            platform,
            platform_post_id: platformPostId,
            ...analytics,
            synced_at: new Date().toISOString()
          });

        synced++;
      }
    } catch (error) {
      console.error(`Failed to sync analytics for content ${content.id}:`, error);
    }
  }

  return new Response(
    JSON.stringify({ synced }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function fetchPlatformAnalytics(platform: string, postId: string, account: any) {
  switch (platform) {
    case 'facebook':
      return await fetchFacebookAnalytics(postId, account);
    case 'instagram':
      return await fetchInstagramAnalytics(postId, account);
    case 'twitter':
      return await fetchTwitterAnalytics(postId, account);
    case 'linkedin':
      return await fetchLinkedInAnalytics(postId, account);
    case 'youtube':
      return await fetchYouTubeAnalytics(postId, account);
    case 'tiktok':
      return await fetchTikTokAnalytics(postId, account);
    default:
      throw new Error(`Analytics for ${platform} not implemented`);
  }
}

async function fetchFacebookAnalytics(postId: string, account: any) {
  const url = `https://graph.facebook.com/v18.0/${postId}?fields=insights.metric(post_impressions,post_engaged_users,post_clicks,post_reactions_like_total,post_reactions_love_total,post_reactions_wow_total,post_reactions_haha_total,post_reactions_sorry_total,post_reactions_anger_total)&access_token=${account.access_token}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Facebook Analytics API error: ${await response.text()}`);
  }

  const data = await response.json();
  const insights = data.insights?.data || [];

  const analytics = {
    impressions: 0,
    engagement: 0,
    clicks: 0,
    likes: 0,
    raw_analytics_data: data
  };

  // Parse Facebook insights
  for (const insight of insights) {
    switch (insight.name) {
      case 'post_impressions':
        analytics.impressions = insight.values[0]?.value || 0;
        break;
      case 'post_engaged_users':
        analytics.engagement = insight.values[0]?.value || 0;
        break;
      case 'post_clicks':
        analytics.clicks = insight.values[0]?.value || 0;
        break;
      case 'post_reactions_like_total':
        analytics.likes = insight.values[0]?.value || 0;
        break;
    }
  }

  // Calculate engagement rate
  analytics.engagement_rate = analytics.impressions > 0 
    ? (analytics.engagement / analytics.impressions) * 100 
    : 0;

  return analytics;
}

async function fetchInstagramAnalytics(postId: string, account: any) {
  const url = `https://graph.facebook.com/v18.0/${postId}/insights?metric=impressions,reach,engagement,likes,comments,saves&access_token=${account.access_token}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Instagram Analytics API error: ${await response.text()}`);
  }

  const data = await response.json();
  const insights = data.data || [];

  const analytics = {
    impressions: 0,
    reach: 0,
    engagement: 0,
    likes: 0,
    comments: 0,
    saves: 0,
    raw_analytics_data: data
  };

  // Parse Instagram insights
  for (const insight of insights) {
    switch (insight.name) {
      case 'impressions':
        analytics.impressions = insight.values[0]?.value || 0;
        break;
      case 'reach':
        analytics.reach = insight.values[0]?.value || 0;
        break;
      case 'engagement':
        analytics.engagement = insight.values[0]?.value || 0;
        break;
      case 'likes':
        analytics.likes = insight.values[0]?.value || 0;
        break;
      case 'comments':
        analytics.comments = insight.values[0]?.value || 0;
        break;
      case 'saves':
        analytics.saves = insight.values[0]?.value || 0;
        break;
    }
  }

  // Calculate engagement rate
  analytics.engagement_rate = analytics.reach > 0 
    ? (analytics.engagement / analytics.reach) * 100 
    : 0;

  return analytics;
}

async function fetchTwitterAnalytics(postId: string, account: any) {
  const url = `https://api.twitter.com/2/tweets/${postId}?tweet.fields=public_metrics`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${account.access_token}`
    }
  });

  if (!response.ok) {
    throw new Error(`Twitter Analytics API error: ${await response.text()}`);
  }

  const data = await response.json();
  const metrics = data.data?.public_metrics || {};

  const analytics = {
    impressions: metrics.impression_count || 0,
    engagement: (metrics.like_count || 0) + (metrics.retweet_count || 0) + (metrics.reply_count || 0),
    likes: metrics.like_count || 0,
    shares: metrics.retweet_count || 0,
    comments: metrics.reply_count || 0,
    raw_analytics_data: data
  };

  // Calculate engagement rate
  analytics.engagement_rate = analytics.impressions > 0 
    ? (analytics.engagement / analytics.impressions) * 100 
    : 0;

  return analytics;
}

async function fetchLinkedInAnalytics(postId: string, account: any) {
  const url = `https://api.linkedin.com/v2/socialActions/${postId}/statistics`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${account.access_token}`
    }
  });

  if (!response.ok) {
    throw new Error(`LinkedIn Analytics API error: ${await response.text()}`);
  }

  const data = await response.json();

  const analytics = {
    impressions: data.impressionCount || 0,
    engagement: data.engagementCount || 0,
    likes: data.likeCount || 0,
    comments: data.commentCount || 0,
    shares: data.shareCount || 0,
    clicks: data.clickCount || 0,
    raw_analytics_data: data
  };

  // Calculate engagement rate
  analytics.engagement_rate = analytics.impressions > 0 
    ? (analytics.engagement / analytics.impressions) * 100 
    : 0;

  return analytics;
}

async function fetchYouTubeAnalytics(postId: string, account: any) {
  // YouTube Analytics API requires different setup
  // This is a placeholder for the implementation
  return {
    video_views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    raw_analytics_data: {}
  };
}

async function fetchTikTokAnalytics(postId: string, account: any) {
  // TikTok Analytics API implementation
  const url = `https://open-api.tiktok.com/video/data/?video_id=${postId}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${account.access_token}`
    }
  });

  if (!response.ok) {
    throw new Error(`TikTok Analytics API error: ${await response.text()}`);
  }

  const data = await response.json();
  const stats = data.data?.statistics || {};

  return {
    video_views: stats.view_count || 0,
    likes: stats.like_count || 0,
    comments: stats.comment_count || 0,
    shares: stats.share_count || 0,
    raw_analytics_data: data
  };
}

async function aggregateCampaignAnalytics(campaignId: string, supabase: any) {
  // Get all content for the campaign
  const { data: contentItems } = await supabase
    .from('marketing_content')
    .select('*')
    .eq('campaign_id', campaignId);

  if (!contentItems || contentItems.length === 0) {
    throw new Error('No content found for campaign');
  }

  // Get analytics for all content items
  const { data: analytics } = await supabase
    .from('social_media_analytics')
    .select('*')
    .in('content_id', contentItems.map(c => c.id));

  // Aggregate the data
  const aggregated = {
    total_impressions: 0,
    total_reach: 0,
    total_engagement: 0,
    total_clicks: 0,
    total_conversions: 0,
    total_spend: 0
  };

  if (analytics) {
    for (const item of analytics) {
      aggregated.total_impressions += item.impressions || 0;
      aggregated.total_reach += item.reach || 0;
      aggregated.total_engagement += item.engagement || 0;
      aggregated.total_clicks += item.clicks || 0;
    }
  }

  // Calculate rates
  aggregated.engagement_rate = aggregated.total_reach > 0 
    ? (aggregated.total_engagement / aggregated.total_reach) * 100 
    : 0;

  aggregated.conversion_rate = aggregated.total_clicks > 0 
    ? (aggregated.total_conversions / aggregated.total_clicks) * 100 
    : 0;

  // Save aggregated analytics
  await supabase
    .from('campaign_analytics')
    .upsert({
      campaign_id: campaignId,
      ...aggregated,
      created_at: new Date().toISOString()
    });

  return new Response(
    JSON.stringify({ success: true, analytics: aggregated }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function syncAllPlatformsAnalytics(supabase: any) {
  const platforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok'];
  const results = [];

  for (const platform of platforms) {
    try {
      const result = await syncPlatformAnalytics(platform, supabase);
      const data = await result.json();
      results.push({ platform, synced: data.synced });
    } catch (error) {
      console.error(`Failed to sync ${platform}:`, error);
      results.push({ platform, error: error.message });
    }
  }

  return new Response(
    JSON.stringify({ results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function calculateROI(campaignId: string, supabase: any) {
  // Get campaign details
  const { data: campaign } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  // Get aggregated analytics
  const { data: analytics } = await supabase
    .from('campaign_analytics')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!analytics) {
    throw new Error('No analytics data found for campaign');
  }

  // Calculate ROI based on budget and conversions
  const totalSpend = campaign.budget_estimate || 0;
  const totalConversions = analytics.total_conversions || 0;
  const avgOrderValue = 50; // This should be configurable or calculated from actual data

  const revenue = totalConversions * avgOrderValue;
  const roi = totalSpend > 0 ? ((revenue - totalSpend) / totalSpend) * 100 : 0;

  // Update campaign analytics with ROI
  await supabase
    .from('campaign_analytics')
    .update({
      total_spend: totalSpend,
      roi,
      cost_per_conversion: totalConversions > 0 ? totalSpend / totalConversions : 0,
      cost_per_click: analytics.total_clicks > 0 ? totalSpend / analytics.total_clicks : 0
    })
    .eq('id', analytics.id);

  return new Response(
    JSON.stringify({ 
      success: true, 
      roi,
      revenue,
      totalSpend,
      totalConversions
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}