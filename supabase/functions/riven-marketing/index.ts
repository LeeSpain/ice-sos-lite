import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const xaiApiKey = Deno.env.get('XAI_API_KEY');


serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    // Create user-scoped client for auth checks
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Create service client for database operations
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Check user authentication and admin status
    const { data: { user }, error: userError } = await userSupabase.auth.getUser();
    if (userError || !user) {
      console.error('User auth error:', userError);
      throw new Error('Authentication required');
    }

    console.log('✅ User authenticated:', user.id);

    // Check if user is admin using user-scoped client
    const { data: isAdmin, error: adminCheckError } = await userSupabase.rpc('is_admin');
    if (adminCheckError) {
      console.error('❌ Admin check error:', adminCheckError);
      throw new Error('Failed to verify admin status');
    }
    if (!isAdmin) {
      console.log('❌ User is not admin:', user.id);
      return new Response(JSON.stringify({
        success: false,
        error: 'Admin privileges required'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Admin verified:', user.id);

    const { command, action, campaign_id, workflow_id, settings, scheduling_options, publishing_controls } = await req.json();
    const aiConfig = await loadAiConfig(userSupabase);

    let response = '';
    let campaign_created = false;

    switch (action) {
      case 'process_command':
        const result = await processMarketingCommand(command, user.id, serviceSupabase, workflow_id, settings, scheduling_options, publishing_controls, aiConfig);
        response = result.response;
        campaign_created = result.campaign_created;
        break;
      
      case 'generate_content':
        await generateMarketingContent(campaign_id, serviceSupabase, settings, aiConfig);
        response = 'Content generated successfully for campaign!';
        break;
      
      case 'provider_status':
        return new Response(JSON.stringify({
          success: true,
          providers: {
            openai: !!openaiApiKey,
            xai: !!xaiApiKey,
          }
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      
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

// AI provider routing helpers
async function loadAiConfig(supabase: any) {
  const fallback = {
    providers: {
      openai: { enabled: true, model: 'gpt-4o-mini' },
      xai: { enabled: false, model: 'grok-beta' }
    },
    stages: {
      overview: { provider: 'openai' },
      text: { provider: 'openai' },
      image: { provider: 'openai' },
      finalize: { provider: 'openai' }
    }
  };
  try {
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'ai_providers_config')
      .maybeSingle();
    if (error) {
      console.error('loadAiConfig error', error);
      return fallback;
    }
    return data?.value ?? fallback;
  } catch (e) {
    console.error('loadAiConfig exception', e);
    return fallback;
  }
}

function chooseProviderForStage(aiConfig: any, stage: 'overview'|'text'|'image'|'finalize') {
  const configured = aiConfig?.stages?.[stage]?.provider || 'openai';
  const enabled = aiConfig?.providers?.[configured]?.enabled !== false;
  const hasKey = configured === 'openai' ? !!openaiApiKey : !!xaiApiKey;
  if (enabled && hasKey) return configured;
  if (!!openaiApiKey && aiConfig?.providers?.openai?.enabled !== false) return 'openai';
  if (!!xaiApiKey && aiConfig?.providers?.xai?.enabled) return 'xai';
  throw new Error('No AI provider configured or API key missing');
}

async function callLLM(
  aiConfig: any,
  stage: 'overview'|'text'|'image'|'finalize',
  messages: Array<{ role: 'system'|'user'|'assistant'; content: string }>,
  options?: { model?: string; maxTokens?: number }
) {
  const provider = chooseProviderForStage(aiConfig, stage);
  let model = options?.model || aiConfig?.providers?.[provider]?.model || (provider === 'openai' ? 'gpt-4o-mini' : 'grok-beta');
  const maxTokens = options?.maxTokens ?? (stage === 'text' ? 500 : 1000);

  // Sanitize/normalize model for OpenAI to avoid unsupported IDs
  if (provider === 'openai') {
    const unsafeModels = ['gpt-5-2025-08-07', 'gpt-5-mini-2025-08-07'];
    if (unsafeModels.includes(model)) model = 'gpt-4o-mini';
    return await openAIChat(messages, model, maxTokens);
  }
  if (provider === 'xai') {
    return await xaiChat(messages, model, maxTokens);
  }
  throw new Error('Unsupported provider');
}

async function openAIChat(
  messages: Array<{ role: 'system'|'user'|'assistant'; content: string }>,
  model: string,
  maxTokens: number
) {
  if (!openaiApiKey) throw new Error('OpenAI API key not configured');
  
  // Check if it's a newer model that uses max_completion_tokens
  const isNewerModel = model.includes('gpt-5') || model.includes('gpt-4.1') || model.includes('o3') || model.includes('o4');
  
  const requestBody: any = {
    model,
    messages,
  };

  if (isNewerModel) {
    // Newer models use max_completion_tokens and don't support temperature
    requestBody.max_completion_tokens = maxTokens;
  } else {
    // Legacy models use max_tokens and support temperature
    requestBody.max_tokens = maxTokens;
    requestBody.temperature = 0.7;
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });
  
  const data = await res.json();
  if (!res.ok) {
    console.error(`OpenAI API error: ${res.status} - ${JSON.stringify(data)}`);
    throw new Error(`OpenAI API error: ${data.error?.message || res.status}`);
  }
  return data.choices?.[0]?.message?.content ?? '';
}

async function xaiChat(
  messages: Array<{ role: 'system'|'user'|'assistant'; content: string }>,
  model: string,
  maxTokens: number
) {
  if (!xaiApiKey) throw new Error('xAI API key not configured');
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${xaiApiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`xAI API error: ${data.error?.message || res.status}`);
  return data.choices?.[0]?.message?.content ?? '';
}

async function processMarketingCommand(command: string, userId: string, supabase: any, workflowId?: string, settings?: any, schedulingOptions?: any, publishingControls?: any, aiConfig?: any) {
  console.log('Processing marketing command:', command);

  // Create workflow tracking if ID provided
  if (workflowId) {
    await createWorkflowSteps(workflowId, supabase);
    await updateWorkflowStep(workflowId, 'command_received', 'completed', supabase);
  }

  let campaign = null;
  let analysis = null;
  
  try {
    // Get company info from Emma AI
    if (workflowId) await updateWorkflowStep(workflowId, 'retrieving_company_data', 'in_progress', supabase);
    const companyInfo = await getCompanyInfo(supabase);
    if (workflowId) await updateWorkflowStep(workflowId, 'retrieving_company_data', 'completed', supabase);
    
    // Analyze command with Riven AI
    if (workflowId) await updateWorkflowStep(workflowId, 'ai_analysis', 'in_progress', supabase);
    analysis = await analyzeCommandWithRiven(command, companyInfo, aiConfig, settings, schedulingOptions, publishingControls);
    if (workflowId) await updateWorkflowStep(workflowId, 'ai_analysis', 'completed', supabase);
    
  } catch (error) {
    console.error('❌ Error in AI analysis:', error);
    // Even if AI fails, create a basic campaign
    analysis = {
      response: "Campaign analysis failed, but campaign created successfully. Please review and add details manually.",
      title: command.length > 50 ? command.substring(0, 50) + '...' : command,
      description: "Campaign created from command: " + command,
      budget_estimate: 500,
      target_audience: { demographics: 'General audience', platforms: ['Facebook', 'Instagram'] }
    };
  }

  try {
    // Always try to create campaign
    if (workflowId) await updateWorkflowStep(workflowId, 'creating_campaign', 'in_progress', supabase);
    campaign = await createMarketingCampaign(analysis, command, userId, supabase);
    if (workflowId) await updateWorkflowStep(workflowId, 'creating_campaign', 'completed', supabase);
    console.log('✅ Campaign created:', campaign?.id);
    
  } catch (error) {
    console.error('❌ Error creating campaign:', error);
    if (workflowId) await updateWorkflowStep(workflowId, 'creating_campaign', 'failed', supabase, error.message);
  }

  try {
    // Auto-generate content if enabled and campaign exists
    if (settings?.auto_approve_content && campaign && (schedulingOptions?.mode === 'immediate' || schedulingOptions?.mode === 'optimal')) {
      if (workflowId) await updateWorkflowStep(workflowId, 'generating_content', 'in_progress', supabase);
      await generateMarketingContent(campaign.id, supabase, settings, aiConfig);
      if (workflowId) await updateWorkflowStep(workflowId, 'generating_content', 'completed', supabase);
      
      // Auto-publish for immediate mode
      if (schedulingOptions?.mode === 'immediate' && !publishingControls?.approval_required) {
        if (workflowId) await updateWorkflowStep(workflowId, 'publishing_content', 'in_progress', supabase);
        await publishGeneratedContent(campaign.id, supabase);
        if (workflowId) await updateWorkflowStep(workflowId, 'publishing_content', 'completed', supabase);
      }
    }
  } catch (error) {
    console.error('❌ Error in content generation:', error);
    if (workflowId) await updateWorkflowStep(workflowId, 'generating_content', 'failed', supabase, error.message);
  }
  
  return {
    response: analysis?.response || "Campaign created successfully but analysis failed.",
    campaign_created: !!campaign,
    campaign_id: campaign?.id ?? null,
    campaign_title: campaign?.title ?? null
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

async function analyzeCommandWithRiven(command: string, companyInfo: any, aiConfig: any, settings?: any, schedulingOptions?: any, publishingControls?: any) {
  const systemPrompt = `You are Riven, an expert AI marketing automation specialist for ${companyInfo.company_name}, a ${companyInfo.industry} company.

Company Information:
- Brand Voice: ${settings?.brand_voice || companyInfo.brand_voice}
- Target Audience: ${companyInfo.target_audience}
- Products: ${JSON.stringify(companyInfo.products)}
- Default Budget: $${settings?.default_budget || 500}
- Content Guidelines: ${settings?.content_guidelines || 'Standard professional guidelines'}

Scheduling Configuration:
- Mode: ${schedulingOptions?.mode || 'optimal'}
- Platforms: ${publishingControls?.platforms?.join(', ') || 'Facebook, Instagram'}
- Auto-Approval: ${settings?.auto_approve_content ? 'Enabled' : 'Disabled'}
- Spread Days: ${schedulingOptions?.spread_days || 'N/A'}
- Test Audience: ${schedulingOptions?.test_percentage || 'N/A'}%

Your role is to:
1. Analyze marketing commands and break them down into actionable campaigns
2. Provide detailed cost estimates and timelines based on scheduling preferences
3. Create comprehensive campaign strategies with platform-specific content
4. Suggest optimal posting times and content distribution
5. Recommend budget allocation across platforms and time periods
6. Follow the specified brand voice and guidelines
7. Consider the scheduling mode and adapt strategy accordingly

Always respond with:
- Campaign analysis and breakdown considering scheduling mode: ${schedulingOptions?.mode || 'optimal'}
- Estimated costs and timeline (budget: $${settings?.default_budget || 500})
- Platform-specific recommendations for: ${publishingControls?.platforms?.join(', ') || 'Facebook, Instagram'}
- Content strategy with posting schedule
- Target audience refinement and platform optimization
- Compliance with brand voice: "${settings?.brand_voice || companyInfo.brand_voice}"
- ROI predictions and performance expectations

Be specific, professional, and focus on end-to-end automation and measurable outcomes.`;

  try {
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: command }
    ];

    const rivenResponse = await callLLM(aiConfig, 'overview', messages, {
      model: settings?.ai_model,
      maxTokens: settings?.max_tokens || 1000
    });

    const campaignData = extractCampaignData(rivenResponse, command);
    return { response: rivenResponse, ...campaignData };
  } catch (error) {
    console.error('Error in analyzeCommandWithRiven:', error);
    throw new Error(`Failed to analyze command: ${error?.message || String(error)}`);
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
      .maybeSingle();

    if (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }

    console.log('Created campaign:', data);
    return data;
  } catch (error) {
    console.error('Error creating marketing campaign:', error);
    throw error;
  }
}

async function generateMarketingContent(campaignId: string, supabase: any, settings?: any, aiConfig?: any) {

  try {
    // Get campaign details
    const { data: campaign, error } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('id', campaignId)
      .maybeSingle();

    if (error || !campaign) {
      throw new Error('Campaign not found');
    }

    // Generate content for different platforms
    const platforms = campaign.target_audience?.platforms || ['Facebook', 'Instagram', 'LinkedIn', 'Twitter'];
    const contentTypes = ['post', 'story', 'article'];

    for (const platform of platforms) {
      for (const contentType of contentTypes) {
        const content = await generatePlatformContent(campaign, platform, contentType, supabase, aiConfig);
        
        // Create insert data with common fields
        const insertData: any = {
          campaign_id: campaignId,
          platform,
          content_type: contentType,
          title: content.title,
          content: content.body || content.content,
          hashtags: content.hashtags,
          status: 'draft'
        };

        // Add blog-specific fields if it's a blog post
        if (platform === 'blog' && content.blogData) {
          insertData.seo_title = content.blogData.seo_title;
          insertData.meta_description = content.blogData.meta_description;
          insertData.slug = content.blogData.slug;
          insertData.keywords = content.blogData.keywords;
          insertData.featured_image_alt = content.blogData.featured_image_alt;
          insertData.content_sections = content.blogData.content_sections;
          insertData.reading_time = content.blogData.reading_time;
          insertData.seo_score = content.blogData.seo_score;
        }
        
        await supabase
          .from('marketing_content')
          .insert(insertData);
      }
    }

    return true;
  } catch (error) {
    console.error('Error generating marketing content:', error);
    throw error;
  }
}

async function generatePlatformContent(campaign: any, platform: string, contentType: string, supabase: any, aiConfig: any) {
  let prompt = '';
  
  if (platform === 'blog') {
    const wordCount = campaign.target_audience?.wordCount || 1000;
    const seoDifficulty = campaign.target_audience?.seoDifficulty || 'intermediate';
    const contentDepth = campaign.target_audience?.contentDepth || 'detailed';
    
    prompt = `Create a comprehensive, SEO-optimized blog post for ICE SOS emergency safety services.

Campaign: ${campaign.title}
Description: ${campaign.description}
Content Type: ${contentType}
Target Word Count: ${wordCount} words
SEO Difficulty: ${seoDifficulty}
Content Depth: ${contentDepth}

Requirements:
- Write a professional, engaging blog post about family emergency preparedness and safety
- Structure with clear headings (H1, H2, H3)
- Include SEO optimization elements
- Focus on educational content that builds trust
- Include practical tips and actionable advice
- Maintain a caring, professional tone

Return ONLY a JSON object with this exact structure:
{
  "title": "Main blog title (under 60 characters)",
  "seo_title": "SEO optimized title (under 60 characters)",
  "meta_description": "Compelling meta description (under 160 characters)",
  "slug": "url-friendly-slug-here",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "content": "Full blog post content with proper HTML headings and paragraphs",
  "featured_image_alt": "Alt text for featured image",
  "content_sections": {
    "introduction": "Introduction paragraph",
    "main_content": "Main content body",
    "conclusion": "Conclusion with call-to-action"
  },
  "reading_time": 5,
  "seo_score": 85
}`;
  } else {
    prompt = `Create a ${contentType} for ${platform} based on this marketing campaign:

Campaign: ${campaign.title}
Description: ${campaign.description}
Target Audience: ${JSON.stringify(campaign.target_audience)}
Budget: $${campaign.budget_estimate}

Generate:
1. Engaging title/headline
2. Platform-optimized content text
3. Relevant hashtags (5-10)

Make it compelling, action-oriented, and suitable for ICE SOS emergency safety products.`;
  }

  try {
    const content = await callLLM(aiConfig, 'text', [
      { role: 'user', content: prompt }
    ], { maxTokens: 500 });


    const contentStr = content || '';
    if (!contentStr) {
      throw new Error('LLM returned empty content');
    }


    if (platform === 'blog') {
      try {
        // Try to parse as JSON for blog content
        const blogData = JSON.parse(contentStr);
        return {
          title: blogData.title,
          content: blogData.content,
          body: blogData.content,
          hashtags: blogData.keywords || ['#EmergencySafety', '#FamilyProtection', '#ICE_SOS'],
          blogData: blogData
        };
      } catch (e) {
        console.error('Failed to parse blog JSON, using fallback:', e);
        // Fallback for non-JSON response
        return {
          title: `${contentType} Blog Post - ${campaign.title}`,
          content: contentStr,
          body: contentStr,
          hashtags: ['#EmergencySafety', '#FamilyProtection', '#ICE_SOS'],
          blogData: {
            seo_title: `${contentType} - Emergency Safety Tips`,
            meta_description: 'Learn essential emergency safety tips to protect your family.',
            slug: `${contentType.toLowerCase().replace(/\s+/g, '-')}-emergency-safety-tips`,
            keywords: ['emergency safety', 'family protection', 'safety tips'],
            featured_image_alt: 'Family emergency safety illustration',
            content_sections: { introduction: contentStr.substring(0, 200), main_content: contentStr, conclusion: 'Stay safe with ICE SOS.' },
            reading_time: Math.ceil(contentStr.length / 250),
            seo_score: 75
          }
        };
      }
    } else {
      // Parse the generated content (simplified parsing)
      const titleLine = contentStr.split('\n').find(line => /Title|Headline/i.test(line)) || 
                   `${platform} ${contentType} for ${campaign.title}`;
      const hashtags = contentStr.match(/#\w+/g) || ['#EmergencySafety', '#FamilyProtection', '#ICE_SOS'];

      return {
        title: titleLine.replace(/^.*?[:]\s*/, '').trim(),
        body: contentStr,
        hashtags
      };
    }
  } catch (error) {
    console.error('Error generating platform content:', error);
    const fallback = `Content suggestion for ${platform} ${contentType} about ${campaign.title}.`;
    return {
      title: `${platform} ${contentType}`,
      body: fallback,
      hashtags: ['#EmergencySafety', '#FamilyProtection']
    };
  }
}

// New publishing function
async function publishGeneratedContent(campaignId: string, supabase: any) {
  try {
    // Mark all content as published
    const { error } = await supabase
      .from('marketing_content')
      .update({ status: 'published', scheduled_time: new Date().toISOString() })
      .eq('campaign_id', campaignId)
      .eq('status', 'draft');

    if (error) throw error;
    console.log('Content published for campaign:', campaignId);
  } catch (error) {
    console.error('Error publishing content:', error);
    throw error;
  }
}

// Workflow tracking functions
async function createWorkflowSteps(workflowId: string, supabase: any) {
  const steps = [
    { step_name: 'Command received', step_order: 1 },
    { step_name: 'Retrieving company data', step_order: 2 },
    { step_name: 'AI analysis in progress', step_order: 3 },
    { step_name: 'Creating campaign', step_order: 4 },
    { step_name: 'Generating content', step_order: 5 },
    { step_name: 'Publishing content', step_order: 6 },
  ];

  for (const step of steps) {
    await supabase
      .from('workflow_steps')
      .insert({
        workflow_id: workflowId,
        step_name: step.step_name,
        step_order: step.step_order,
        status: 'pending'
      });
  }
}

async function updateWorkflowStep(workflowId: string, stepName: string, status: string, supabase: any, errorMessage?: string) {
  const updateData: any = {
    status,
    [status === 'in_progress' ? 'started_at' : 'completed_at']: new Date().toISOString()
  };

  if (errorMessage) {
    updateData.error_message = errorMessage;
  }

  await supabase
    .from('workflow_steps')
    .update(updateData)
    .eq('workflow_id', workflowId)
    .eq('step_name', stepName);
}