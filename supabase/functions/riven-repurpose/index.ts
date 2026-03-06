import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.27.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BRAND_CONTEXT = `
You are Riven, the AI content engine for ICE SOS Lite — a family emergency safety platform.
Brand voice: professional, empathetic, trustworthy, reassuring, clear. Never alarmist. Always human.
ICE SOS Lite: one-press SOS, Clara AI voice agent, real-time location, family dashboard.
`.trim();

// ─── Repurpose strategies ─────────────────────────────────────────────────────

const REPURPOSE_PROMPTS: Record<string, (content: string, opts: any) => string> = {

  long_to_short: (content, opts) => `${BRAND_CONTEXT}

Condense the following long-form content into a punchy short version (max 280 characters) optimised for ${opts.target_platform ?? 'social media'}.
Preserve the core message and CTA. Remove all unnecessary words.

Original content:
${content}

Write ONLY the condensed version, nothing else.`,

  video_to_post: (content, opts) => `${BRAND_CONTEXT}

The following is a video script. Convert it into a social media post for ${opts.target_platform ?? 'Instagram'}.
Capture the key moments and emotion. Add 3-5 relevant hashtags at the end.

Video script:
${content}

Write ONLY the social post, nothing else.`,

  blog_to_social: (content, opts) => `${BRAND_CONTEXT}

Convert the following blog article into ${opts.target_platform === 'linkedin' ? 'a LinkedIn article post' : 'an engaging social media post'}.
${opts.target_platform === 'twitter' ? 'Keep it under 280 characters.' : 'Aim for 150-300 characters plus hashtags.'}

Blog article:
${content}

Write ONLY the social post, nothing else.`,

  email_to_post: (content, opts) => `${BRAND_CONTEXT}

Convert the following email into a social media post for ${opts.target_platform ?? 'LinkedIn'}.
Extract the most compelling insight or offer and make it shareable.

Email:
${content}

Write ONLY the social post, nothing else.`,

  post_to_thread: (content, _opts) => `${BRAND_CONTEXT}

Expand the following social media post into a Twitter/X thread.
Format as numbered tweets, each under 280 characters. Aim for 5-8 tweets.
First tweet should be the hook. Last tweet should include CTA.

Post:
${content}

Write ONLY the thread, formatted as:
1/ [tweet]
2/ [tweet]
etc.`,

  long_to_reel: (content, opts) => `${BRAND_CONTEXT}

Convert the following long-form content into a ${opts.target_format ?? '9:16'} short-form video script (30-60 seconds).
Format as:
[SCENE]: visual
[VO]: voiceover
[TEXT]: on-screen text (brief)

Keep it high-energy and mobile-optimised.

Source content:
${content}

Write ONLY the video script.`,

  blog_to_email: (content, _opts) => `${BRAND_CONTEXT}

Transform the following blog article into a nurture email.
Format:
Subject: [subject line]
Preview: [preview text, max 90 chars]
---
[Email body — concise, value-forward, single CTA]

Blog article:
${content}

Write ONLY the email, starting with Subject:`,

  ad_to_organic: (content, opts) => `${BRAND_CONTEXT}

Transform the following ad copy into organic, non-promotional social content for ${opts.target_platform ?? 'Instagram'}.
Keep the core benefit but remove any ad-specific calls to action. Make it feel authentic and helpful.

Ad copy:
${content}

Write ONLY the organic post, nothing else.`,
};

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { job_id } = await req.json();

    const supabaseUrl  = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const claude   = new Anthropic({ apiKey: anthropicKey });

    // Fetch job + source asset
    const { data: job } = await supabase
      .from('riven_repurpose_jobs')
      .select('*, riven_assets(title, content, asset_type, campaign_id)')
      .eq('id', job_id)
      .single();

    if (!job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[Riven Repurpose] Starting job ${job_id} — type: ${job.repurpose_type}`);

    // Mark running
    await supabase.from('riven_repurpose_jobs').update({ status: 'running' }).eq('id', job_id);

    const sourceAsset = job.riven_assets;
    const sourceContent = sourceAsset?.content ?? '';

    if (!sourceContent) {
      await supabase.from('riven_repurpose_jobs').update({
        status: 'failed',
        error_message: 'Source asset has no content to repurpose',
      }).eq('id', job_id);
      return new Response(JSON.stringify({ error: 'No source content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build prompt
    const promptFn = REPURPOSE_PROMPTS[job.repurpose_type];
    if (!promptFn) {
      await supabase.from('riven_repurpose_jobs').update({
        status: 'failed',
        error_message: `Unknown repurpose type: ${job.repurpose_type}`,
      }).eq('id', job_id);
      return new Response(JSON.stringify({ error: 'Unknown repurpose type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = promptFn(sourceContent, {
      target_platform: job.target_platform,
      target_format:   job.target_format,
      instructions:    job.instructions,
    });

    // Generate
    const msg = await claude.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const generatedContent = msg.content[0].type === 'text' ? msg.content[0].text : '';

    // Determine output asset type
    const assetTypeMap: Record<string, string> = {
      long_to_short:  'social_post',
      video_to_post:  'social_post',
      blog_to_social: 'social_post',
      email_to_post:  'social_post',
      post_to_thread: 'social_post',
      long_to_reel:   'short_clip',
      blog_to_email:  'email',
      ad_to_organic:  'social_post',
    };

    const outputAssetType = assetTypeMap[job.repurpose_type] ?? 'social_post';

    // Parse email subject if blog_to_email
    let outputTitle = `${sourceAsset?.title ?? 'Content'} — Repurposed (${job.repurpose_type.replace(/_/g, ' ')})`;
    let outputContent = generatedContent;

    if (job.repurpose_type === 'blog_to_email') {
      const subjectMatch = generatedContent.match(/Subject:\s*(.+)/i);
      if (subjectMatch) {
        outputTitle = subjectMatch[1].trim();
        outputContent = generatedContent.replace(/Subject:\s*.+\n?/i, '').replace(/Preview:\s*.+\n?/i, '').trim();
      }
    }

    // Save output asset
    const { data: outputAsset } = await supabase.from('riven_assets').insert({
      campaign_id: job.campaign_id ?? sourceAsset?.campaign_id,
      asset_type:  outputAssetType,
      platform:    job.target_platform,
      title:       outputTitle,
      content:     outputContent,
      status:      'ready',
      version:     1,
    }).select().single();

    // Update job as complete
    await supabase.from('riven_repurpose_jobs').update({
      status:          'complete',
      output_asset_id: outputAsset?.id ?? null,
    }).eq('id', job_id);

    console.log(`[Riven Repurpose] Job ${job_id} complete → asset ${outputAsset?.id}`);

    return new Response(JSON.stringify({
      success: true,
      job_id,
      output_asset_id: outputAsset?.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[Riven Repurpose] Error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
