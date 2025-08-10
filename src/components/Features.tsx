import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Shield, Brain, Users, MapPin, MessageCircle } from "lucide-react";
import { useTranslation } from 'react-i18next';

const Features = () => {
  const { t } = useTranslation();
  const features = [
    {
      icon: Phone,
      title: t('features.items.0.title'),
      description: t('features.items.0.description'),
      color: "emergency"
    },
    {
      icon: Brain,
      title: t('features.items.1.title'),
      description: t('features.items.1.description'),
      color: "guardian"
    },
    {
      icon: Shield,
      title: t('features.items.2.title'),
      description: t('features.items.2.description'),
      color: "primary"
    },
    {
      icon: Users,
      title: t('features.items.3.title'),
      description: t('features.items.3.description'),
      color: "wellness"
    },
    {
      icon: MapPin,
      title: t('features.items.4.title'),
      description: t('features.items.4.description'),
      color: "primary"
    },
    {
      icon: MessageCircle,
      title: t('features.items.5.title'),
      description: t('features.items.5.description'),
      color: "guardian"
    }
  ];

  const getIconColor = (color: string) => {
    switch (color) {
      case 'emergency': return 'text-emergency';
      case 'guardian': return 'text-guardian';
      case 'wellness': return 'text-wellness';
      default: return 'text-primary';
    }
  };

  const getCardBorder = (color: string) => {
    switch (color) {
      case 'emergency': return 'border-emergency/20 hover:border-emergency/40';
      case 'guardian': return 'border-guardian/20 hover:border-guardian/40';
      case 'wellness': return 'border-wellness/20 hover:border-wellness/40';
      default: return 'border-primary/20 hover:border-primary/40';
    }
  };

  return (
    <section id="features" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
            {t('features.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('features.description')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className={`border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${getCardBorder(feature.color)}`}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 ${getIconColor(feature.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;