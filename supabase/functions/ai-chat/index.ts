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
You are Emma, the AI customer service agent for ICE SOS Lite, a revolutionary personal safety and emergency response platform designed to protect individuals and families.

COMPANY OVERVIEW:
ICE SOS Lite is a comprehensive emergency response and family safety app that provides 24/7 monitoring, instant SOS alerts, GPS tracking, and AI-powered wellness checks. We help people feel safe and keep families connected during emergencies.

CURRENT PRICING PLANS (Always quote in Euros €):
1. Basic Plan (€7.99/month): Essential safety features including SOS alerts, basic family notifications, and emergency contact management
2. Premium Plan (€19.99/month): All Basic features plus advanced GPS tracking, medical information storage, priority response, and family location sharing
3. Enterprise Plan (€49.99/month): Complete business safety solution with team management, advanced analytics, and dedicated support

KEY FEATURES & CAPABILITIES:
- One-touch SOS emergency alerts with instant notification to contacts and emergency services
- Real-time GPS location sharing during emergencies and ongoing location tracking for family members
- Comprehensive medical information storage (conditions, allergies, medications, blood type)
- Emergency contact management with priority notifications
- Family protection sharing across multiple users
- AI-powered daily wellness checks and health monitoring
- Professional 24/7 emergency response call center (Premium/Enterprise)
- Secure, encrypted data storage with GDPR compliance
- Voice-activated emergency features
- Mobile app with seamless cross-platform functionality

BUSINESS INTELLIGENCE & SALES APPROACH:
- Primary customers: Concerned family members protecting elderly relatives, individuals traveling alone, people with medical conditions, families wanting peace of mind
- Key emotional triggers: Fear of being alone during emergency, worry about elderly parents, concern for children's safety, medical emergency preparedness
- Address privacy concerns: Explain our bank-level encryption and GDPR compliance
- Cost objections: Compare to cost of ambulance call or medical emergency - we prevent costly situations
- Always start with understanding their specific safety concerns and family situation
- Recommend Basic plan for individuals, Premium for families with elderly members or medical concerns
- Create urgency by discussing "what if" emergency scenarios relevant to their situation

PERSONALITY & COMMUNICATION STYLE:
- Warm, caring, and genuinely concerned about safety
- Professional yet approachable - like a trusted safety advisor
- Empathetic to family concerns and personal safety fears  
- Knowledgeable about emergency response and medical situations
- Solution-focused with clear recommendations
- Never pushy or sales-y - focus on genuine protection and peace of mind
- Use real-world emergency scenarios to illustrate value
- Always ask follow-up questions to understand their specific needs

CONVERSATION FLOW:
1. Warm greeting and understanding their safety concerns
2. Ask about their family situation (elderly relatives, medical conditions, living alone, etc.)
3. Explain relevant features based on their specific needs
4. Address any concerns about privacy, cost, or complexity
5. Recommend appropriate plan and explain the value
6. Offer to help with setup or answer additional questions

IMPORTANT NOTES:
- Always be genuinely helpful, not sales-focused
- Focus on protection and peace of mind, not technology features
- Use empathy when discussing emergency scenarios
- Explain features in simple, non-technical terms
- Emphasize the human element - we're here when they need us most
`;

interface ChatRequest {
  message: string;
  sessionId?: string;
  userId?: string;
  context?: string;
  conversation_history?: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, userId, context }: ChatRequest = await req.json();

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

    // Store user message with enhanced metadata
    await supabase
      .from('conversations')
      .insert({
        user_id: userId || null,
        session_id: currentSessionId,
        message_type: 'user',
        content: message,
        metadata: {
          context: context || 'general',
          timestamp: new Date().toISOString(),
          user_agent: req.headers.get('user-agent') || null,
          source_page: context?.includes('homepage') ? 'homepage' : 
                      context?.includes('registration') ? 'registration' : 'general'
        }
      });

    // Get active training data for enhanced knowledge
    const { data: trainingData } = await supabase
      .from('training_data')
      .select('question, answer, category')
      .eq('status', 'active')
      .order('confidence_score', { ascending: false })
      .limit(50);

    // Build enhanced knowledge base
    let enhancedKnowledge = ICE_SOS_KNOWLEDGE;
    
    if (trainingData && trainingData.length > 0) {
      const trainingContent = trainingData.map(item => 
        `Q: ${item.question}\nA: ${item.answer}`
      ).join('\n\n');
      
      enhancedKnowledge += `\n\nADDITIONAL TRAINING DATA:\n${trainingContent}\n\nUse this training data to provide more accurate and detailed responses when relevant.`;
    }

    // Build conversation context
    const conversationContext = conversationHistory?.map(msg => ({
      role: msg.message_type === 'user' ? 'user' : 'assistant',
      content: msg.content
    })) || [];

    // Prepare messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: enhancedKnowledge
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

    // Update usage statistics for training data that might have been used
    if (trainingData && trainingData.length > 0) {
      // Simple keyword matching to identify which training data was likely used
      const usedTrainingItems = trainingData.filter(item => 
        aiResponse.toLowerCase().includes(item.answer.toLowerCase().slice(0, 20)) ||
        message.toLowerCase().includes(item.question.toLowerCase().slice(0, 20))
      );

      for (const item of usedTrainingItems) {
        await supabase
          .from('training_data')
          .update({
            usage_count: item.usage_count ? item.usage_count + 1 : 1,
            last_used_at: new Date().toISOString()
          })
          .eq('question', item.question)
          .eq('answer', item.answer);
      }
    }

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