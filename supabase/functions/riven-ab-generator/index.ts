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
ICE SOS Lite: one-press SOS, Clara AI voice agent, real-time location sharing, family dashboard, multi-language.
`.trim();

// ─── Strategy prompts ─────────────────────────────────────────────────────────

function buildVariantPrompt(strategy: string, originalContent: string, assetType: string): string {
  const base = `${BRAND_CONTEXT}

Below is Version A of a ${assetType.replace(/_/g, ' ')} asset. You must write Version B — a genuine alternative that could outperform Version A in A/B testing.

Version A:
${originalContent}

Rules:
- Preserve the core message and product/service being promoted
- Match the approximate length unless the strategy calls for a change
- Keep the brand voice: professional, empathetic, human
- Write ONLY the Version B content, no labels or explanations
`;

  const strategies: Record<string, string> = {
    hook_change:    base + '\nStrategy: COMPLETELY rewrite the opening hook. The first sentence/line must be entirely different while the rest can adapt naturally.',
    tone_shift:     base + '\nStrategy: Shift the tone — if Version A is professional, make B warmer and more personal. If it\'s formal, make B conversational. Keep the message.',
    cta_change:     base + '\nStrategy: Keep the body largely the same but write a completely different call-to-action. Different wording, different urgency level, or different placement.',
    length_change:  base + '\nStrategy: Create a significantly shorter version (half the length or less) that still conveys the essential message.',
    angle_change:   base + '\nStrategy: Approach from a completely different angle. If A focuses on fear/safety, B should focus on peace of mind. If A leads with features, B should lead with outcome/feeling.',
    social_proof:   base + '\nStrategy: Rewrite to lead with or prominently feature a social proof element (a realistic statistic, implied testimonial, or trust signal relevant to ICE SOS Lite).',
    question_format: base + '\nStrategy: Restructure so it opens with a compelling question that makes the target audience self-identify (e.g. "Do you know what would happen if your mum had a fall and no one knew?").',
    story_format:   base + '\nStrategy: Rewrite as a micro-story or scenario. Put the reader into a realistic situation where ICE SOS Lite would matter. Then deliver the solution.',
  };

  return strategies[strategy] ?? base + `\nStrategy: Create a meaningfully different version of this content.`;
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      variant_id,
      asset_id,
      strategy_id,
      hypothesis,
      original_content,
      asset_type,
    } = await req.json();

    const supabaseUrl  = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const claude   = new Anthropic({ apiKey: anthropicKey });

    console.log(`[Riven A/B] Generating variant ${variant_id} — strategy: ${strategy_id}`);

    // Fetch original asset if content not provided
    let content = original_content;
    let type    = asset_type;

    if (!content) {
      const { data: asset } = await supabase
        .from('riven_assets')
        .select('content, asset_type, campaign_id, title')
        .eq('id', asset_id)
        .single();
      content = asset?.content ?? '';
      type    = asset?.asset_type ?? 'social_post';
    }

    if (!content) {
      return new Response(JSON.stringify({ error: 'No source content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate variant
    const prompt = buildVariantPrompt(strategy_id, content, type);

    const msg = await claude.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const variantContent = msg.content[0].type === 'text' ? msg.content[0].text : '';

    // Fetch the original asset's campaign_id and title
    const { data: origAsset } = await supabase
      .from('riven_assets')
      .select('campaign_id, title, platform')
      .eq('id', asset_id)
      .single();

    // Create a new asset for Version B
    const { data: variantAsset } = await supabase.from('riven_assets').insert({
      campaign_id: origAsset?.campaign_id,
      asset_type:  type,
      platform:    origAsset?.platform,
      title:       `${origAsset?.title ?? 'Asset'} — Version B (${strategy_id.replace(/_/g, ' ')})`,
      content:     variantContent,
      status:      'ready',
      version:     2,
    }).select().single();

    // Update the variant record
    await supabase.from('riven_ab_variants').update({
      variant_asset_id: variantAsset?.id,
      status:           'draft',
    }).eq('id', variant_id);

    console.log(`[Riven A/B] Variant ${variant_id} complete → asset ${variantAsset?.id}`);

    return new Response(JSON.stringify({
      success:          true,
      variant_id,
      variant_asset_id: variantAsset?.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[Riven A/B] Error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
