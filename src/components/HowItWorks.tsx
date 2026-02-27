import React from 'react';
import { Phone, Users, Bot, Clock, Globe, Video, MessageCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const HowItWorks: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isSpanish = i18n.language === 'es';

  const steps = [
    {
      number: 1,
      icon: AlertCircle,
      titleEn: "Press Your Emergency Button",
      titleEs: "Presiona Tu Botón de Emergencia",
      descEn: "Activate ICE SOS with one tap from your phone, or use a Flic button for instant access.",
      descEs: "Activa ICE SOS con un toque desde tu teléfono, o usa un botón Flic para acceso instantáneo.",
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    {
      number: 2,
      icon: Users,
      titleEn: "All Contacts Ring Simultaneously",
      titleEs: "Todos los Contactos Suenan Simultáneamente",
      descEn: "Your emergency contacts all receive calls at once, not one-by-one. Get help 15x faster than traditional systems.",
      descEs: "Tus contactos de emergencia reciben llamadas al mismo tiempo, no uno por uno. Obtén ayuda 15 veces más rápido.",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      number: 3,
      icon: Bot,
      titleEn: "Clara AI Joins to Coordinate",
      titleEs: "Clara AI Se Une para Coordinar",
      descEn: "Our AI coordinator Clara joins the call, greets everyone, captures ETAs, and keeps responders updated in real-time.",
      descEs: "Nuestra coordinadora AI Clara se une a la llamada, saluda a todos, captura ETAs y mantiene actualizados a los respondedores.",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      number: 4,
      icon: Phone,
      titleEn: "Help Arrives Faster",
      titleEs: "La Ayuda Llega Más Rápido",
      descEn: "Your location is shared automatically. Everyone knows who's coming, when they'll arrive, and what's needed.",
      descEs: "Tu ubicación se comparte automáticamente. Todos saben quién viene, cuándo llegarán y qué se necesita.",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    }
  ];

  const features = [
    {
      icon: Phone,
      titleEn: "60-Second Callback",
      titleEs: "Llamada en 60 Segundos",
      descEn: "Click the phone icon in chat to talk to our team in under 60 seconds. No waiting, no forms.",
      descEs: "Haz clic en el ícono de teléfono en el chat para hablar con nuestro equipo en menos de 60 segundos.",
      color: "text-primary"
    },
    {
      icon: Globe,
      titleEn: "English & Spanish Support",
      titleEs: "Soporte en Inglés y Español",
      descEn: "Switch languages instantly. Clara and our team speak both English and Spanish fluently.",
      descEs: "Cambia de idioma al instante. Clara y nuestro equipo hablan inglés y español con fluidez.",
      color: "text-blue-500"
    },
    {
      icon: Video,
      titleEn: "Video Calls Available",
      titleEs: "Videollamadas Disponibles",
      descEn: "Need to show something? Request a video call for face-to-face assistance.",
      descEs: "¿Necesitas mostrar algo? Solicita una videollamada para asistencia cara a cara.",
      color: "text-purple-500"
    },
    {
      icon: Clock,
      titleEn: "24/7 Availability",
      titleEs: "Disponibilidad 24/7",
      descEn: "Clara never sleeps. Get help anytime, day or night, 365 days a year.",
      descEs: "Clara nunca duerme. Obtén ayuda en cualquier momento, día o noche, 365 días al año.",
      color: "text-green-500"
    },
    {
      icon: Bot,
      titleEn: "Perfect Memory",
      titleEs: "Memoria Perfecta",
      descEn: "Clara remembers every interaction. She knows your history and provides personalized assistance.",
      descEs: "Clara recuerda cada interacción. Conoce tu historial y proporciona asistencia personalizada.",
      color: "text-orange-500"
    },
    {
      icon: MessageCircle,
      titleEn: "Chat & Call Anytime",
      titleEs: "Chat y Llamadas en Cualquier Momento",
      descEn: "Prefer text? Chat with Clara. Need to talk? Click to call. You choose how to connect.",
      descEs: "¿Prefieres texto? Chatea con Clara. ¿Necesitas hablar? Haz clic para llamar. Tú eliges cómo conectar.",
      color: "text-pink-500"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-emergency bg-clip-text text-transparent">
            {isSpanish ? '¿Cómo Funciona ICE SOS?' : 'How ICE SOS Works'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {isSpanish
              ? 'Coordinación de emergencias reimaginada con IA. Simple, rápido y siempre disponible.'
              : 'Emergency coordination reimagined with AI. Simple, fast, and always available.'}
          </p>
        </div>

        {/* Emergency Flow Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step) => (
            <Card key={step.number} className={`relative overflow-hidden border-2 transition-all hover:shadow-lg ${step.bgColor}`}>
              <CardHeader>
                <div className={`w-16 h-16 rounded-full ${step.bgColor} flex items-center justify-center mb-4`}>
                  <step.icon className={`h-8 w-8 ${step.color}`} />
                </div>
                <div className="absolute top-4 right-4 text-6xl font-bold opacity-10">
                  {step.number}
                </div>
                <CardTitle className="text-xl">
                  {isSpanish ? step.titleEs : step.titleEn}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {isSpanish ? step.descEs : step.descEn}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Features Grid */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-12">
            {isSpanish ? 'Características Clave' : 'Key Features'}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center`}>
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <div>
                  <h4 className="font-semibold mb-2">
                    {isSpanish ? feature.titleEs : feature.titleEn}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {isSpanish ? feature.descEs : feature.descEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-8 mb-12">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-8 w-8 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-3">
                {isSpanish ? '⚠️ Aviso Importante' : '⚠️ Important Notice'}
              </h3>
              <p className="text-lg text-red-800 dark:text-red-200 mb-4">
                {isSpanish
                  ? 'ICE SOS es una herramienta de coordinación de emergencias. NO es un reemplazo para el 911 (EE.UU.) o el 112 (UE).'
                  : 'ICE SOS is an emergency coordination tool. It is NOT a replacement for 911 (US) or 112 (EU).'}
              </p>
              <div className="bg-white dark:bg-gray-900 rounded p-4">
                <p className="font-bold mb-2">
                  {isSpanish ? 'En una emergencia que ponga en riesgo la vida:' : 'In a life-threatening emergency:'}
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li className="font-bold text-red-600 dark:text-red-400">
                    {isSpanish
                      ? 'LLAMA AL 911 (EE.UU.) o 112 (UE) PRIMERO'
                      : 'CALL 911 (US) or 112 (EU) FIRST'}
                  </li>
                  <li>
                    {isSpanish
                      ? 'Luego usa ICE SOS para notificar a tus contactos'
                      : 'Then use ICE SOS to notify your contacts'}
                  </li>
                  <li>
                    {isSpanish
                      ? 'No demores en llamar a los servicios de emergencia oficiales'
                      : 'Do not delay calling official emergency services'}
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-4">
            {isSpanish ? '¿Listo para Comenzar?' : 'Ready to Get Started?'}
          </h3>
          <p className="text-xl text-muted-foreground mb-8">
            {isSpanish
              ? 'Habla con Clara ahora mismo. Chat, llama o solicita videollamada en segundos.'
              : 'Talk to Clara right now. Chat, call, or request a video call in seconds.'}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-emergency hover:opacity-90"
              onClick={() => {
                const claraWidget = document.querySelector('[data-clara-trigger]');
                if (claraWidget) (claraWidget as HTMLElement).click();
              }}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              {isSpanish ? '💬 Chatear con Clara' : '💬 Chat with Clara'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                const claraWidget = document.querySelector('[data-clara-trigger]');
                if (claraWidget) {
                  (claraWidget as HTMLElement).click();
                  setTimeout(() => {
                    // Trigger callback request
                  }, 500);
                }
              }}
            >
              <Phone className="mr-2 h-5 w-5" />
              {isSpanish ? '📞 Llamar Ahora (60 seg)' : '📞 Call Now (60 sec)'}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            {isSpanish
              ? '🌍 Disponible en Inglés y Español • 24/7 • Gratis para comenzar'
              : '🌍 Available in English & Spanish • 24/7 • Free to start'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
