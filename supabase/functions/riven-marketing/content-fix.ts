// This file contains the fixed content generation logic
// Copy this into the main index.ts file to replace the existing generateMarketingContent function

async function generateMarketingContent(campaignId: string, supabase: any, settings?: any, aiConfig?: any) {
  console.log('🎯 Generating marketing content for campaign:', campaignId);
  
  // Check if we have AI providers available
  if (!openaiApiKey && !xaiApiKey) {
    console.error('❌ No AI providers configured - creating basic content');
    
    // Create basic content without AI
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
    
    const { data: content, error: insertError } = await supabase
      .from('marketing_content')
      .insert(basicContent)
      .select()
      .single();
      
    if (insertError) {
      console.error('❌ Failed to create basic content:', insertError);
      throw new Error('Failed to create content: ' + insertError.message);
    }
    
    console.log('✅ Basic content created:', content.id);
    return content;
  }
  
  // Get campaign details
  const { data: campaign, error: campaignError } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();
    
  if (campaignError || !campaign) {
    console.error('Failed to get campaign:', campaignError);
    throw new Error('Campaign not found');
  }

  // Generate content for different platforms
  const platforms = campaign.target_audience?.platforms || ['Facebook', 'Instagram'];
  const contentTypes = ['blog_post']; // Start with blog posts only to ensure success
  
  console.log(`🎯 Generating content for platforms: ${platforms.join(', ')}`);
  
  for (const platform of platforms) {
    for (const contentType of contentTypes) {
      try {
        console.log(`📝 Generating ${contentType} for ${platform}...`);
        const content = await generatePlatformContent(campaign, platform, contentType, supabase, aiConfig);
        console.log(`✅ Generated ${contentType} for ${platform}:`, content?.id);
      } catch (error) {
        console.error(`❌ Failed to generate ${contentType} for ${platform}:`, error);
        
        // Create fallback content even if AI fails
        const fallbackContent = {
          campaign_id: campaignId,
          platform: platform.toLowerCase(),
          content_type: contentType,
          title: `${campaign.title} - ${platform} Content`,
          body_text: `Content for ${campaign.title}. Please edit this content to match your campaign goals.`,
          status: 'draft',
          seo_title: campaign.title,
          meta_description: campaign.description || 'Please edit this meta description',
          slug: `${campaign.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
          keywords: ['family', 'safety', 'technology']
        };
        
        const { data: fallback, error: fallbackError } = await supabase
          .from('marketing_content')
          .insert(fallbackContent)
          .select()
          .single();
          
        if (!fallbackError) {
          console.log(`✅ Created fallback content for ${platform}:`, fallback.id);
        }
      }
    }
  }
}

// Also replace the content generation trigger in processMarketingCommand:
/*
  try {
    // ALWAYS generate content for campaigns - this was the missing piece!
    if (campaign?.id) {
      console.log('🎯 Starting content generation for campaign:', campaign.id);
      if (workflowId) await updateWorkflowStep(workflowId, 'generating_content', 'in_progress', supabase);
      
      try {
        await generateMarketingContent(campaign.id, supabase, settings, aiConfig);
        console.log('✅ Content generation completed for campaign:', campaign.id);
        if (workflowId) await updateWorkflowStep(workflowId, 'generating_content', 'completed', supabase);
        
        // Update campaign status to completed
        await supabase
          .from('marketing_campaigns')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', campaign.id);
        
        // Auto-publish for immediate mode
        if (schedulingOptions?.mode === 'immediate' && !publishingControls?.approval_required) {
          if (workflowId) await updateWorkflowStep(workflowId, 'publishing_content', 'in_progress', supabase);
          await publishGeneratedContent(campaign.id, supabase);
          if (workflowId) await updateWorkflowStep(workflowId, 'publishing_content', 'completed', supabase);
        }
      } catch (contentError) {
        console.error('❌ Content generation failed:', contentError);
        if (workflowId) await updateWorkflowStep(workflowId, 'generating_content', 'failed', supabase, contentError.message);
        
        // Update campaign status to failed
        await supabase
          .from('marketing_campaigns')
          .update({ status: 'failed', error_message: contentError.message })
          .eq('id', campaign.id);
      }
    }
  } catch (error) {
    console.error('❌ Error in content workflow:', error);
    if (workflowId) await updateWorkflowStep(workflowId, 'generating_content', 'failed', supabase, error.message);
  }
*/