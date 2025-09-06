import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WORKFLOW_STAGES = [
  { name: 'command_analysis', order: 1 },
  { name: 'content_creation', order: 2 },
  { name: 'image_generation', order: 3 },
  { name: 'quality_assembly', order: 4 },
  { name: 'approval_ready', order: 5 }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { command, title } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Processing enhanced marketing command: ${command}`);

    // Create campaign first
    const campaignId = await createCampaign(supabaseClient, command, title);
    console.log(`Created campaign with ID: ${campaignId}`);

    // Initialize workflow stages
    await initializeWorkflowStages(supabaseClient, campaignId);

    // Execute stages sequentially with updates
    await executeWorkflowStages(supabaseClient, campaignId, command);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Enhanced marketing workflow completed successfully',
        campaignId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in enhanced marketing function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process enhanced marketing command', 
        details: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function createCampaign(supabaseClient: any, command: string, title?: string) {
  console.log('Creating new campaign:', title || command);

  const campaignData = {
    title: title || `Marketing Campaign: ${command.substring(0, 50)}...`,
    description: command,
    command_input: command,
    status: 'running',
    created_by: '00000000-0000-0000-0000-000000000000', // System user for now
    target_audience: {
      created_via: 'enhanced_workflow',
      command_original: command
    }
  };

  const { data, error } = await supabaseClient
    .from('marketing_campaigns')
    .insert([campaignData])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create campaign: ${error.message}`);
  }

  console.log('Campaign created successfully:', data.id);
  return data.id;
}

async function initializeWorkflowStages(supabaseClient: any, campaignId: string) {
  console.log('Initializing workflow stages for campaign:', campaignId);

  // Create workflow stages
  const stages = WORKFLOW_STAGES.map(stage => ({
    campaign_id: campaignId,
    stage_name: stage.name,
    stage_order: stage.order,
    status: 'pending',
    output_data: {},
    metadata: {}
  }));

  const { error } = await supabaseClient
    .from('workflow_stages')
    .insert(stages);

  if (error) {
    throw new Error(`Failed to initialize workflow stages: ${error.message}`);
  }

  console.log('Workflow stages initialized successfully');
}

async function executeWorkflowStages(supabaseClient: any, campaignId: string, command: string) {
  console.log('Starting workflow execution for campaign:', campaignId);

  // Stage 1: Command Analysis
  await updateStageStatus(supabaseClient, campaignId, 'command_analysis', 'in_progress');
  const analysisResult = await executeCommandAnalysis(command);
  await updateStageStatus(supabaseClient, campaignId, 'command_analysis', 'completed', analysisResult);

  // Add delay to make the workflow visible
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Stage 2: Content Creation
  await updateStageStatus(supabaseClient, campaignId, 'content_creation', 'in_progress');
  const contentResult = await executeContentCreation(analysisResult, command);
  await updateStageStatus(supabaseClient, campaignId, 'content_creation', 'completed', contentResult);

  await new Promise(resolve => setTimeout(resolve, 2000));

  // Stage 3: Image Generation
  await updateStageStatus(supabaseClient, campaignId, 'image_generation', 'in_progress');
  const imageResult = await executeImageGeneration(contentResult);
  await updateStageStatus(supabaseClient, campaignId, 'image_generation', 'completed', imageResult);

  await new Promise(resolve => setTimeout(resolve, 1500));

  // Stage 4: Quality Assembly
  await updateStageStatus(supabaseClient, campaignId, 'quality_assembly', 'in_progress');
  const assemblyResult = await executeQualityAssembly(contentResult, imageResult);
  await updateStageStatus(supabaseClient, campaignId, 'quality_assembly', 'completed', assemblyResult);

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Stage 5: Create final content record
  await updateStageStatus(supabaseClient, campaignId, 'approval_ready', 'in_progress');
  await createFinalContent(supabaseClient, campaignId, assemblyResult);
  await updateStageStatus(supabaseClient, campaignId, 'approval_ready', 'completed', { ready: true });

  console.log('Workflow execution completed successfully');
}

