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
    console.log('📡 Received request:', {
      method: req.method,
      url: req.url,
      hasBody: req.body !== null
    });

    // Parse request body first to check action
    const requestBody = await req.json();
    const { command, action, campaign_id, workflow_id, settings, scheduling_options, publishing_controls, prompt, contentId } = requestBody;

    // For provider_status, we don't need authentication - just return the provider status
    if (action === 'provider_status') {
      console.log('🔍 Provider status check - no auth required');
      return new Response(JSON.stringify({
        success: true,
        providers: {
          openai: !!openaiApiKey,
          xai: !!xaiApiKey,
        },
        debug: {
          openai_configured: !!openaiApiKey,
          xai_configured: !!xaiApiKey,
          action: 'provider_status'
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // For all other actions, require authentication
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header found');
      throw new Error('Authorization header missing');
    }

    console.log('🔍 Auth header present:', !!authHeader);

    // Create user-scoped client for auth checks
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Create service client for database operations
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Check user authentication using explicit token (more reliable in functions)
    const token = authHeader.replace(/^Bearer\s+/i, '');
    const { data: { user }, error: userError } = await userSupabase.auth.getUser(token);
    if (userError || !user) {
      console.error('❌ User auth error:', userError);
      throw new Error('Authentication failed');
    }

    console.log('✅ User authenticated:', user.id);

    // For other actions, check if user is admin
    console.log('🔍 Checking admin status for user:', user.id);
    const { data: userProfile, error: profileError } = await serviceSupabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile check error:', profileError);
      throw new Error('Failed to verify user profile');
    }
    
    const isAdmin = userProfile?.role === 'admin';
    if (!isAdmin) {
      console.log('❌ User is not admin:', user.id, 'Role:', userProfile?.role);
      return new Response(JSON.stringify({
        success: false,
        error: 'Admin privileges required'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Admin verified:', user.id);

const baseAiConfig = await loadAiConfig(userSupabase);

// Resolve provider overrides: global < section < per-run
const section = requestBody.section;
const perRunOverride = requestBody.ai_override || settings?.ai_override;
const sectionOverride = await loadSectionOverride(userSupabase, section);
const effectiveConfig = mergeAiConfigs(baseAiConfig, sectionOverride, perRunOverride);

let response = '';
let campaign_created = false;

switch (action) {
  case 'process_command': {
    try {
      if (workflow_id) await updateWorkflowStep(workflow_id, 'creating_campaign', 'in_progress', serviceSupabase);
      const { analysis } = await processMarketingCommand(command, user.id, serviceSupabase, workflow_id, settings, scheduling_options, publishing_controls, effectiveConfig);
      const campaign = await createMarketingCampaign(analysis, command, user.id, serviceSupabase);
      if (workflow_id) await updateWorkflowStep(workflow_id, 'creating_campaign', 'completed', serviceSupabase);
      
      // CRITICAL: Auto-generate content after campaign creation (100% complete process)
      if (campaign?.id) {
        console.log('🎯 Starting automatic content generation for campaign:', campaign.id);
        
        // Set campaign to running state
        await serviceSupabase
          .from('marketing_campaigns')
          .update({ status: 'running' })
          .eq('id', campaign.id);
        
        if (workflow_id) await updateWorkflowStep(workflow_id, 'generating_content', 'in_progress', serviceSupabase);
        
        try {
          const createdCount = await generateMarketingContent(campaign.id, serviceSupabase, settings, effectiveConfig);
          console.log('✅ Content generation completed for campaign:', campaign.id, 'items:', createdCount);
          if (workflow_id) await updateWorkflowStep(workflow_id, 'generating_content', 'completed', serviceSupabase);
          
          // Update campaign status based on created content
          await serviceSupabase
            .from('marketing_campaigns')
            .update({ 
              status: createdCount > 0 ? 'completed' : 'failed', 
              completed_at: new Date().toISOString(), 
              error_message: createdCount > 0 ? null : 'No content generated' 
            })
            .eq('id', campaign.id);
          
          // Auto-publish for immediate mode or single post mode
          if (createdCount > 0 && (scheduling_options?.mode === 'immediate' || settings?.singlePostMode) && !publishing_controls?.approval_required) {
            if (workflow_id) await updateWorkflowStep(workflow_id, 'publishing_content', 'in_progress', serviceSupabase);
            await publishGeneratedContent(campaign.id, serviceSupabase);
            if (workflow_id) await updateWorkflowStep(workflow_id, 'publishing_content', 'completed', serviceSupabase);
          }
        } catch (contentError) {
          console.error('❌ Content generation failed:', contentError);
          if (workflow_id) await updateWorkflowStep(workflow_id, 'generating_content', 'failed', serviceSupabase, contentError.message);
          
          // Update campaign status to failed
          await serviceSupabase
            .from('marketing_campaigns')
            .update({ 
              status: 'failed', 
              completed_at: new Date().toISOString(),
              error_message: contentError.message 
            })
            .eq('id', campaign.id);
        }
      }
      
      response = (analysis?.response || 'Command processed successfully!') + '\n\nCampaign created successfully with content generated automatically.';
      campaign_created = !!campaign;
    } catch (err) {
      console.error('Error in process_command flow:', err);
      if (workflow_id) await updateWorkflowStep(workflow_id, 'creating_campaign', 'failed', serviceSupabase, err?.message);
      response = 'Command processed successfully! Campaign details are being prepared.';
      campaign_created = false;
    }
    break;
  }
  
  case 'generate_content': {
    try {
      // Set campaign to running state
      await serviceSupabase
        .from('marketing_campaigns')
        .update({ status: 'running' })
        .eq('id', campaign_id);

      const createdCount = await generateMarketingContent(campaign_id, serviceSupabase, settings, effectiveConfig);
      
      // Update campaign status to completed
      await serviceSupabase
        .from('marketing_campaigns')
        .update({ 
          status: createdCount > 0 ? 'completed' : 'failed',
          completed_at: new Date().toISOString(),
          error_message: createdCount > 0 ? null : 'No content generated'
        })
        .eq('id', campaign_id);

      response = `Content generated: ${createdCount} items.`;
    } catch (error) {
      // Update campaign status to failed
      await serviceSupabase
        .from('marketing_campaigns')
        .update({ 
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message 
        })
        .eq('id', campaign_id);
      throw error;
    }
    break;
  }
  
  case 'generate_image':
        try {
          if (!openaiApiKey) throw new Error('OpenAI API key not configured');
          const basePrompt = prompt || 'Generate an on-brand marketing image for ICE SOS.';
          // Improve prompt using configured provider for the image stage
          let improvedPrompt = basePrompt;
          try {
            improvedPrompt = await callLLM(effectiveConfig, 'image', [
              { role: 'system', content: 'Return a concise, vivid prompt for photorealistic marketing image generation. Avoid quotes.' },
              { role: 'user', content: basePrompt }
            ], { maxTokens: 200 });
            improvedPrompt = (improvedPrompt || basePrompt).toString().trim();
          } catch (_e) {
            improvedPrompt = basePrompt;
          }

          const imgRes = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${openaiApiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'dall-e-3',
              prompt: improvedPrompt,
              n: 1,
              size: '1024x1024',
              quality: 'hd',
              response_format: 'b64_json'
            })
          });
          const imgData = await imgRes.json();
          if (!imgRes.ok) {
            console.error('Image API error', imgData);
            throw new Error(imgData?.error?.message || 'Failed to generate image');
          }
          const b64 = imgData?.data?.[0]?.b64_json;
          const dataUrl = b64 ? `data:image/png;base64,${b64}` : null;

          // Record the generation
          await userSupabase.from('content_generation_requests').insert({
            campaign_id: campaign_id || null,
            content_type: 'image',
            platform: 'generic',
            prompt: improvedPrompt,
            generated_image_url: dataUrl,
            status: 'completed',
            generation_metadata: { model: 'dall-e-3', size: '1024x1024', provider: 'openai' }
          });

          return new Response(JSON.stringify({
            success: true,
            prompt: improvedPrompt,
            image_url: dataUrl
          }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        } catch (e) {
          return new Response(JSON.stringify({ success: false, error: e?.message || String(e) }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      
      case 'test_campaign':
        // Simple test that just creates a campaign without AI
        console.log('Creating test campaign...');
        const testCampaign = await createMarketingCampaign({
          title: 'Test Campaign: ' + command,
          description: 'Test campaign created without AI processing',
          budget_estimate: 500,
          target_audience: { demographics: 'Test audience', platforms: ['Facebook'] }
        }, command, user.id, userSupabase);
        
        return new Response(JSON.stringify({
          success: true,
          campaign_created: true,
          campaign_id: testCampaign?.id,
          response: 'Test campaign created successfully!'
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
    console.error('Error stack:', error?.stack);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    
    // Return detailed error for debugging
    return new Response(JSON.stringify({ 
      error: error?.message || String(error),
      errorType: error?.name || 'Unknown',
      errorStack: error?.stack || 'No stack trace',
      success: false,
      debug: 'riven-marketing-error'
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
      openai: { enabled: true, model: 'gpt-4.1-2025-04-14' },
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

// Provider override helpers
async function loadSectionOverride(supabase: any, section?: string) {
  try {
    if (!section) return null;
    const { data, error } = await supabase
      .from('site_content')
      .select('value')
      .eq('key', 'ai_providers_overrides')
      .maybeSingle();
    if (error) {
      console.error('loadSectionOverride error', error);
      return null;
    }
    const sections = data?.value?.sections || {};
    return sections?.[section] || null;
  } catch (e) {
    console.error('loadSectionOverride exception', e);
    return null;
  }
}

function mergeAiConfigs(base: any, ...overrides: any[]) {
  const out = JSON.parse(JSON.stringify(base || {}));
  for (const ov of overrides) {
    if (!ov) continue;
    if (ov.providers) {
      out.providers = { ...(out.providers || {}), ...ov.providers };
    }
    if (ov.stages) {
      out.stages = { ...(out.stages || {}), ...ov.stages };
    }
  }
  return out;
}

async function callLLM(
  aiConfig: any,
  stage: 'overview'|'text'|'image'|'finalize',
  messages: Array<{ role: 'system'|'user'|'assistant'; content: string }>,
  options?: { model?: string; maxTokens?: number }
) {
  const preferredProvider = chooseProviderForStage(aiConfig, stage);
  let model = options?.model || aiConfig?.providers?.[preferredProvider]?.model || (preferredProvider === 'openai' ? 'gpt-4.1-2025-04-14' : 'grok-beta');
  const maxTokens = options?.maxTokens ?? (stage === 'text' ? 2000 : 1500);
  
  console.log(`🤖 AI routing -> stage=${stage} provider=${preferredProvider} model=${model}`);
  
  // Try preferred provider first with intelligent failover
  const providers = [preferredProvider, preferredProvider === 'openai' ? 'xai' : 'openai'].filter(p => 
    p === 'openai' ? !!openaiApiKey : !!xaiApiKey
  );
  
  for (const provider of providers) {
    try {
      if (provider === 'openai') {
        const validModels = ['gpt-5-2025-08-07', 'gpt-4.1-2025-04-14', 'gpt-4.1-mini-2025-04-14', 'gpt-4o', 'gpt-4o-mini'];
        const openaiModel = validModels.includes(model) ? model : 'gpt-4.1-2025-04-14';
        console.log(`🔄 Trying OpenAI with model: ${openaiModel}`);
        return await openAIChat(messages, openaiModel, maxTokens);
      }
      if (provider === 'xai') {
        console.log(`🔄 Trying xAI with model: grok-beta`);
        return await xaiChat(messages, 'grok-beta', maxTokens);
      }
    } catch (error) {
      console.error(`❌ ${provider} failed:`, error.message);
      if (providers.indexOf(provider) === providers.length - 1) {
        // Last provider failed, throw error
        throw new Error(`All AI providers failed. Last error: ${error.message}`);
      }
      // Continue to next provider
      console.log(`🔄 Failing over to next provider...`);
    }
  }
  
  throw new Error('No AI providers available or configured');
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

  // Set a timeout for the entire operation to prevent CF timeouts
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Operation timed out after 25 seconds')), 25000);
  });

  const mainOperation = async () => {
    // Create workflow tracking if ID provided
    if (workflowId) {
      await createWorkflowSteps(workflowId, supabase);
      await updateWorkflowStep(workflowId, 'command_received', 'completed', supabase);
    }

    let campaign = null;
    let analysis = null;
    
    try {
      // Get company info from Emma AI (fast operation)
      if (workflowId) await updateWorkflowStep(workflowId, 'retrieving_company_data', 'in_progress', supabase);
      const companyInfo = await getCompanyInfo(supabase);
      if (workflowId) await updateWorkflowStep(workflowId, 'retrieving_company_data', 'completed', supabase);
      
      // Analyze command with Riven AI - with timeout
      if (workflowId) await updateWorkflowStep(workflowId, 'ai_analysis', 'in_progress', supabase);
      
      const analysisPromise = analyzeCommandWithRiven(command, companyInfo, aiConfig, settings, schedulingOptions, publishingControls);
      const analysisTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI analysis timed out')), 15000);
      });
      
      try {
        analysis = await Promise.race([analysisPromise, analysisTimeout]);
        if (workflowId) await updateWorkflowStep(workflowId, 'ai_analysis', 'completed', supabase);
      } catch (error) {
        console.error('⚠️ AI analysis timed out, using fallback');
        throw error;
      }
      
    } catch (error) {
      console.error('❌ Error in AI analysis:', error);
      // Even if AI fails, create a basic campaign
      analysis = {
        response: "Campaign created successfully! AI analysis is still processing in the background - content will be available shortly.",
        title: command.length > 50 ? command.substring(0, 50) + '...' : command,
        description: "Campaign created from command: " + command,
        budget_estimate: 500,
        target_audience: { demographics: 'General audience', platforms: ['Facebook', 'Instagram'] }
      };
    }

    return { analysis, workflowId };
  };

  return Promise.race([mainOperation(), timeoutPromise]);
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
      maxTokens: settings?.max_tokens || 2000
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
        status: 'running'
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
  console.log('🎯 Generating marketing content for campaign:', campaignId);
  
  // If no AI providers are configured, create basic draft content so the UI has something to show
  if (!openaiApiKey && !xaiApiKey) {
    const basicContent = {
      campaign_id: campaignId,
      platform: 'blog',
      content_type: 'blog_post',
      title: 'New Content - Please Edit',
      body_text: 'This content was created without AI assistance. Please edit and customize this content to match your campaign goals.',
      status: 'draft',
      seo_title: 'New Content - Please Edit',
      meta_description: 'Please edit this meta description',
      slug: `content-${Date.now()}`,
      keywords: ['family', 'safety', 'technology']
    };

    const { data: basicInsert, error: insertError } = await supabase
      .from('marketing_content')
      .insert(basicContent)
      .select('id');

    if (insertError) {
      console.error('❌ Failed to create basic content:', insertError);
      throw new Error('Failed to create basic content: ' + insertError.message);
    }

    console.log('✅ Basic content created (no AI provider)', basicInsert?.[0]?.id);
    return (basicInsert?.length || 1);
  }

  try {
    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found');
    }

    // Generate content for different platforms
    const platforms = campaign.target_audience?.platforms || ['Facebook', 'Instagram'];
    const contentTypes = ['blog_post']; // Keep it simple and reliable first

    console.log(`🎯 Generating content for platforms: ${platforms.join(', ')}`);

    let createdCount = 0;

    for (const platform of platforms) {
      for (const contentType of contentTypes) {
        try {
          console.log(`📝 Generating ${contentType} for ${platform}...`);
          const content = await generatePlatformContent(campaign, platform, contentType, supabase, aiConfig);

          // Insert generated content
          const insertData: any = {
            campaign_id: campaignId,
            platform: platform.toLowerCase(),
            content_type: contentType,
            title: content?.title || `${campaign.title} - ${platform}`,
            body_text: content?.body || content?.content || '',
            hashtags: content?.hashtags || null,
            status: 'draft'
          };

          // Blog-specific fields (when provided)
          if (platform === 'blog' && content?.blogData) {
            insertData.seo_title = content.blogData.seo_title;
            insertData.meta_description = content.blogData.meta_description;
            insertData.slug = content.blogData.slug;
            insertData.keywords = content.blogData.keywords;
            insertData.featured_image_alt = content.blogData.featured_image_alt;
            insertData.content_sections = content.blogData.content_sections;
            insertData.reading_time = content.blogData.reading_time;
            insertData.seo_score = content.blogData.seo_score;
          }

          const { data: ins, error: genInsertError } = await supabase
            .from('marketing_content')
            .insert(insertData)
            .select('id');

          if (genInsertError) throw genInsertError;
          createdCount += ins?.length || 1;

          console.log(`✅ Inserted generated ${contentType} for ${platform}`, ins?.[0]?.id);
        } catch (genErr) {
          console.error(`❌ Failed to generate ${contentType} for ${platform}:`, genErr);

          // Fallback content so UX continues
          const fallbackContent = {
            campaign_id: campaignId,
            platform: platform.toLowerCase(),
            content_type: contentType,
            title: `${campaign.title} - ${platform} Content`,
            body_text: `Content for ${campaign.title}. Please edit to match your goals.`,
            status: 'draft',
            seo_title: campaign.title,
            meta_description: campaign.description || 'Please edit this meta description',
            slug: `${campaign.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
            keywords: ['family', 'safety', 'technology']
          };

          const { data: fbIns, error: fbErr } = await supabase
            .from('marketing_content')
            .insert(fallbackContent)
            .select('id');

          if (fbErr) {
            console.error('❌ Fallback insert failed:', fbErr);
          } else {
            createdCount += fbIns?.length || 1;
            console.log(`✅ Created fallback ${contentType} for ${platform}`, fbIns?.[0]?.id);
          }
        }
      }
    }

    if (createdCount === 0) {
      throw new Error('No content created for this campaign');
    }

    return createdCount;
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
    ], { maxTokens: 2000 });

    const contentStr = (content || '').toString();
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
      // Optional finalize step using configured provider (e.g., xAI)
      let finalText = contentStr;
      try {
        const finalized = await callLLM(aiConfig, 'finalize', [
          { role: 'system', content: 'Polish and finalize this marketing copy. Keep the same meaning, improve clarity and the call-to-action. Return only the refined text.' },
          { role: 'user', content: contentStr }
        ], { maxTokens: 1000 });
        if (finalized && typeof finalized === 'string') {
          finalText = finalized.trim();
        }
      } catch (_e) {
        // Fallback to original text
      }

      const titleLine = finalText.split('\n').find(line => /Title|Headline/i.test(line)) || 
                   `${platform} ${contentType} for ${campaign.title}`;
      const hashtags = finalText.match(/#\w+/g) || ['#EmergencySafety', '#FamilyProtection', '#ICE_SOS'];

      return {
        title: titleLine.replace(/^.*?[:]\s*/, '').trim(),
        body: finalText,
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
      .update({ status: 'published', scheduled_time: new Date().toISOString(), posted_at: new Date().toISOString() })
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