import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Lead {
  email: string | null;
  phone: string | null;
  name: string | null;
  company: string | null;
  role: string | null;
  location: string | null;
  lead_score_0_100: number;
  interest_level_0_10: number;
  recommended_plan: string | null;
  notes: string;
  tags: string[];
}

interface AnalyzeResult {
  leads: Lead[];
  summary: string;
  model: string;
}

const OPENAI_SYSTEM_PROMPT = `You are a lead extraction assistant for ICE SOS Lite, an emergency SOS + monitoring solution for:
- Families with elderly relatives
- Seniors living alone
- Organisations: care providers, assisted living facilities, senior services

Target lead profiles (score higher):
- Care homes and assisted living facilities
- Senior services and support organisations
- Expat retirement communities
- Safety products resellers
- Local councils and NGOs focused on elderly care
- Emergency response service providers

Your task:
1. Extract ONLY publicly visible contact information from the provided text
2. If no email/phone is found, still return leads with company/name/role when available
3. Score leads 0-100 based on fit for ICE SOS Lite (higher = better fit)
4. Assign interest level 0-10 based on apparent need for emergency/monitoring solutions
5. Suggest recommended plan: "individual", "family", "organization", or null

CRITICAL: Return ONLY valid JSON, no markdown, no explanation. Schema:
{
  "leads": [
    {
      "email": "string or null",
      "phone": "string or null", 
      "name": "string or null",
      "company": "string or null",
      "role": "string or null",
      "location": "string or null",
      "lead_score_0_100": number,
      "interest_level_0_10": number,
      "recommended_plan": "individual" | "family" | "organization" | null,
      "notes": "string - brief context about why this is a lead",
      "tags": ["array", "of", "relevant", "tags"]
    }
  ],
  "summary": "Brief summary of what was analyzed and key findings"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check OpenAI key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Init Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // Parse request
    const body = await req.json();
    const { action } = body;

    console.log(`[lead-intelligence] User ${userId} action: ${action}`);

    // Rate limiting: max 20 analyses per day
    if (action === 'analyze_url' || action === 'analyze_text') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count, error: countError } = await supabase
        .from('lead_intelligence_runs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', today.toISOString());

      if (countError) {
        console.error('Rate limit check error:', countError);
      } else if ((count || 0) >= 20) {
        return new Response(JSON.stringify({ 
          error: 'Daily limit reached. Maximum 20 analyses per day.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Handle actions
    if (action === 'analyze_url') {
      return await handleAnalyzeUrl(body.url, openAIApiKey, corsHeaders);
    } else if (action === 'analyze_text') {
      return await handleAnalyzeText(body.text, body.source, openAIApiKey, corsHeaders);
    } else if (action === 'save_leads') {
      return await handleSaveLeads(body, supabase, userId, corsHeaders);
    } else {
      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('[lead-intelligence] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleAnalyzeUrl(url: string, openAIApiKey: string, corsHeaders: Record<string, string>) {
  if (!url) {
    return new Response(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Validate URL scheme
  try {
    const parsedUrl = new URL(url);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return new Response(JSON.stringify({ error: 'Only HTTP/HTTPS URLs are supported' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid URL format' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log(`[lead-intelligence] Fetching URL: ${url}`);

  // Fetch URL with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ICE-SOS-LeadBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,text/plain',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch URL: ${response.status}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/') && !contentType.includes('html') && !contentType.includes('json')) {
      return new Response(JSON.stringify({ 
        error: 'URL returned non-text content (e.g., image, PDF). Only text/HTML pages are supported.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let text = await response.text();
    
    // Strip HTML tags
    text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    text = text.replace(/<[^>]+>/g, ' ');
    text = text.replace(/\s+/g, ' ').trim();

    // Truncate
    if (text.length > 50000) {
      text = text.substring(0, 50000);
    }

    if (text.length < 50) {
      return new Response(JSON.stringify({ error: 'Page content too short to analyze' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return await analyzeWithAI(text, `URL: ${url}`, openAIApiKey, corsHeaders);

  } catch (fetchError) {
    clearTimeout(timeoutId);
    const errMsg = fetchError instanceof Error ? fetchError.message : 'Unknown fetch error';
    if (errMsg.includes('abort')) {
      return new Response(JSON.stringify({ error: 'URL fetch timed out (15s limit)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: `Failed to fetch URL: ${errMsg}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleAnalyzeText(text: string, source: string | undefined, openAIApiKey: string, corsHeaders: Record<string, string>) {
  if (!text || text.trim().length < 20) {
    return new Response(JSON.stringify({ error: 'Text must be at least 20 characters' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let truncatedText = text.trim();
  if (truncatedText.length > 50000) {
    truncatedText = truncatedText.substring(0, 50000);
  }

  const sourceLabel = source || 'Manual text input';
  return await analyzeWithAI(truncatedText, sourceLabel, openAIApiKey, corsHeaders);
}

async function analyzeWithAI(text: string, sourceLabel: string, openAIApiKey: string, corsHeaders: Record<string, string>): Promise<Response> {
  console.log(`[lead-intelligence] Analyzing ${text.length} chars from: ${sourceLabel}`);

  const userPrompt = `Analyze the following content and extract any potential leads for ICE SOS Lite emergency monitoring service.

Source: ${sourceLabel}

Content:
${text}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: OPENAI_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[lead-intelligence] OpenAI error:', errText);
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const model = data.model || 'gpt-4o-mini';

    if (!content) {
      return new Response(JSON.stringify({ error: 'No response from AI' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse JSON - handle potential markdown wrapping
    let parsed: AnalyzeResult;
    try {
      let jsonStr = content.trim();
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      parsed = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('[lead-intelligence] JSON parse error:', content);
      return new Response(JSON.stringify({ 
        error: 'Failed to parse AI response. Please try again.',
        raw: content 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate structure
    if (!Array.isArray(parsed.leads)) {
      parsed.leads = [];
    }

    console.log(`[lead-intelligence] Extracted ${parsed.leads.length} leads`);

    return new Response(JSON.stringify({
      leads: parsed.leads,
      summary: parsed.summary || 'Analysis complete',
      model: model,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (aiError) {
    console.error('[lead-intelligence] AI error:', aiError);
    return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleSaveLeads(
  body: { 
    leads: Lead[]; 
    source_type: 'url' | 'text'; 
    source_value: string;
    summary?: string;
    model?: string;
  },
  supabase: ReturnType<typeof createClient>,
  userId: string,
  corsHeaders: Record<string, string>
) {
  const { leads, source_type, source_value, summary, model } = body;

  if (!leads || !Array.isArray(leads) || leads.length === 0) {
    return new Response(JSON.stringify({ error: 'No leads to save' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  console.log(`[lead-intelligence] Saving ${leads.length} leads for user ${userId}`);

  let savedCount = 0;
  let duplicateCount = 0;

  for (const lead of leads) {
    // Check for duplicates by email or phone
    let isDuplicate = false;

    if (lead.email) {
      const { data: existing } = await supabase
        .from('leads')
        .select('id')
        .eq('email', lead.email)
        .limit(1);
      
      if (existing && existing.length > 0) {
        isDuplicate = true;
      }
    }

    if (!isDuplicate && lead.phone) {
      const { data: existing } = await supabase
        .from('leads')
        .select('id')
        .eq('phone', lead.phone)
        .limit(1);
      
      if (existing && existing.length > 0) {
        isDuplicate = true;
      }
    }

    if (isDuplicate) {
      duplicateCount++;
      continue;
    }

    // Insert lead
    const { error: insertError } = await supabase.from('leads').insert({
      session_id: crypto.randomUUID(),
      user_id: userId,
      email: lead.email || null,
      phone: lead.phone || null,
      interest_level: Math.min(10, Math.max(0, lead.interest_level_0_10 || 5)),
      recommended_plan: lead.recommended_plan || null,
      conversation_summary: lead.notes || summary || null,
      status: 'new',
      metadata: {
        name: lead.name,
        company: lead.company,
        role: lead.role,
        location: lead.location,
        lead_score: lead.lead_score_0_100,
        tags: lead.tags || [],
        source_type: source_type,
        source_value: source_value,
        extracted_at: new Date().toISOString(),
      },
    });

    if (insertError) {
      console.error('[lead-intelligence] Insert error:', insertError);
    } else {
      savedCount++;
    }
  }

  // Create audit run
  const { data: runData, error: runError } = await supabase
    .from('lead_intelligence_runs')
    .insert({
      user_id: userId,
      source_type: source_type,
      source_value: source_value.substring(0, 2000), // Truncate long URLs/text
      extracted_count: leads.length,
      saved_count: savedCount,
      model: model || null,
      summary: summary?.substring(0, 1000) || null,
    })
    .select('id')
    .single();

  if (runError) {
    console.error('[lead-intelligence] Audit log error:', runError);
  }

  console.log(`[lead-intelligence] Saved ${savedCount}, duplicates ${duplicateCount}`);

  return new Response(JSON.stringify({
    saved: savedCount,
    duplicates: duplicateCount,
    run_id: runData?.id || null,
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
