import React from 'react';
import { Phone, Users, Bot, Clock, Globe, Video, MessageCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const HowItWorks: React.FC = () => {
  const { t } = useTranslation();

  const steps = [
    {
      number: 1,
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    },
    {
      number: 2,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      number: 3,
      icon: Bot,
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      number: 4,
      icon: Phone,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    }
  ];

  const features = [
    {
      icon: Phone,
      color: "text-primary",
      key: "callback"
    },
    {
      icon: Globe,
      color: "text-blue-500",
      key: "bilingual"
    },
    {
      icon: Video,
      color: "text-purple-500",
      key: "video"
    },
    {
      icon: Clock,
      color: "text-green-500",
      key: "available247"
    },
    {
      icon: Bot,
      color: "text-orange-500",
      key: "memory"
    },
    {
      icon: MessageCircle,
      color: "text-pink-500",
      key: "chatAndCall"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-emergency bg-clip-text text-transparent">
            {t('howItWorks.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        {/* Emergency Flow Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => (
            <Card key={step.number} className={`relative overflow-hidden border-2 transition-all hover:shadow-lg ${step.bgColor}`}>
              <CardHeader>
                <div className={`w-16 h-16 rounded-full ${step.bgColor} flex items-center justify-center mb-4`}>
                  <step.icon className={`h-8 w-8 ${step.color}`} />
                </div>
                <div className="absolute top-4 right-4 text-6xl font-bold opacity-10">
                  {step.number}
                </div>
                <CardTitle className="text-xl">
                  {t(`howItWorks.steps.step${step.number}.title`)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {t(`howItWorks.steps.step${step.number}.description`)}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Features Grid */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-12">
            {t('howItWorks.keyFeatures')}
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
                    {t(`howItWorks.features.${feature.key}.title`)}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t(`howItWorks.features.${feature.key}.description`)}
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
                ⚠️ {t('howItWorks.disclaimer.title')}
              </h3>
              <p className="text-lg text-red-800 dark:text-red-200 mb-4">
                {t('howItWorks.disclaimer.message')}
              </p>
              <div className="bg-white dark:bg-gray-900 rounded p-4">
                <p className="font-bold mb-2">
                  {t('howItWorks.disclaimer.lifeThreatening')}
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li className="font-bold text-red-600 dark:text-red-400">
                    {t('howItWorks.disclaimer.step1')}
                  </li>
                  <li>
                    {t('howItWorks.disclaimer.step2')}
                  </li>
                  <li>
                    {t('howItWorks.disclaimer.step3')}
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-4">
            {t('howItWorks.readyToStart')}
          </h3>
          <p className="text-xl text-muted-foreground mb-8">
            {t('howItWorks.readySubtitle')}
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
              💬 {t('howItWorks.chatWithClara')}
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
              📞 {t('howItWorks.callNow')}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            🌍 {t('howItWorks.availabilityNotice')}
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
