import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ICE_SOS_KNOWLEDGE = `
You are Emma, the AI customer service agent for ICE SOS Lite, a revolutionary emergency response and family safety platform.

COMPANY OVERVIEW:
ICE SOS Lite provides comprehensive emergency response services and family protection solutions with 24/7 monitoring and AI-powered wellness checks.

PRICING PLANS:
1. Personal Contact (€1.99/month): Basic emergency contact notification system
2. Guardian Wellness (€4.99/month): AI wellness monitoring + emergency contacts  
3. Family Sharing (€0.99/month per person): Share protection across family members
4. Call Centre (€24.99/month): Professional emergency response team

KEY FEATURES:
- Instant emergency contact notifications
- GPS location sharing during emergencies
- AI-powered daily wellness checks
- Professional call center support (premium)
- Family member protection sharing
- Medical information storage
- Secure encrypted data

SALES APPROACH:
- Focus on peace of mind and family safety
- Use emotional scenarios (elderly relatives, traveling alone, medical emergencies)
- Address common objections about privacy and cost
- Always recommend starting with Personal Contact, then upsell based on needs
- Create urgency by highlighting emergency scenarios

PERSONALITY:
- Warm, caring, and professional
- Knowledgeable about emergency response
- Empathetic to family safety concerns
- Solution-oriented and helpful
- Never pushy, but confident in value proposition
`;

interface ChatRequest {
  message: string;
  sessionId?: string;
  userId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, userId }: ChatRequest = await req.json();

    if (!message) {
      throw new Error('Message is required');
    }

    // Generate session ID if not provided
    const currentSessionId = sessionId || crypto.randomUUID();

    // Get conversation history for context
    const { data: conversationHistory } = await supabase
      .from('conversations')
      .select('message_type, content, created_at')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Store user message
    await supabase
      .from('conversations')
      .insert({
        user_id: userId || null,
        session_id: currentSessionId,
        message_type: 'user',
        content: message
      });

    // Build conversation context
    const conversationContext = conversationHistory?.map(msg => ({
      role: msg.message_type === 'user' ? 'user' : 'assistant',
      content: msg.content
    })) || [];

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: ICE_SOS_KNOWLEDGE
      },
      ...conversationContext,
      {
        role: 'user',
        content: message
      }
    ];

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Store AI response
    await supabase
      .from('conversations')
      .insert({
        user_id: userId || null,
        session_id: currentSessionId,
        message_type: 'ai',
        content: aiResponse
      });

    // Analyze conversation for lead scoring
    const isShowingInterest = /\b(interested|price|cost|sign up|subscribe|family|emergency|elderly|relative|parent|protection|safety)\b/i.test(message);
    const isAskingQuestions = message.includes('?');
    
    if (isShowingInterest || isAskingQuestions) {
      // Update or create lead
      const { data: existingLead } = await supabase
        .from('leads')
        .select('*')
        .eq('session_id', currentSessionId)
        .single();

      if (existingLead) {
        // Update existing lead
        await supabase
          .from('leads')
          .update({
            interest_level: Math.min(existingLead.interest_level + 1, 10),
            updated_at: new Date().toISOString()
          })
          .eq('session_id', currentSessionId);
      } else {
        // Create new lead
        await supabase
          .from('leads')
          .insert({
            session_id: currentSessionId,
            user_id: userId || null,
            interest_level: isShowingInterest ? 3 : 1,
            metadata: { first_message: message }
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        response: aiResponse, 
        sessionId: currentSessionId 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});