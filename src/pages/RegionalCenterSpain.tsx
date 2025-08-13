import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Clock, Shield, Users, CheckCircle2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

const RegionalCenterSpain: React.FC = () => {
  const { t, i18n } = useTranslation();

  // Basic SEO: set page title programmatically
  useEffect(() => {
    const prev = document.title;
    document.title = `${t('regionalCenterES.h1')} | ICE SOS`;
    return () => { document.title = prev; };
  }, [t, i18n.language]);

  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ICE SOS – Spain Regional Call Centre',
    areaServed: 'ES',
    url: typeof window !== 'undefined' ? window.location.href : 'https://example.com/regional-center/spain',
    contactPoint: [{
      '@type': 'ContactPoint',
      contactType: 'emergency',
      availableLanguage: ['English', 'Spanish'],
      areaServed: 'ES'
    }]
  }), []);

  const whatWeDo: string[] = t('regionalCenterES.whatWeDo', { returnObjects: true }) as unknown as string[];
  const whenToContact: string[] = t('regionalCenterES.whenToContact', { returnObjects: true }) as unknown as string[];

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="pt-16 md:pt-20">
        <SEO 
          title="Regional Call Centre Spain – ICE SOS Lite" 
          description="Spain regional emergency support center. English & Spanish assistance for ICE SOS users." 
          structuredData={jsonLd} 
        />
        
        {/* Hero Section - Matching brand style */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-hero shadow-2xl">
          <div className="container mx-auto px-4 py-20 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="text-center lg:text-left text-white">
                <div className="inline-flex items-center space-x-2 bg-green-500/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg border border-green-500/30">
                  <MapPin className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium text-white">✅ Regional Emergency Support - Spain</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                  {t('regionalCenterES.h1', { defaultValue: 'Spain Regional Call Centre' })}
                  <span className="text-green-400 drop-shadow-md"> - Emergency Support</span>
                </h1>
                
                <p className="text-xl md:text-2xl mb-8 text-white leading-relaxed font-medium drop-shadow-sm">
                  {t('regionalCenterES.heroDescription', { defaultValue: 'Bilingual English & Spanish 24/7 emergency support with live translation and coordination with local services.' })}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                  <Button 
                    asChild 
                    size="xl" 
                    className="bg-emergency text-black hover:bg-emergency/90 shadow-glow hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg px-8 py-4 rounded-xl border-2 border-emergency-glow/20"
                  >
                    <Link to="/register">Join Now</Link>
                  </Button>
                </div>
              </div>
              
              {/* Hero Image */}
              <div className="relative">
                <div className="relative z-10">
                  <img 
                    src="/lovable-uploads/ad6fb102-913b-42c4-a5e9-81162c5616c0.png" 
                    alt="Spain Regional Emergency Call Center Team - Professional bilingual support staff with headsets"
                    className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl"
                    loading="eager"
                    decoding="async"
                    sizes="(min-width: 1024px) 512px, 90vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Do & When to Contact Section */}
        <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-emergency bg-clip-text text-transparent mb-6">
                Professional Emergency Support
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Our Spain regional center provides specialized bilingual emergency coordination with local expertise and cultural understanding.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-xl border-2 border-green-500/20 hover:border-green-500/40 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">What We Do</h3>
                  </div>
                  <div className="space-y-3">
                    {(whatWeDo || [
                      'Bilingual English & Spanish emergency response',
                      'Live translation during critical situations',
                      'Direct coordination with local emergency services',
                      'Medical information relay to responders',
                      'Cultural and regional expertise',
                      'Priority escalation protocols'
                    ]).map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-guardian flex items-center justify-center">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold">When to Contact</h3>
                  </div>
                  <div className="space-y-3">
                    {(whenToContact || [
                      'Medical emergencies requiring immediate response',
                      'Situations needing Spanish-speaking assistance',
                      'Tourist or travel emergency situations',
                      'Complex emergencies requiring local coordination',
                      'When language barriers affect emergency response',
                      'Any life-threatening situation in Spain'
                    ]).map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Service Details Section */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Service Details</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Comprehensive coverage and specialized support for Spanish regions.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center p-6 border-2 border-green-500/20 hover:border-green-500/50 transition-colors shadow-lg">
                <Clock className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-lg">{t('regionalCenterES.coverageTitle', { defaultValue: 'Coverage' })}</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>{t('regionalCenterES.coverageHours', { defaultValue: '24/7 Emergency Response' })}</p>
                  <p>{t('regionalCenterES.coverageLanguages', { defaultValue: 'English & Spanish' })}</p>
                  <p>{t('regionalCenterES.coverageRegion', { defaultValue: 'Spain & Territories' })}</p>
                </div>
              </Card>

              <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/50 transition-colors shadow-lg">
                <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-lg">{t('regionalCenterES.confidentialityTitle', { defaultValue: 'Privacy' })}</h3>
                <p className="text-muted-foreground">
                  {t('regionalCenterES.confidentialityDesc', { defaultValue: 'All communications are secure and confidential following medical privacy standards.' })}
                </p>
              </Card>

              <Card className="text-center p-6 border-2 border-emergency/20 hover:border-emergency/50 transition-colors shadow-lg">
                <MapPin className="h-12 w-12 text-emergency mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-lg">Quick Links</h3>
                <div className="space-y-3">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/support">{t('regionalCenterES.ctaSupport', { defaultValue: 'Contact Support' })}</Link>
                  </Button>
                  <Button asChild className="w-full bg-emergency hover:bg-emergency/90">
                    <Link to="/sos">{t('regionalCenterES.ctaSOS', { defaultValue: 'Emergency SOS' })}</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default RegionalCenterSpain;
