import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageGenerationRequest {
  contentId: string;
  prompt: string;
  platform: string;
  style?: string;
  size?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { contentId, prompt, platform, style = 'vivid', size = '1024x1024' }: ImageGenerationRequest = await req.json();

    console.log(`Generating image for content ${contentId}`, { prompt, platform, style, size });

    // Generate image using OpenAI DALL-E
    const imageUrl = await generateImage(prompt, style, size, platform);

    // Update content with generated image
    const { error: updateError } = await supabaseClient
      .from('marketing_content')
      .update({ 
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', contentId);

    if (updateError) {
      console.error('Failed to update content with image:', updateError);
      throw new Error('Failed to save generated image');
    }

    // Log generation request
    await supabaseClient
      .from('content_generation_requests')
      .insert({
        campaign_id: null,
        content_type: 'image',
        platform,
        prompt,
        generated_image_url: imageUrl,
        status: 'completed',
        completed_at: new Date().toISOString(),
        generation_metadata: {
          style,
          size,
          model: 'gpt-image-1'
        }
      });

    return new Response(JSON.stringify({ 
      success: true,
      imageUrl,
      contentId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generateImage(prompt: string, style: string, size: string, platform: string): Promise<string> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Enhance prompt based on platform and requirements
  const enhancedPrompt = enhancePromptForPlatform(prompt, platform);

  console.log('Generating image with enhanced prompt:', enhancedPrompt);

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: enhancedPrompt,
      n: 1,
      size: size,
      style: style,
      quality: 'hd',
      response_format: 'url'
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('OpenAI API error:', errorData);
    throw new Error(`Image generation failed: ${errorData.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  
  if (!data.data || data.data.length === 0) {
    throw new Error('No image generated');
  }

  return data.data[0].url;
}

function enhancePromptForPlatform(prompt: string, platform: string): string {
  const platformSpecs = {
    facebook: {
      aspectRatio: '16:9 or square format',
      style: 'professional and engaging',
      requirements: 'high-resolution, suitable for Facebook feed'
    },
    instagram: {
      aspectRatio: 'square 1:1 format',
      style: 'visually appealing and Instagram-ready',
      requirements: 'vibrant colors, aesthetic composition for Instagram'
    },
    twitter: {
      aspectRatio: '16:9 format',
      style: 'eye-catching and shareable',
      requirements: 'clear and readable for Twitter timeline'
    },
    linkedin: {
      aspectRatio: '16:9 format',
      style: 'professional and business-appropriate',
      requirements: 'corporate-friendly, suitable for LinkedIn professional network'
    },
    youtube: {
      aspectRatio: '16:9 format for thumbnail',
      style: 'attention-grabbing thumbnail style',
      requirements: 'YouTube thumbnail optimized, bold and clear'
    }
  };

  const spec = platformSpecs[platform as keyof typeof platformSpecs] || platformSpecs.facebook;

  return `${prompt}. Create this in ${spec.aspectRatio}, with a ${spec.style} aesthetic. ${spec.requirements}. High quality, professional, ultra-detailed, perfect composition.`;
}

// Alternative function using Hugging Face if OpenAI is not available
async function generateImageWithHuggingFace(prompt: string, platform: string): Promise<string> {
  const hfToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
  if (!hfToken) {
    throw new Error('Hugging Face API token not configured');
  }

  const enhancedPrompt = enhancePromptForPlatform(prompt, platform);

  const response = await fetch('https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hfToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: enhancedPrompt,
      parameters: {
        guidance_scale: 7.5,
        num_inference_steps: 25,
        width: 1024,
        height: 1024
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.statusText}`);
  }

  const imageBlob = await response.blob();
  const arrayBuffer = await imageBlob.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
  
  return `data:image/png;base64,${base64}`;
}