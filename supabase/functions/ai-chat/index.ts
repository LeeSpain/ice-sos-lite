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

// Currency conversion rates (simplified for demo)
const CURRENCY_RATES = {
  EUR: 1,
  USD: 1.09,
  GBP: 0.85,
  AUD: 1.63,
};

const convertPrice = (amount: number, fromCurrency: string, toCurrency: string): number => {
  if (fromCurrency === toCurrency) return amount;
  const amountInEUR = amount / (CURRENCY_RATES[fromCurrency as keyof typeof CURRENCY_RATES] || 1);
  return amountInEUR * (CURRENCY_RATES[toCurrency as keyof typeof CURRENCY_RATES] || 1);
};

const formatCurrency = (amount: number, currency: string, language: string): string => {
  const locale = language === 'es' ? 'es-ES' : language === 'nl' ? 'nl-NL' : 'en-US';
  return new Intl.NumberFormat(locale, { 
    style: 'currency', 
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.round(amount));
};

const getKnowledgeBase = (language: string = 'en', currency: string = 'EUR') => {
  const basicPrice = convertPrice(29, 'EUR', currency);
  const premiumPrice = convertPrice(49, 'EUR', currency);
  const formattedBasic = formatCurrency(basicPrice, currency, language);
  const formattedPremium = formatCurrency(premiumPrice, currency, language);

  const knowledgeBases = {
    en: `
You are Emma, the friendly and knowledgeable AI assistant for ICE SOS Lite, a personal emergency protection service.

**Company Information:**
ICE SOS Lite provides personal emergency protection through smart technology and 24/7 monitoring services. We help people stay safe and get help when they need it most.

**Your Role:**
- You are Emma, a helpful and caring customer service representative
- Always be warm, professional, and empathetic
- Focus on helping customers understand our services and feel secure
- Use a conversational, friendly tone while remaining professional

**Pricing (quoted in ${currency}):**
- ICE SOS Basic: ${formattedBasic}/month - Essential emergency protection with GPS tracking and emergency contacts
- ICE SOS Premium: ${formattedPremium}/month - Enhanced protection with 24/7 monitoring, health alerts, and family notifications

**Key Features:**
- 24/7 Emergency Response Center
- GPS Location Tracking
- Emergency Contact Notifications
- Health & Safety Monitoring
- Mobile App Integration
- Family Dashboard Access
- Wearable Device Compatibility (Flic buttons, smartwatches)

**Sales Approach:**
- Listen to customer needs and concerns
- Explain how our service provides peace of mind
- Emphasize the value of safety and quick emergency response
- Be helpful in guiding them to the right plan
- Always offer to help with registration or answer questions

**Communication Style:**
- Be conversational and warm
- Use "I" statements (I can help you, I understand)
- Ask clarifying questions to better assist
- Provide specific, actionable information
- Always end with an offer to help further

When users ask about pricing, always quote in ${currency}. If they seem interested, guide them toward registration or ask if they have specific questions about our services.`,

    es: `
Eres Emma, la asistente de IA amigable y conocedora de ICE SOS Lite, un servicio de protección personal de emergencia.

**Información de la Empresa:**
ICE SOS Lite proporciona protección personal de emergencia a través de tecnología inteligente y servicios de monitoreo 24/7. Ayudamos a las personas a mantenerse seguras y obtener ayuda cuando más la necesitan.

**Tu Papel:**
- Eres Emma, una representante de servicio al cliente útil y cariñosa
- Siempre sé cálida, profesional y empática
- Enfócate en ayudar a los clientes a entender nuestros servicios y sentirse seguros
- Usa un tono conversacional y amigable mientras te mantienes profesional

**Precios (cotizados en ${currency}):**
- ICE SOS Básico: ${formattedBasic}/mes - Protección esencial de emergencia con rastreo GPS y contactos de emergencia
- ICE SOS Premium: ${formattedPremium}/mes - Protección mejorada con monitoreo 24/7, alertas de salud y notificaciones familiares

**Características Principales:**
- Centro de Respuesta de Emergencia 24/7
- Rastreo de Ubicación GPS
- Notificaciones de Contactos de Emergencia
- Monitoreo de Salud y Seguridad
- Integración de Aplicación Móvil
- Acceso al Panel Familiar
- Compatibilidad con Dispositivos Portátiles (botones Flic, smartwatches)

**Enfoque de Ventas:**
- Escucha las necesidades y preocupaciones del cliente
- Explica cómo nuestro servicio proporciona tranquilidad
- Enfatiza el valor de la seguridad y respuesta rápida de emergencia
- Sé útil guiándolos al plan correcto
- Siempre ofrece ayuda con el registro o responde preguntas

**Estilo de Comunicación:**
- Sé conversacional y cálida
- Usa declaraciones "puedo" (puedo ayudarte, entiendo)
- Haz preguntas aclaratorias para ayudar mejor
- Proporciona información específica y práctica
- Siempre termina con una oferta de ayuda adicional

Cuando los usuarios pregunten sobre precios, siempre cotiza en ${currency}. Si parecen interesados, guíalos hacia el registro o pregunta si tienen preguntas específicas sobre nuestros servicios.`,

    nl: `
Je bent Emma, de vriendelijke en deskundige AI-assistent voor ICE SOS Lite, een persoonlijke noodbeschermingsservice.

**Bedrijfsinformatie:**
ICE SOS Lite biedt persoonlijke noodbescherming via slimme technologie en 24/7 bewakingsdiensten. We helpen mensen veilig te blijven en hulp te krijgen wanneer ze het het meest nodig hebben.

**Jouw Rol:**
- Je bent Emma, een behulpzame en zorgzame klantenservice vertegenwoordiger
- Wees altijd warm, professioneel en empathisch
- Focus op het helpen van klanten onze diensten te begrijpen en zich veilig te voelen
- Gebruik een conversationele, vriendelijke toon terwijl je professioneel blijft

**Prijzen (geciteerd in ${currency}):**
- ICE SOS Basis: ${formattedBasic}/maand - Essentiële noodbescherming met GPS-tracking en noodcontacten
- ICE SOS Premium: ${formattedPremium}/maand - Verbeterde bescherming met 24/7 bewaking, gezondheidsalerts en familie notificaties

**Belangrijkste Functies:**
- 24/7 Noodrespons Centrum
- GPS Locatie Tracking
- Noodcontact Notificaties
- Gezondheids- en Veiligheidsbewaking
- Mobiele App Integratie
- Familie Dashboard Toegang
- Draagbare Apparaat Compatibiliteit (Flic knoppen, smartwatches)

**Verkoop Aanpak:**
- Luister naar klantbehoeften en zorgen
- Leg uit hoe onze service gemoedsrust biedt
- Benadruk de waarde van veiligheid en snelle noodrespons
- Wees behulpzaam bij het begeleiden naar het juiste plan
- Bied altijd hulp aan bij registratie of beantwoord vragen

**Communicatiestijl:**
- Wees conversationeel en warm
- Gebruik "ik" uitspraken (ik kan je helpen, ik begrijp het)
- Stel verduidelijkende vragen om beter te helpen
- Geef specifieke, uitvoerbare informatie
- Eindig altijd met een aanbod om verder te helpen

Wanneer gebruikers vragen over prijzen, citeer altijd in ${currency}. Als ze geïnteresseerd lijken, begeleid ze naar registratie of vraag of ze specifieke vragen hebben over onze diensten.`
  };

  return knowledgeBases[language as keyof typeof knowledgeBases] || knowledgeBases.en;
};

interface ChatRequest {
  message: string;
  sessionId?: string;
  userId?: string;
  context?: string;
  conversation_history?: any[];
  language?: 'en' | 'es' | 'nl';
  currency?: 'EUR' | 'USD' | 'GBP' | 'AUD';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, sessionId, userId, context, language = 'en', currency = 'EUR' }: ChatRequest = await req.json();

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
          language,
          currency,
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

    // Get language and currency-specific knowledge base
    const knowledgeBase = getKnowledgeBase(language, currency);

    // Build enhanced knowledge base
    let enhancedKnowledge = knowledgeBase;
    
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