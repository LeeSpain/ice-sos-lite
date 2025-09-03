import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Heart, Shield, Clock, UserCheck, CheckCircle2, Play } from 'lucide-react';
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { IntroVideoModal } from '@/components/IntroVideoModal';
import { usePreferences } from '@/contexts/PreferencesContext';
import { convertCurrency, formatDisplayCurrency, languageToLocale } from '@/utils/currency';
import familyCarerImage from '@/assets/family-carer-support.jpg';

const FamilyCarerAccess = () => {
  const { t } = useTranslation();
  const { currency, language } = usePreferences();
  
  // Family pricing from subscription plans
  const basePriceEUR = 2.99;
  const convertedPrice = convertCurrency(basePriceEUR, 'EUR', currency);
  const formattedPrice = formatDisplayCurrency(convertedPrice, currency, languageToLocale(language));
  const billingInterval = t('common.perMonth');

  const features = [
    'Trusted family contacts & emergency coordination',
    'Professional care coordination with medical teams',
    'Privacy controls for family access levels',
    'Real-time updates during emergency situations',
    'Multi-generational family support plans',
    'Secure family communication channels'
  ];


  return (
    <section className="py-8 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-warning/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg border border-warning/30">
            <Users className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium text-warning">{t('familyCarerAccess.sectionBadge')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
            {t('familyCarerAccess.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('familyCarerAccess.subtitle')}
          </p>
        </div>

        <Card className="shadow-xl border-2 border-warning/20 hover:border-warning/40 transition-colors">
          <CardContent className="p-6">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              {/* Content */}
              <div className="text-center lg:text-left">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-warning to-warning/80 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">{t('familyCarerAccess.cardTitle')}</h3>
                </div>
                
                <div className="mb-4">
                  <span className="text-2xl font-bold text-warning">{formattedPrice}</span>
                  <span className="text-muted-foreground text-sm ml-2">{billingInterval} {t('familyCarerAccess.cardSubtitle')}</span>
                </div>
                
                <p className="text-muted-foreground mb-4 text-sm">
                  {t('familyCarerAccess.cardDescription')}
                </p>
                
                <div className="grid grid-cols-1 gap-2 mb-6">
                  {features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                      <span className="text-foreground text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Button 
                    asChild 
                    size="default" 
                    className="bg-warning text-white hover:bg-warning/90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold px-6 py-2 rounded-xl border-2 border-warning/20"
                  >
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
                        size="default"
                        className="border-warning text-warning hover:bg-warning hover:text-white font-semibold px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {t('familyCarerAccess.watchVideo')}
                      </Button>
                    }
                  />
                </div>
                
                <p className="text-xs text-muted-foreground mt-3">
                  {t('familyCarerAccess.secureNote')}
                </p>
              </div>
              
              {/* Family Image */}
              <div className="relative">
                <div className="relative z-10">
                  <img 
                    src={familyCarerImage} 
                    alt="Professional family care support - Multi-generational family representing comprehensive family protection services"
                    className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl"
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 1024px) 512px, 90vw"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default FamilyCarerAccess;