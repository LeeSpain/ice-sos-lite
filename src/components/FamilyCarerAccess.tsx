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
    <section className="py-section">
      <div className="container mx-auto px-4">
        {/* Header - matching other sections */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
            {t('familyCarerAccess.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('familyCarerAccess.subtitle')}
          </p>
        </div>

        {/* Main Content - matching other sections layout */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative">
                <img 
                  src="/lovable-uploads/7b271d34-59d8-4874-9441-77c857b01fac.png" 
                  alt="Family carer emergency coordination - woman and elderly man using emergency alert system"
                  className="w-full h-full object-cover rounded-3xl shadow-2xl"
                />
              </div>

              {/* Floating Feature Highlights */}
              <div className="absolute -left-8 top-20 bg-white rounded-xl p-3 shadow-xl border border-warning/20 max-w-44">
                <div className="flex items-center mb-1">
                  <Users className="h-4 w-4 text-warning mr-2" />
                  <span className="font-semibold text-xs">Family Network</span>
                </div>
                <p className="text-xs text-gray-600">Instant family coordination</p>
              </div>

              <div className="absolute -right-8 bottom-32 bg-white rounded-xl p-3 shadow-xl border border-warning/20 max-w-44">
                <div className="flex items-center mb-1">
                  <Shield className="h-4 w-4 text-warning mr-2" />
                  <span className="font-semibold text-xs">Privacy Protected</span>
                </div>
                <p className="text-xs text-gray-600">GDPR compliant security</p>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <div className="mb-8">
                <div className="inline-flex items-center bg-warning/10 rounded-full px-4 py-2 mb-4 border border-warning/20">
                  <div className="w-2 h-2 bg-warning rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-warning">{t('familyCarerAccess.sectionBadge')}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                  {t('familyCarerAccess.cardTitle')}
                </h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-warning">{formattedPrice}</span>
                  <span className="text-muted-foreground text-sm ml-2">{billingInterval} {t('familyCarerAccess.cardSubtitle')}</span>
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  {t('familyCarerAccess.cardDescription')}
                </p>
              </div>

              <div className="grid gap-6 mb-8">
                {features.slice(0, 3).map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4 text-left">
                      <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-warning" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg mb-2">{feature.title}</h4>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-warning hover:bg-warning/90 text-white font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link to="/family-carer-access">
                      <Users className="h-5 w-5 mr-2" />
                      {t('familyCarerAccess.learnMore')}
                    </Link>
                  </Button>
                  
                  <IntroVideoModal 
                    defaultVideoId="family"
                    trigger={
                      <Button 
                        size="lg"
                        className="bg-warning text-white hover:bg-warning/90 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold px-8 py-4"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {t('familyCarerAccess.watchVideo')}
                      </Button>
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('familyCarerAccess.secureNote')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FamilyCarerAccess;