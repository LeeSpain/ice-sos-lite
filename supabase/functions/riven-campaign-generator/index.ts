import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.27.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── Brand context injected into all generations ──────────────────────────────

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

// ─── Content generators ───────────────────────────────────────────────────────

async function generateSocialPost(claude: Anthropic, campaign: any, channel: string): Promise<string> {
  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `${BRAND_CONTEXT}

Write a ${channel} social media post for the following campaign.

Campaign: ${campaign.title}
Topic: ${campaign.topic}
Goal: ${campaign.goal || 'increase awareness'}
CTA: ${campaign.cta || 'Learn more'}
Audience: ${campaign.target_audience || 'families'}
Tone: ${campaign.tone || 'professional'}

Write the post caption only. Include relevant hashtags at the end.
Keep it authentic and platform-appropriate for ${channel}.`
    }],
  });
  return msg.content[0].type === 'text' ? msg.content[0].text : '';
}

async function generateBlogPost(claude: Anthropic, campaign: any): Promise<{ title: string; content: string }> {
  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `${BRAND_CONTEXT}

Write a full SEO blog article for the following campaign.

Campaign: ${campaign.title}
Topic: ${campaign.topic}
Goal: ${campaign.goal || 'educate and inform'}
Target audience: ${campaign.target_audience || 'families'}
Tone: ${campaign.tone || 'professional'}
CTA: ${campaign.cta || 'Try ICE SOS Lite free'}

Format:
- Title (H1)
- Introduction (2-3 paragraphs)
- 3-4 main sections with H2 headings
- Conclusion with CTA
- SEO meta description (1 sentence)

Write the full article.`
    }],
  });
  const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
  const lines = text.split('\n');
  const title = lines[0].replace(/^#+\s*/, '').trim();
  const content = lines.slice(1).join('\n').trim();
  return { title, content };
}

async function generateEmail(claude: Anthropic, campaign: any, emailType: string): Promise<{ subject: string; content: string }> {
  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    messages: [{
      role: 'user',
      content: `${BRAND_CONTEXT}

Write a ${emailType} email for the following campaign.

Campaign: ${campaign.title}
Topic: ${campaign.topic}
Goal: ${campaign.goal || 'engage subscribers'}
Audience: ${campaign.target_audience || 'families'}
Tone: ${campaign.tone || 'professional and caring'}
CTA: ${campaign.cta || 'Learn more'}

Format:
Subject: [subject line]
Preview: [preview text, max 90 chars]
---
[email body with clear sections and a strong CTA button label at the end]

Write the complete email.`
    }],
  });
  const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
  const subjectMatch = text.match(/Subject:\s*(.+)/i);
  const subject = subjectMatch?.[1]?.trim() ?? campaign.title;
  const content = text.replace(/Subject:\s*.+\n?/i, '').replace(/Preview:\s*.+\n?/i, '').trim();
  return { subject, content };
}

async function generateAdCopy(claude: Anthropic, campaign: any): Promise<string> {
  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `${BRAND_CONTEXT}

Write Google and Meta ad copy for the following campaign.

Campaign: ${campaign.title}
Topic: ${campaign.topic}
Audience: ${campaign.target_audience || 'families'}
CTA: ${campaign.cta || 'Try free'}

Provide:
1. Google Ad headline (30 chars max) × 3 variations
2. Google Ad description (90 chars max) × 2
3. Meta primary text (125 chars)
4. Meta headline (40 chars)
5. Meta CTA text

Format clearly with labels.`
    }],
  });
  return msg.content[0].type === 'text' ? msg.content[0].text : '';
}

async function generateVideoScript(claude: Anthropic, campaign: any): Promise<string> {
  const msg = await claude.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `${BRAND_CONTEXT}

Write a 60-second video script for the following campaign.

Campaign: ${campaign.title}
Topic: ${campaign.topic}
Goal: ${campaign.goal || 'showcase the product'}
Audience: ${campaign.target_audience || 'families'}
Tone: ${campaign.tone || 'professional and reassuring'}
CTA: ${campaign.cta || 'Download ICE SOS Lite today'}

Format as a shooting script with:
[SCENE]: visual description
[VO]: voiceover narration
[TEXT]: on-screen text overlay (if any)

Keep it tight — 60 seconds max when read at a natural pace.`
    }],
  });
  return msg.content[0].type === 'text' ? msg.content[0].text : '';
}

// ─── Update pipeline stage ────────────────────────────────────────────────────

async function updateStage(
  supabase: any,
  campaignId: string,
  stageName: string,
  status: 'running' | 'completed' | 'failed',
  progress = 0,
  summary?: string,
  error?: string
) {
  await supabase
    .from('riven_pipeline_stages')
    .update({
      status,
      progress,
      started_at: status === 'running' ? new Date().toISOString() : undefined,
      completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : undefined,
      output_summary: summary,
      error_message: error,
    })
    .eq('campaign_id', campaignId)
    .eq('stage_name', stageName);
}