async function updateStageStatus(
  supabaseClient: any, 
  campaignId: string, 
  stageName: string, 
  status: string, 
  outputData?: any
) {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  };

  if (status === 'in_progress') {
    updateData.started_at = new Date().toISOString();
  } else if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
    if (outputData) {
      updateData.output_data = outputData;
    }
  }

  const { error } = await supabaseClient
    .from('workflow_stages')
    .update(updateData)
    .eq('campaign_id', campaignId)
    .eq('stage_name', stageName);

  if (error) {
    console.error(`Failed to update stage ${stageName}:`, error);
    throw error;
  }

  console.log(`Stage ${stageName} updated to ${status}`);
}

async function executeCommandAnalysis(command: string) {
  console.log('Executing command analysis for:', command);

  // Simulate AI analysis
  await new Promise(resolve => setTimeout(resolve, 3000));

  const analysis = {
    strategy: `Comprehensive marketing strategy for: ${command}`,
    target_platforms: ['blog', 'social', 'email'],
    target_audience: 'tech-savvy professionals',
    content_types: ['blog_post'],
    seo_keywords: command.split(' ').slice(0, 5),
    tone: 'professional yet engaging'
  };

  console.log('Command analysis completed:', analysis);
  return analysis;
}

async function executeContentCreation(analysisResult: any, originalCommand: string) {
  console.log('Executing content creation based on analysis');

  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    console.warn('OpenAI API key not configured, using mock content');
  }

  // Simulate content generation with OpenAI
  await new Promise(resolve => setTimeout(resolve, 4000));

  const content = {
    title: `Ultimate Guide: ${originalCommand}`,
    body_text: `This is a comprehensive guide about ${originalCommand}. This content has been generated by our AI system to provide valuable insights and actionable advice for our readers.`,
    meta_description: `Learn everything about ${originalCommand} in this comprehensive guide.`,
    seo_title: `${originalCommand} - Complete Guide 2024`,
    word_count: 1200,
    seo_score: 85,
    readability_score: 78
  };

  console.log('Content creation completed:', content);
  return content;
}

async function executeImageGeneration(contentResult: any) {
  console.log('Executing image generation for content');

  // Simulate image generation
  await new Promise(resolve => setTimeout(resolve, 5000));

  const imageResult = {
    image_url: `https://picsum.photos/800/600?random=${Date.now()}`,
    image_prompt: `Professional illustration for: ${contentResult.title}`,
    alt_text: `Professional image representing ${contentResult.title}`,
    dimensions: { width: 800, height: 600 }
  };

  console.log('Image generation completed:', imageResult);
  return imageResult;
}

async function executeQualityAssembly(contentResult: any, imageResult: any) {
  console.log('Executing quality assembly');

  await new Promise(resolve => setTimeout(resolve, 2000));

  const assemblyResult = {
    ...contentResult,
    ...imageResult,
    quality_score: 92,
    content_sections: {
      introduction: contentResult.body_text.substring(0, 200),
      main_content: contentResult.body_text,
      conclusion: "In conclusion, this comprehensive guide provides valuable insights."
    },
    final_review: true,
    compliance_check: true
  };

  console.log('Quality assembly completed:', assemblyResult);
  return assemblyResult;
}

async function createFinalContent(supabaseClient: any, campaignId: string, assemblyResult: any) {
  console.log('Creating final content record');

  const contentData = {
    campaign_id: campaignId,
    platform: 'blog',
    content_type: 'blog_post',
    title: assemblyResult.title,
    body_text: assemblyResult.body_text,
    image_url: assemblyResult.image_url,
    seo_title: assemblyResult.seo_title,
    meta_description: assemblyResult.meta_description,
    featured_image_alt: assemblyResult.alt_text,
    content_sections: assemblyResult.content_sections,
    reading_time: Math.ceil(assemblyResult.word_count / 200),
    seo_score: assemblyResult.seo_score,
    status: 'draft'
  };

  const { error } = await supabaseClient
    .from('marketing_content')
    .insert([contentData]);

  if (error) {
    throw new Error(`Failed to create final content: ${error.message}`);
  }

  // Update campaign status
  await supabaseClient
    .from('marketing_campaigns')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', campaignId);

  console.log('Final content created successfully');
}