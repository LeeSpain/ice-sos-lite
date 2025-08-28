import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
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

    const { command, action, campaign_id } = await req.json();

    let response = '';
    let campaign_created = false;

    switch (action) {
      case 'process_command':
        const result = await processMarketingCommand(command, user.id, supabase);
        response = result.response;
        campaign_created = result.campaign_created;
        break;
      
      case 'generate_content':
        await generateMarketingContent(campaign_id, supabase);
        response = 'Content generated successfully for campaign!';
        break;
      
      default:
        throw new Error('Invalid action specified');
    }

    return new Response(JSON.stringify({ 
      response, 
      campaign_created,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in riven-marketing function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processMarketingCommand(command: string, userId: string, supabase: any) {
  console.log('Processing marketing command:', command);

  // Get company info from Emma AI
  const companyInfo = await getCompanyInfo(supabase);
  
  // Analyze command with Riven AI
  const analysis = await analyzeCommandWithRiven(command, companyInfo);
  
  // Create campaign based on analysis
  const campaign = await createMarketingCampaign(analysis, command, userId, supabase);
  
  return {
    response: analysis.response,
    campaign_created: !!campaign
  };
}

async function getCompanyInfo(supabase: any) {
  try {
    // Get basic company information from site_content and other sources
    const { data: siteContent } = await supabase
      .from('site_content')
      .select('*');
    
    // Get subscription plans for pricing info
    const { data: plans } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true);

    return {
      company_name: 'ICE SOS',
      industry: 'Emergency Safety & Family Protection',
      products: plans || [],
      brand_voice: 'Professional, caring, safety-focused',
      target_audience: 'Families, parents, elderly care, personal safety',
      site_content: siteContent || []
    };
  } catch (error) {
    console.error('Error getting company info:', error);
    return {
      company_name: 'ICE SOS',
      industry: 'Emergency Safety & Family Protection'
    };
  }
}

async function analyzeCommandWithRiven(command: string, companyInfo: any) {
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `You are Riven, an expert AI marketing automation specialist for ${companyInfo.company_name}, a ${companyInfo.industry} company.

Company Information:
- Brand Voice: ${companyInfo.brand_voice}
- Target Audience: ${companyInfo.target_audience}
- Products: ${JSON.stringify(companyInfo.products)}

Your role is to:
1. Analyze marketing commands and break them down into actionable campaigns
2. Provide detailed cost estimates and timelines
3. Create comprehensive campaign strategies
4. Suggest content types and platforms
5. Recommend budget allocation

Always respond with:
- Campaign analysis and breakdown
- Estimated costs and timeline
- Platform recommendations
- Content strategy suggestions
- Target audience refinement

Be specific, professional, and focus on ROI and measurable outcomes.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: command }
        ],
        max_completion_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const rivenResponse = data.choices[0].message.content;
    
    // Parse the response to extract campaign details
    const campaignData = extractCampaignData(rivenResponse, command);
    
    return {
      response: rivenResponse,
      ...campaignData
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new Error('Failed to analyze command with Riven AI');
  }
}

function extractCampaignData(rivenResponse: string, originalCommand: string) {
  // Extract key information from Riven's response
  // This is a simplified extraction - in production, you'd use more sophisticated parsing
  
  const budgetMatch = rivenResponse.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  const budget = budgetMatch ? parseFloat(budgetMatch[1].replace(',', '')) : 500;
  
  // Generate a title based on the command
  const title = originalCommand.length > 50 
    ? originalCommand.substring(0, 50) + '...' 
    : originalCommand;
    
  return {
    title: `Marketing Campaign: ${title}`,
    description: rivenResponse.substring(0, 200) + '...',
    budget_estimate: budget,
    target_audience: {
      demographics: 'General audience',
      platforms: ['Facebook', 'Instagram', 'LinkedIn']
    }
  };
}

async function createMarketingCampaign(analysis: any, command: string, userId: string, supabase: any) {
  try {
    const { data, error } = await supabase
      .from('marketing_campaigns')
      .insert({
        created_by: userId,
        title: analysis.title,
        description: analysis.description,
        command_input: command,
        target_audience: analysis.target_audience,
        budget_estimate: analysis.budget_estimate,
        status: 'draft'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }

    console.log('Created campaign:', data);
    return data;
  } catch (error) {
    console.error('Error creating marketing campaign:', error);
    return null;
  }
}

async function generateMarketingContent(campaignId: string, supabase: any) {
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    // Get campaign details
    const { data: campaign, error } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (error || !campaign) {
      throw new Error('Campaign not found');
    }

    // Generate content for different platforms
    const platforms = ['Facebook', 'Instagram', 'LinkedIn', 'Twitter'];
    const contentTypes = ['post', 'story', 'article'];

    for (const platform of platforms) {
      for (const contentType of contentTypes) {
        const content = await generatePlatformContent(campaign, platform, contentType);
        
        await supabase
          .from('marketing_content')
          .insert({
            campaign_id: campaignId,
            platform,
            content_type: contentType,
            title: content.title,
            body_text: content.body,
            hashtags: content.hashtags,
            status: 'draft'
          });
      }
    }

    return true;
  } catch (error) {
    console.error('Error generating marketing content:', error);
    throw error;
  }
}

async function generatePlatformContent(campaign: any, platform: string, contentType: string) {
  const prompt = `Create a ${contentType} for ${platform} based on this marketing campaign:

Campaign: ${campaign.title}
Description: ${campaign.description}
Target Audience: ${JSON.stringify(campaign.target_audience)}
Budget: $${campaign.budget_estimate}

Generate:
1. Engaging title/headline
2. Platform-optimized content text
3. Relevant hashtags (5-10)

Make it compelling, action-oriented, and suitable for ICE SOS emergency safety products.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 500,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the generated content (simplified parsing)
    const lines = content.split('\n').filter(line => line.trim());
    const title = lines.find(line => line.includes('Title') || line.includes('Headline')) || 
                 `${platform} ${contentType} for ${campaign.title}`;
    const hashtags = content.match(/#\w+/g) || ['#EmergencySafety', '#FamilyProtection', '#ICE_SOS'];

    return {
      title: title.replace(/^.*?[:]\s*/, '').trim(),
      body: content,
      hashtags
    };
  } catch (error) {
    console.error('Error generating platform content:', error);
    return {
      title: `${platform} ${contentType}`,
      body: `Content for ${campaign.title}`,
      hashtags: ['#EmergencySafety', '#FamilyProtection']
    };
  }
}