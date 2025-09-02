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
import { BetaLaunchBanner } from '@/components/BetaLaunchBanner';

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
    <section className="py-section bg-gradient-to-b from-warning/5 to-warning/10 dark:from-warning/10 dark:to-warning/5">
      <div className="container mx-auto px-4">
        {/* Beta Launch Banner */}
        <BetaLaunchBanner />
        
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
        <Card className="relative border-2 border-warning/20 bg-white dark:bg-slate-800 shadow-xl overflow-hidden max-w-4xl mx-auto">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-warning to-warning/60"></div>
          
          <CardContent className="p-6 md:p-8">
            {/* Split Layout */}
            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* Left Side - Main Info */}
              <div className="text-center md:text-left">
                <div className="w-14 h-14 bg-gradient-to-br from-warning to-warning/80 shadow-lg rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-4">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">
                  {t('familyCarerAccess.cardTitle')}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-warning">{formattedPrice}</span>
                  <span className="text-muted-foreground text-sm">{billingInterval} {t('familyCarerAccess.cardSubtitle')}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-4">
                  {t('familyCarerAccess.cardDescription')}
                </p>
                
                {/* CTA Buttons */}
                <div className="flex flex-col gap-3">
                  <Button asChild size="lg" className="bg-warning hover:bg-warning/90 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl border-2 border-warning/30">
                    <Link to="/family-carer-access">
                      <Users className="mr-2 h-4 w-4" />
                      {t('familyCarerAccess.learnMore')}
                    </Link>
                  </Button>
                  
                  <IntroVideoModal 
                    defaultVideoId="family"
                    trigger={
                      <Button 
                        variant="outline"
                        size="lg"
                        className="border-warning text-warning hover:bg-warning hover:text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {t('familyCarerAccess.watchVideo')}
                      </Button>
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('familyCarerAccess.secureNote')}
                </p>
              </div>

              {/* Right Side - Features Grid */}
              <div className="grid grid-cols-1 gap-4">
                {features.slice(0, 3).map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-warning/5 border border-warning/10">
                      <div className={`w-10 h-10 bg-gradient-to-br from-warning to-warning/80 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
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