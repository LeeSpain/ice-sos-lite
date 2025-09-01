import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Heart, Shield, MapPin, Eye, Headphones } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";

const Features = () => {
  const { t } = useTranslation();
  const features = [
    {
      icon: Users,
      title: t('familyConnections.features.0.title'),
      description: t('familyConnections.features.0.description'),
      color: "wellness"
    },
    {
      icon: Heart,
      title: t('familyConnections.features.1.title'),
      description: t('familyConnections.features.1.description'),
      color: "emergency"
    },
    {
      icon: MapPin,
      title: t('familyConnections.features.2.title'),
      description: t('familyConnections.features.2.description'),
      color: "primary"
    },
    {
      icon: Shield,
      title: t('familyConnections.features.3.title'),
      description: t('familyConnections.features.3.description'),
      color: "guardian"
    },
    {
      icon: Eye,
      title: t('familyConnections.features.4.title'),
      description: t('familyConnections.features.4.description'),
      color: "primary"
    },
    {
      icon: Headphones,
      title: t('familyConnections.features.5.title'),
      description: t('familyConnections.features.5.description'),
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
      case 'emergency': return 'border-emergency/20 hover:border-emergency/40 hover:shadow-emergency/10';
      case 'guardian': return 'border-guardian/20 hover:border-guardian/40 hover:shadow-guardian/10';
      case 'wellness': return 'border-wellness/20 hover:border-wellness/40 hover:shadow-wellness/10';
      default: return 'border-primary/20 hover:border-primary/40 hover:shadow-primary/10';
    }
  };

  const getCardGradient = (color: string) => {
    switch (color) {
      case 'emergency': return 'bg-gradient-to-br from-background to-emergency/5';
      case 'guardian': return 'bg-gradient-to-br from-background to-guardian/5';
      case 'wellness': return 'bg-gradient-to-br from-background to-wellness/5';
      default: return 'bg-gradient-to-br from-background to-primary/5';
    }
  };

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-wellness/10 border border-wellness/20 text-wellness font-medium text-sm mb-6">
            <Heart className="h-4 w-4 mr-2" />
            {t('familyConnections.badge')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-wellness bg-clip-text text-transparent mb-6">
            {t('familyConnections.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            {t('familyConnections.description')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className={`group relative overflow-hidden border-2 transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 ${getCardBorder(feature.color)} ${getCardGradient(feature.color)}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardHeader className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${getIconColor(feature.color)}`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl font-bold leading-tight group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <CardDescription className="text-base leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-wellness/10 to-primary/10 rounded-3xl p-12 border border-wellness/20">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              {t('familyConnections.cta.title')}
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('familyConnections.cta.description')}
            </p>
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-wellness to-primary hover:from-wellness/90 hover:to-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-6"
            >
              <Link to="/family-carer-access">
                <Users className="h-5 w-5 mr-2" />
                {t('familyConnections.cta.button')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;