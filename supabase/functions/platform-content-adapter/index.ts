// platform-content-adapter
// Given marketing content, uses GPT-4o-mini to rewrite it with platform-specific rules
// for Twitter/X, Facebook, LinkedIn, and Instagram.
// Writes one row per platform into social_media_posting_queue.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdapterRequest {
  content_id: string;
  platforms?: string[]; // defaults to ['twitter', 'facebook', 'linkedin', 'instagram']
  original_title?: string;
  original_body?: string;
  image_url?: string;
  scheduled_time?: string; // ISO string — if set, rows are created as 'scheduled', else 'queued'
  user_id?: string;
}

interface PlatformAdapted {
  platform: string;
  adapted_text: string;
  hashtags: string[];
  character_count: number;
}

const PLATFORM_RULES: Record<string, string> = {
  twitter: `You are rewriting marketing content for Twitter/X.
Rules:
- Maximum 240 characters (leave room for a link)
- Start with a punchy hook
- 1-2 hashtags only
- Emojis are fine
- Direct, punchy language
Respond with ONLY valid JSON: {"adapted_text": "...", "hashtags": ["#tag1"]}`,

  facebook: `You are rewriting marketing content for Facebook.
Rules:
- 150-250 words
- Emotional or story-driven angle
- End with a question to drive comments
- 3-5 relevant hashtags
- Link preview friendly (don't add raw URLs — they'll be attached separately)
Respond with ONLY valid JSON: {"adapted_text": "...", "hashtags": ["#tag1", "#tag2"]}`,

  linkedin: `You are rewriting marketing content for LinkedIn.
Rules:
- 200-400 words
- Professional, insight-led tone
- No fluff or hype
- Maximum 3 hashtags
- Thought-leadership angle that provides genuine value
- No exclamation marks unless truly warranted
Respond with ONLY valid JSON: {"adapted_text": "...", "hashtags": ["#tag1"]}`,

  instagram: `You are rewriting marketing content for Instagram.
Rules:
- 100-150 words for the caption
- Emoji-heavy, visual language
- End with "link in bio" call to action
- The hashtags field should contain 20-25 relevant hashtags (these go in the first comment)
- Do NOT put hashtags in the adapted_text itself — keep the caption clean
Respond with ONLY valid JSON: {"adapted_text": "...", "hashtags": ["#hashtag1", "#hashtag2", ...25 total...]}`,
};

async function adaptForPlatform(
  platform: string,
  title: string,
  body: string,
  apiKey: string
): Promise<PlatformAdapted> {
  const systemPrompt = PLATFORM_RULES[platform] || PLATFORM_RULES.facebook;
  const userPrompt = `Original Title: ${title}\n\nOriginal Content:\n${body}\n\nRewrite this content following your platform rules. Respond ONLY with valid JSON.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_completion_tokens: 600,
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI error for ${platform}: ${errText}`);
  }

  const data = await response.json();
  const raw = JSON.parse(data.choices[0].message.content);

  const adaptedText: string = raw.adapted_text || "";
  const hashtags: string[] = Array.isArray(raw.hashtags) ? raw.hashtags : [];

  return {
    platform,
    adapted_text: adaptedText,
    hashtags,
    character_count: adaptedText.length,
  };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const body: AdapterRequest = await req.json();
    const {
      content_id,
      platforms = ["twitter", "facebook", "linkedin", "instagram"],
      original_title,
      original_body,
      image_url,
      scheduled_time,
      user_id,
    } = body;

    if (!content_id) {
      throw new Error("content_id is required");
    }

    // Load content from DB if not provided inline
    let title = original_title || "";
    let bodyText = original_body || "";
    let imageUrl = image_url || null;

    if (!title || !bodyText) {
      const { data: content, error: contentError } = await supabase
        .from("marketing_content")
        .select("title, body_text, image_url, campaign_id")
        .eq("id", content_id)
        .single();

      if (contentError || !content) {
        throw new Error(`Content ${content_id} not found: ${contentError?.message}`);
      }

      title = title || content.title || "ICE SOS Update";
      bodyText = bodyText || content.body_text || "";
      imageUrl = imageUrl || content.image_url || null;
    }

    console.log(`[platform-content-adapter] Adapting content ${content_id} for platforms: ${platforms.join(", ")}`);

    // Adapt content for each platform in parallel
    const adaptResults = await Promise.allSettled(
      platforms.map((platform) => adaptForPlatform(platform, title, bodyText, openaiApiKey))
    );

    const adapted: PlatformAdapted[] = [];
    const errors: Record<string, string> = {};

    for (let i = 0; i < platforms.length; i++) {
      const result = adaptResults[i];
      if (result.status === "fulfilled") {
        adapted.push(result.value);
      } else {
        console.error(`[platform-content-adapter] Failed to adapt for ${platforms[i]}:`, result.reason);
        errors[platforms[i]] = result.reason?.message || "Unknown error";
        // Push fallback text
        adapted.push({
          platform: platforms[i],
          adapted_text: `${title}\n\n${bodyText}`.trim(),
          hashtags: [],
          character_count: (title + bodyText).length,
        });
      }
    }

    // Fetch OAuth accounts for queue rows
    // We look for connected accounts — pick first connected per platform
    const { data: oauthAccounts } = await supabase
      .from("social_media_oauth")
      .select("id, platform, user_id, connection_status")
      .eq("connection_status", "connected")
      .in("platform", platforms.map(p => p === "twitter" ? "twitter" : p));

    const oauthByPlatform: Record<string, string> = {};
    for (const account of oauthAccounts || []) {
      // Prefer user-specific account if user_id provided
      const p = account.platform;
      if (!oauthByPlatform[p] || (user_id && account.user_id === user_id)) {
        oauthByPlatform[p] = account.id;
      }
    }
    // twitter alias
    if (oauthByPlatform["twitter"] && !oauthByPlatform["x"]) {
      oauthByPlatform["x"] = oauthByPlatform["twitter"];
    }

    // Write one row per platform to social_media_posting_queue
    const queueRows = adapted.map((a) => ({
      content_id,
      platform: a.platform,
      oauth_account_id: oauthByPlatform[a.platform] || null,
      adapted_text: a.adapted_text,
      adapted_hashtags: a.hashtags,
      status: scheduled_time ? "scheduled" : "queued",
      scheduled_time: scheduled_time || new Date().toISOString(),
      retry_count: 0,
      max_retries: 3,
      metadata: {
        image_url: imageUrl,
        character_count: a.character_count,
        adapter_version: "1.0",
      },
    }));

    const { data: insertedRows, error: insertError } = await supabase
      .from("social_media_posting_queue")
      .insert(queueRows)
      .select("id, platform, status");

    if (insertError) {
      throw new Error(`Failed to insert queue rows: ${insertError.message}`);
    }

    console.log(`[platform-content-adapter] Queued ${insertedRows?.length} platform rows for content ${content_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        content_id,
        adapted,
        queued_rows: insertedRows,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[platform-content-adapter] Error:", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
