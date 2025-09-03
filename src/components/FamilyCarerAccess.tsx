import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Heart, Shield, Clock, UserCheck, CheckCircle, Play } from 'lucide-react';
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { IntroVideoModal } from '@/components/IntroVideoModal';
import { usePreferences } from '@/contexts/PreferencesContext';
import { convertCurrency, formatDisplayCurrency, languageToLocale } from '@/utils/currency';

const FamilyCarerAccess = () => {
  const { t } = useTranslation();
  const { currency, language } = usePreferences();
  
  // Family pricing from subscription plans
  const basePriceEUR = 2.99;
  const convertedPrice = convertCurrency(basePriceEUR, 'EUR', currency);
  const formattedPrice = formatDisplayCurrency(convertedPrice, currency, languageToLocale(language));
  const billingInterval = t('common.perMonth');

  const features = [
    {
      icon: UserCheck,
      title: t('familyCarerAccess.features.trustedContacts.title'),
      description: t('familyCarerAccess.features.trustedContacts.description'),
      color: "primary"
    },
    {
      icon: Heart,
      title: t('familyCarerAccess.features.careCoordination.title'),
      description: t('familyCarerAccess.features.careCoordination.description'),
      color: "wellness"
    },
    {
      icon: Shield,
      title: t('familyCarerAccess.features.privacyControls.title'),
      description: t('familyCarerAccess.features.privacyControls.description'),
      color: "guardian"
    },
    {
      icon: Clock,
      title: t('familyCarerAccess.features.realTimeUpdates.title'),
      description: t('familyCarerAccess.features.realTimeUpdates.description'),
      color: "emergency"
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
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-warning/10 rounded-full px-4 py-2 mb-4 border border-warning/20">
            <div className="w-2 h-2 bg-warning rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium text-warning">{t('familyCarerAccess.sectionBadge')}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
            {t('familyCarerAccess.title')}
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {t('familyCarerAccess.subtitle')}
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="relative bg-card border border-border rounded-3xl shadow-lg overflow-hidden max-w-4xl mx-auto">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-3 gap-0">
              {/* Left Side - Main Content (2/3 width) */}
              <div className="md:col-span-2 p-6 md:p-8 relative">
                {/* Icon and Title */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-warning rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    {t('familyCarerAccess.cardTitle')}
                  </h3>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-2xl font-bold text-warning">{formattedPrice}</span>
                  <span className="text-muted-foreground text-sm ml-1">{billingInterval}</span>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-sm mb-6">
                  {t('familyCarerAccess.cardDescription')}
                </p>

                {/* Feature List */}
                <div className="space-y-3 mb-6">
                  {features.slice(0, 4).map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground font-medium">{feature.title}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button asChild className="bg-warning hover:bg-warning/90 text-white">
                    <Link to="/family-carer-access">
                      {t('familyCarerAccess.learnMore')}
                    </Link>
                  </Button>
                  
                  <IntroVideoModal 
                    defaultVideoId="family"
                    trigger={
                      <Button 
                        variant="outline"
                        className="border-warning text-warning hover:bg-warning hover:text-white"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {t('familyCarerAccess.watchVideo')}
                      </Button>
                    }
                  />
                </div>
              </div>

              {/* Right Side - Image (1/3 width) */}
              <div className="md:col-span-1 relative bg-gradient-to-br from-warning/10 to-warning/20 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/a90a1824-7b89-4eec-9e3e-da2f4bc97119.png"
                  alt="Family & Carer Support"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
            <Heart className="h-4 w-4 text-warning" />
            <span className="text-sm text-muted-foreground">
              {t('familyCarerAccess.footerText')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FamilyCarerAccess;