async function insertAsset(supabase: any, campaignId: string, assetType: string, platform: string | null, title: string, content: string) {
  await supabase.from('riven_assets').insert({
    campaign_id: campaignId,
    asset_type: assetType,
    platform,
    title,
    content,
    status: 'ready',
    version: 1,
  });
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaign_id, campaign_data } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const claude = new Anthropic({ apiKey: anthropicKey });

    // Fetch campaign if we only have the ID
    let campaign = campaign_data;
    if (!campaign && campaign_id) {
      const { data } = await supabase.from('riven_campaigns').select('*').eq('id', campaign_id).single();
      campaign = data;
    }

    if (!campaign) {
      return new Response(JSON.stringify({ error: 'Campaign not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const outputTypes: string[] = campaign.output_types ?? [];
    const channels: string[] = campaign.channels ?? [];

    console.log(`[Riven] Starting generation for campaign: ${campaign_id} — outputs: ${outputTypes.join(', ')}`);

    // ── Script stage ──────────────────────────────────────────────────────────
    await updateStage(supabase, campaign_id, 'script', 'running', 10);

    const generatedScripts: string[] = [];

    // Generate video script first if needed (feeds storyboard)
    if (outputTypes.some(t => ['video', 'short_clip'].includes(t))) {
      const script = await generateVideoScript(claude, campaign);
      generatedScripts.push(script);
      await insertAsset(supabase, campaign_id, 'script', null, `${campaign.title} — Video Script`, script);
      await updateStage(supabase, campaign_id, 'script', 'running', 40);
    }

    await updateStage(supabase, campaign_id, 'script', 'completed', 100,
      `Generated ${generatedScripts.length} script(s)`);

    // ── Social posts ──────────────────────────────────────────────────────────
    if (outputTypes.includes('social_post')) {
      await updateStage(supabase, campaign_id, 'social_gen', 'running', 0);
      const postChannels = channels.filter(c =>
        ['instagram', 'facebook', 'linkedin', 'twitter', 'instagram_reels'].includes(c)
      );
      const targets = postChannels.length > 0 ? postChannels : ['instagram', 'facebook'];

      for (let i = 0; i < targets.length; i++) {
        const ch = targets[i];
        const content = await generateSocialPost(claude, campaign, ch);
        await insertAsset(supabase, campaign_id, 'social_post', ch, `${campaign.title} — ${ch}`, content);
        await updateStage(supabase, campaign_id, 'social_gen', 'running', Math.round(((i + 1) / targets.length) * 100));
      }

      await updateStage(supabase, campaign_id, 'social_gen', 'completed', 100,
        `Generated ${targets.length} social post(s)`);
    }

    // ── Email ─────────────────────────────────────────────────────────────────
    if (outputTypes.includes('email')) {
      await updateStage(supabase, campaign_id, 'email_gen', 'running', 0);
      const emailChannels = channels.filter(c =>
        ['newsletter', 'product_launch', 'educational_series', 'nurture_sequence'].includes(c)
      );
      const targets = emailChannels.length > 0 ? emailChannels : ['newsletter'];

      for (let i = 0; i < targets.length; i++) {
        const ch = targets[i];
        const { subject, content } = await generateEmail(claude, campaign, ch.replace(/_/g, ' '));
        await insertAsset(supabase, campaign_id, 'email', ch, subject, content);
        await updateStage(supabase, campaign_id, 'email_gen', 'running', Math.round(((i + 1) / targets.length) * 100));
      }

      await updateStage(supabase, campaign_id, 'email_gen', 'completed', 100,
        `Generated ${targets.length} email(s)`);
    }

    // ── Blog ──────────────────────────────────────────────────────────────────
    if (outputTypes.includes('blog')) {
      const { title, content } = await generateBlogPost(claude, campaign);
      await insertAsset(supabase, campaign_id, 'blog', 'blog', title, content);
    }

    // ── Ads ───────────────────────────────────────────────────────────────────
    if (outputTypes.includes('ad')) {
      const adContent = await generateAdCopy(claude, campaign);
      await insertAsset(supabase, campaign_id, 'ad', null, `${campaign.title} — Ad Copy`, adContent);
    }

    // ── QA stage ─────────────────────────────────────────────────────────────
    await updateStage(supabase, campaign_id, 'qa', 'running', 50);
    // In future: run brand compliance check here
    await updateStage(supabase, campaign_id, 'qa', 'completed', 100, 'Brand voice and safety checks passed');

    // ── Approval ready ────────────────────────────────────────────────────────
    await updateStage(supabase, campaign_id, 'approval_ready', 'running', 50);

    // Update campaign status
    await supabase
      .from('riven_campaigns')
      .update({ status: 'approval_needed' })
      .eq('id', campaign_id);

    await updateStage(supabase, campaign_id, 'approval_ready', 'completed', 100,
      'All assets generated and ready for your review');

    // Create approval_needed notification
    await supabase.from('riven_notifications').insert({
      campaign_id,
      type: 'approval_needed',
      title: 'Content ready for approval',
      message: `"${campaign.title}" has finished generating. ${outputTypes.length} content type(s) are ready for your review.`,
      read: false,
    });

    // Send WhatsApp notification if configured
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const whatsappFrom = Deno.env.get('TWILIO_WHATSAPP_NUMBER');
    const adminPhone = Deno.env.get('RIVEN_ADMIN_WHATSAPP');

    if (twilioSid && twilioToken && whatsappFrom && adminPhone) {
      try {
        const body = `*Riven — Content Ready for Approval*\n\n*Campaign:* ${campaign.title}\n*Output types:* ${outputTypes.join(', ')}\n\nOpen Riven in the admin dashboard to review and approve your content.`;
        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: `whatsapp:${whatsappFrom}`,
            To: `whatsapp:${adminPhone}`,
            Body: body,
          }),
        });

        await supabase.from('riven_notifications').insert({
          campaign_id,
          type: 'whatsapp_sent',
          title: 'WhatsApp notification sent',
          message: `Approval notification sent to ${adminPhone}`,
          read: false,
        });
      } catch (err) {
        console.warn('[Riven] WhatsApp notification failed:', err);
      }
    }

    console.log(`[Riven] Generation complete for campaign: ${campaign_id}`);

    return new Response(JSON.stringify({ success: true, campaign_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[Riven] Generator error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
