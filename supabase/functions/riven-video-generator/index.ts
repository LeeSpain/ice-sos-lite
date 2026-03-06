import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.27.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BRAND_CONTEXT = `
You are Riven, the AI content engine for ICE SOS Lite — a family emergency safety platform.

ICE SOS Lite helps families stay connected and protected in emergencies. Key features:
- One-press SOS activation (app or Bluetooth pendant)
- Instant emergency contact notification via calls, WhatsApp, and push
- Clara AI voice agent that calls the member during an SOS event
- Real-time location sharing during emergencies
- Family dashboard for monitoring loved ones
- Multi-language support (English, Spanish, Dutch)

Target audiences: families with elderly parents, older adults, carers, healthcare professionals, care organisations, B2B partners.

Brand voice: professional, empathetic, trustworthy, reassuring, clear. Never alarmist. Always human.
`.trim();

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function updateJob(
  supabase: any,
  jobId: string,
  patch: Record<string, unknown>
) {
  await supabase.from('riven_video_jobs').update(patch).eq('id', jobId);
}

// ─── Script generator ─────────────────────────────────────────────────────────

async function generateScript(
  claude: Anthropic,
  job: any
): Promise<string> {
  const durationLabel: Record<string, string> = {
    '30s':    '30-second',
    '60s':    '60-second',
    '90s':    '90-second',
    '3-5min': '3 to 5 minute',
    '5min+':  '5+ minute',
  };

  const formatLabel: Record<string, string> = {
    '16:9': 'landscape (16:9)',
    '9:16': 'vertical / portrait (9:16) for social reels',
    '1:1':  'square (1:1)',
  };

  const typeInstructions: Record<string, string> = {
    product_promo:  'Highlight key product features and benefits with a strong CTA.',
    walkthrough:    'Walk the viewer step-by-step through the product interface.',
    explainer:      'Explain the problem the product solves and how it works.',
    social_reel:    'Short, punchy, high-energy reel optimised for social feeds.',
    educational:    'Teach the audience something valuable related to family safety.',
    trust:          'Build credibility through testimonials, stats, and proof points.',
    onboarding:     'Guide new users through their first steps with the product.',
    announcement:   'Announce a new feature, update, or event in an exciting way.',
  };

  const duration = durationLabel[job.duration_target] ?? '60-second';
  const format   = formatLabel[job.format] ?? 'landscape';
  const typeHint = typeInstructions[job.video_type] ?? 'Create an engaging video.';
  const brief    = job.script ?? 'No brief provided. Use brand guidelines and best judgement.';

  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `${BRAND_CONTEXT}

You are writing a shooting script for a ${duration} ${format} video.

Video type: ${job.video_type.replace(/_/g, ' ')}
Objective: ${typeHint}
Source brief: ${brief}
${job.source_url ? `Reference URL: ${job.source_url}` : ''}

Write a professional shooting script with the following format for each scene:
[SCENE X]: Visual description — what the camera shows, setting, any on-screen action
[VO]: Voiceover narration — spoken words
[TEXT]: On-screen text overlay (if applicable — keep short)
[MUSIC]: Music/sound direction (brief note only)

Guidelines:
- Keep total narration length appropriate for ${duration} when read at a natural pace (~130 wpm)
- ${format === '9:16' ? 'Optimise framing for vertical video — close-ups, text safe zones for mobile' : 'Standard widescreen composition'}
- End with a clear CTA
- Tone: professional, empathetic, trustworthy. Never alarmist.

Write the complete script now.`,
    }],
  });

  return msg.content[0].type === 'text' ? msg.content[0].text : '';
}

// ─── Storyboard generator ─────────────────────────────────────────────────────

async function generateStoryboard(
  claude: Anthropic,
  job: any,
  script: string
): Promise<object[]> {
  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `${BRAND_CONTEXT}

Based on the shooting script below, create a structured storyboard as a JSON array.
Each storyboard scene must be a JSON object with these fields:
- scene_number (integer)
- duration_seconds (integer — how long this scene should last)
- visual_description (string — what is shown on screen)
- voiceover (string — exact narration text, or null)
- on_screen_text (string — text overlay, or null)
- camera_direction (string — e.g. "Close-up", "Wide shot", "Cut to", "Pan left")
- color_palette (array of 2-3 hex color suggestions that fit the scene mood)
- mood (string — one of: energetic | calm | urgent | warm | professional | inspiring)
- music_note (string — brief music/sound direction, or null)

Script:
${script}

Return ONLY a valid JSON array, no other text.`,
    }],
  });

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '[]';

  // Parse the JSON safely
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }
}

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

    // Fetch the job
    const { data: job, error: jobErr } = await supabase
      .from('riven_video_jobs')
      .select('*')
      .eq('id', job_id)
      .single();

    if (jobErr || !job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`[Riven Video] Starting job ${job_id} — type: ${job.video_type}`);

    // ── Stage 1: Script ──────────────────────────────────────────────────────
    await updateJob(supabase, job_id, { status: 'scripting', progress: 10 });

    const script = await generateScript(claude, job);
    await updateJob(supabase, job_id, {
      script,
      status: 'storyboard',
      progress: 40,
    });

    console.log(`[Riven Video] Script complete for job ${job_id}`);

    // ── Stage 2: Storyboard ──────────────────────────────────────────────────
    const storyboard = await generateStoryboard(claude, job, script);
    await updateJob(supabase, job_id, {
      storyboard,
      status: 'assets',
      progress: 70,
    });

    console.log(`[Riven Video] Storyboard complete — ${storyboard.length} scenes for job ${job_id}`);

    // ── Stage 3: Assets prep (placeholder — Phase 2 will add ComfyUI here) ──
    await updateJob(supabase, job_id, {
      status: 'rendering',
      progress: 85,
      render_config: {
        format: job.format,
        duration_target: job.duration_target,
        video_type: job.video_type,
        scene_count: storyboard.length,
        phase: 2,
        note: 'Awaiting Remotion/FFmpeg integration in Phase 2',
      },
    });

    // ── Stage 4: Mark complete (rendering deferred to Phase 2) ───────────────
    await updateJob(supabase, job_id, {
      status: 'complete',
      progress: 100,
    });

    // Create a notification
    await supabase.from('riven_notifications').insert({
      campaign_id: job.campaign_id ?? null,
      type: 'generation_complete',
      title: 'Video job ready',
      message: `"${job.title}" script and storyboard are complete. Rendering will be available in Phase 2.`,
      read: false,
    });

    console.log(`[Riven Video] Job ${job_id} complete`);

    return new Response(JSON.stringify({ success: true, job_id, scene_count: storyboard.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[Riven Video] Error:', err);

    // Try to mark job failed if we have the job_id
    try {
      const { job_id } = await (req as any).json?.() ?? {};
      if (job_id) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        await supabase.from('riven_video_jobs').update({
          status: 'failed',
          error_message: String(err),
        }).eq('id', job_id);
      }
    } catch { /* best effort */ }

    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
