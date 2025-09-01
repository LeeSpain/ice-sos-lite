import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Check, Bluetooth, Battery, Droplets, MapPin, Shield, PhoneCall, CheckCircle2, Smartphone, Zap, Clock, Heart } from "lucide-react";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/integrations/supabase/client";

const DeviceIceSosPendant = () => {
  console.log('[DeviceIceSosPendant] Component rendering started');
  const { t } = useTranslation();
  const [comingSoon, setComingSoon] = useState(false);
  const title = t('devices.icePendant.seoTitle', { defaultValue: 'ICE SOS Bluetooth Pendant – ICE SOS Lite' });
  const description = t('devices.icePendant.metaDescription', { defaultValue: 'Hands-free emergency pendant with Bluetooth, waterproof design, and 7-day battery. Works with ICE SOS Lite app.' });
  const canonical = typeof window !== "undefined" ? `${window.location.origin}/devices/ice-sos-pendant` : "https://example.com/devices/ice-sos-pendant";

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "ICE SOS Bluetooth Pendant (ICE SOS Lite)",
    brand: {
      "@type": "Brand",
      name: "ICE SOS Lite"
    },
    description,
    image: typeof window !== "undefined" ? `${window.location.origin}/lovable-uploads/acfcc77a-7e34-44f5-8487-4069c2acb56b.png` : "",
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: "64.98",
      availability: "https://schema.org/InStock",
      url: canonical,
      description: "ICE SOS Bluetooth Pendant €59.99 + €4.99 shipping"
    }
  };

  React.useEffect(() => {
    console.log('[DeviceIceSosPendant] useEffect running - fetching product status');
    const fetchStatus = async () => {
      try {
        const { data } = await supabase
          .from('products')
          .select('status')
          .eq('name', 'ICE SOS Bluetooth Pendant')
          .maybeSingle();
        console.log('[DeviceIceSosPendant] Product status data:', data);
        if (data?.status === 'coming_soon') setComingSoon(true);
      } catch (error) {
        console.error('[DeviceIceSosPendant] Error fetching product status:', error);
      }
    };
    fetchStatus();
  }, []);

  const features = [
    { icon: Bluetooth, text: "Bluetooth 5.0 Low Energy – fast, reliable pairing" },
    { icon: Droplets, text: "IP67 waterproof for everyday wear" },
    { icon: Battery, text: "More than 7 days battery life per charge" },
    { icon: MapPin, text: "100m range from your phone for flexible movement" }
  ];

  const alertData = [
    { time: "09:00", alerts: 2 },
    { time: "10:00", alerts: 4 },
    { time: "11:00", alerts: 3 },
    { time: "12:00", alerts: 6 },
    { time: "13:00", alerts: 5 },
    { time: "14:00", alerts: 7 },
    { time: "15:00", alerts: 4 },
  ];

  console.log('[DeviceIceSosPendant] Rendering with comingSoon:', comingSoon);

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16 md:pt-20">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={typeof window !== "undefined" ? `${window.location.origin}/lovable-uploads/acfcc77a-7e34-44f5-8487-4069c2acb56b.png` : ""} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-hero shadow-2xl">
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left text-white">
              <div className="inline-flex items-center space-x-2 bg-emergency/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg border border-emergency/30">
                <Shield className="h-4 w-4 text-emergency-glow" />
                <span className="text-sm font-medium text-white">Professional response within 60 seconds, 24/7</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                Complete Emergency Ecosystem - <span className="text-wellness">Pendant + Smart Home + Emergency Contacts</span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 text-white leading-relaxed font-medium drop-shadow-sm">
                One button instantly calls ALL your emergency contacts and works with your existing Alexa/Google Home - professional response anywhere in the world
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                {comingSoon ? (
                  <Badge className="px-8 py-4 text-lg font-semibold bg-secondary text-white">Coming Soon</Badge>
                ) : (
                  <Button 
                    asChild 
                    size="xl" 
                    className="bg-wellness text-white hover:bg-wellness/90 shadow-glow hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg px-8 py-4 rounded-xl border-2 border-wellness/20"
                  >
                    <Link to="/ai-register">Order Complete Ecosystem - €59.99 + €4.99 shipping</Link>
                  </Button>
                )}
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <img 
                  src="/lovable-uploads/acfcc77a-7e34-44f5-8487-4069c2acb56b.png" 
                  alt="ICE SOS Lite Bluetooth Pendant with smartphone showing emergency activation"
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

      {/* Product Gallery Section */}
      <section id="product-gallery" className="py-20 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
              Meet Your Emergency Guardian
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Sleek, discreet, and powerful. The ICE Smart SOS Button combines premium design with life-saving technology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Packaging View */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-muted/50 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="aspect-square p-8">
                <img
                  src="/lovable-uploads/eed57ca0-9285-4130-a053-d65b3e140e53.png"
                  alt="ICE Smart SOS Button with packaging and accessories"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-6 left-6 right-6 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-lg font-semibold text-white mb-2">Complete Package</h3>
                <p className="text-sm text-white/80">Everything you need to get started</p>
              </div>
            </div>

            {/* Card View */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-muted/30 to-background shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="aspect-square p-8">
                <img
                  src="/lovable-uploads/fc8e5cbc-2145-4857-81a9-17c7795350c1.png"
                  alt="ICE Smart SOS Button with product card and keyring"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-6 left-6 right-6 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-lg font-semibold text-white mb-2">Premium Design</h3>
                <p className="text-sm text-white/80">Elegant and functional</p>
              </div>
            </div>

            {/* White Pendant View */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 to-emergency/10 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="aspect-square p-8">
                <img
                  src="/lovable-uploads/5c1a45e0-5a70-4691-bc64-550668fe6e0f.png"
                  alt="ICE Smart SOS Button white pendant on lanyard"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-6 left-6 right-6 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-lg font-semibold text-white mb-2">Wearable Safety</h3>
                <p className="text-sm text-white/80">Comfortable daily wear</p>
              </div>
            </div>
          </div>

          {/* Key Features Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover-scale">
              <Zap className="h-12 w-12 text-emergency mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Instant Activation</h3>
              <p className="text-sm text-muted-foreground">One-button emergency alert</p>
            </Card>
            <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover-scale">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Extended Battery</h3>
              <p className="text-sm text-muted-foreground">More than 7 days reliability</p>
            </Card>
            <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover-scale">
              <Droplets className="h-12 w-12 text-guardian mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Waterproof</h3>
              <p className="text-sm text-muted-foreground">IP67 rated protection</p>
            </Card>
            <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover-scale">
              <Heart className="h-12 w-12 text-emergency mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Peace of Mind</h3>
              <p className="text-sm text-muted-foreground">Always connected to help</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Smart Home Integration Section */}
      <section className="py-20 bg-gradient-to-br from-guardian/10 via-background to-primary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">Works With Your Smart Home</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              No additional hubs required. Your pendant integrates seamlessly with existing Alexa, Google Home, and any smartphone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Alexa Integration */}
            <Card className="p-8 text-center shadow-xl border-2 border-primary/10 hover:border-primary/30 transition-colors">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">A</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Amazon Alexa</h3>
              <p className="text-muted-foreground mb-4">
                "Alexa, help help help" instantly triggers emergency alerts to ALL contacts
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✓ Works with any Alexa device</p>
                <p>✓ Voice activation from anywhere</p>
                <p>✓ Announces emergency to household</p>
              </div>
            </Card>

            {/* Google Home Integration */}
            <Card className="p-8 text-center shadow-xl border-2 border-guardian/10 hover:border-guardian/30 transition-colors">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-guardian/20 to-guardian/10 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-guardian">G</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Google Home</h3>
              <p className="text-muted-foreground mb-4">
                "Hey Google, emergency" calls ALL contacts and shares location
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✓ Works with Google Nest devices</p>
                <p>✓ Multi-room emergency broadcast</p>
                <p>✓ Instant family coordination</p>
              </div>
            </Card>

            {/* Smartphone Integration */}
            <Card className="p-8 text-center shadow-xl border-2 border-emergency/10 hover:border-emergency/30 transition-colors">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-emergency/20 to-emergency/10 rounded-full flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-emergency" />
              </div>
              <h3 className="text-xl font-bold mb-4">Any Smartphone</h3>
              <p className="text-muted-foreground mb-4">
                iOS/Android compatible - no brand restrictions
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>✓ iPhone and Android support</p>
                <p>✓ Background app protection</p>
                <p>✓ Always connected via Bluetooth</p>
              </div>
            </Card>
          </div>

          {/* Setup Process */}
          <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-center mb-8">5-Minute Smart Home Setup</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">1</div>
                <p className="text-sm font-semibold">Download ICE SOS Lite app</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-guardian rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">2</div>
                <p className="text-sm font-semibold">Pair pendant via Bluetooth</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emergency rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">3</div>
                <p className="text-sm font-semibold">Connect to Alexa/Google</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-wellness rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">4</div>
                <p className="text-sm font-semibold">Test emergency system</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact Calling Section */}
      <section className="py-20 bg-emergency/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">ALL Emergency Contacts Called Simultaneously</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Unlike other systems that only send alerts, we CALL all your emergency contacts at the same time for guaranteed response.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <Card className="p-6 border-l-4 border-emergency shadow-lg">
                <h3 className="text-xl font-bold mb-3 text-emergency">Instant Phone Calls</h3>
                <p className="text-muted-foreground">
                  The system automatically dials ALL your emergency contacts (up to 5) simultaneously. No waiting for text responses - direct voice contact for immediate action.
                </p>
              </Card>

              <Card className="p-6 border-l-4 border-guardian shadow-lg">
                <h3 className="text-xl font-bold mb-3 text-guardian">GPS Location Shared</h3>
                <p className="text-muted-foreground">
                  Every contact receives your exact GPS coordinates via SMS and voice message. They know exactly where to find you or where to send help.
                </p>
              </Card>

              <Card className="p-6 border-l-4 border-primary shadow-lg">
                <h3 className="text-xl font-bold mb-3 text-primary">Medical Information Included</h3>
                <p className="text-muted-foreground">
                  Critical medical conditions, medications, and allergies are automatically shared with your emergency contacts so they can inform first responders.
                </p>
              </Card>

              <Card className="p-6 border-l-4 border-wellness shadow-lg">
                <h3 className="text-xl font-bold mb-3 text-wellness">Smart Speaker Announcement</h3>
                <p className="text-muted-foreground">
                  If you have Alexa or Google Home, they announce the emergency throughout your home so anyone present knows to help or call 911.
                </p>
              </Card>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-emergency/10 to-primary/10 rounded-3xl p-8 shadow-2xl">
                <h3 className="text-2xl font-bold mb-6 text-center">Emergency Response Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-emergency rounded-full flex items-center justify-center text-white text-sm font-bold">0s</div>
                    <p className="text-sm">Button pressed or voice command</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-guardian rounded-full flex items-center justify-center text-white text-sm font-bold">3s</div>
                    <p className="text-sm">ALL contacts called simultaneously</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">5s</div>
                    <p className="text-sm">GPS location sent via SMS</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-wellness rounded-full flex items-center justify-center text-white text-sm font-bold">7s</div>
                    <p className="text-sm">Smart speakers announce emergency</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-emergency rounded-full flex items-center justify-center text-white text-sm font-bold">30s</div>
                    <p className="text-sm">First contact typically responds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">Complete Emergency Ecosystem</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your pendant works with existing smart speakers and automatically calls ALL emergency contacts. No additional hubs needed - uses your current setup.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-emergency flex items-center justify-center text-white font-bold text-lg">1</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Connect Everything</h3>
                  <p className="text-muted-foreground">Pair pendant to phone + connect to existing Alexa/Google Home. Works with ANY smartphone (iOS/Android). 5-minute setup.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-emergency flex items-center justify-center text-white font-bold text-lg">2</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Voice Commands Ready</h3>
                  <p className="text-muted-foreground">Say "Alexa, help help help" or "Hey Google, emergency" - your smart speakers become emergency triggers too.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-emergency flex items-center justify-center text-white font-bold text-lg">3</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Instant Emergency Response</h3>
                  <p className="text-muted-foreground">One button press or voice command → ALL emergency contacts called simultaneously + GPS location sent + smart speakers announce emergency.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-emergency flex items-center justify-center text-white font-bold text-lg">4</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Professional Help Dispatched</h3>
                  <p className="text-muted-foreground">Emergency operators receive GPS location + medical information + contact all family members. Complete coordination in any language, anywhere in the world.</p>
                </div>
              </div>

              <div className="pt-6">
                <Button size="lg" className="w-full md:w-auto" asChild disabled={comingSoon}>
                  {comingSoon ? (
                    <span>Coming Soon</span>
                  ) : (
                    <Link to="/ai-register">Get Complete Emergency System - €59.99 + €4.99 shipping</Link>
                  )}
                </Button>
              </div>
            </div>

            {/* Visual representation */}
            <div className="relative">
              <div className="w-full max-w-md mx-auto aspect-square relative">
                {/* Bluetooth connection rings */}
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                <div className="absolute inset-4 rounded-full border-2 border-primary/50 animate-ping" style={{ animationDelay: '0.5s' }} />
                <div className="absolute inset-8 rounded-full border-2 border-primary/70 animate-ping" style={{ animationDelay: '1s' }} />
                
                {/* Center device */}
                <div className="absolute inset-1/3 rounded-full bg-gradient-to-br from-white to-muted border-4 border-primary/20 shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 rounded-full bg-emergency mb-2 mx-auto animate-pulse" />
                    <p className="text-xs font-semibold">SOS</p>
                  </div>
                </div>
                
                {/* Connection indicators */}
                <div className="absolute top-4 right-4 w-16 h-16 rounded-full bg-gradient-to-br from-guardian/20 to-guardian/10 flex items-center justify-center">
                  <Smartphone className="h-8 w-8 text-guardian" />
                </div>
                <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-gradient-to-br from-emergency/20 to-emergency/10 flex items-center justify-center">
                  <PhoneCall className="h-8 w-8 text-emergency" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Customer Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-muted/30 via-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
              Real Stories from Real People
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">2,847</div>
                <div className="text-sm text-muted-foreground">Emergencies handled in 2024</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emergency mb-2">98.5%</div>
                <div className="text-sm text-muted-foreground">Customer satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-guardian mb-2">45 sec</div>
                <div className="text-sm text-muted-foreground">Average response time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">Zero</div>
                <div className="text-sm text-muted-foreground">Missed emergency calls</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 shadow-xl border-2 border-primary/10 hover:border-primary/30 transition-all duration-300 hover-scale animate-fade-in">
              <div className="mb-4">
                <div className="flex text-yellow-400 mb-3">
                  {"★★★★★".split('').map((star, i) => (
                    <span key={i} className="text-lg">{star}</span>
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-4">
                  "ICE SOS Lite saved my father's life when he fell and couldn't reach his phone. All five emergency contacts received his GPS location instantly, and my sister who lives closest got to him in under 10 minutes."
                </p>
                <div className="text-sm font-semibold">- Maria S., Barcelona</div>
              </div>
            </Card>

            <Card className="p-6 shadow-xl border-2 border-primary/10 hover:border-primary/30 transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="mb-4">
                <div className="flex text-yellow-400 mb-3">
                  {"★★★★★".split('').map((star, i) => (
                    <span key={i} className="text-lg">{star}</span>
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-4">
                  "I live alone and had a medical emergency. ICE SOS Lite instantly alerted my daughter and two neighbors with my exact location and medical information. They coordinated together to get me help quickly."
                </p>
                <div className="text-sm font-semibold">- James K., London</div>
              </div>
            </Card>

            <Card className="p-6 shadow-xl border-2 border-primary/10 hover:border-primary/30 transition-all duration-300 hover-scale animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="mb-4">
                <div className="flex text-yellow-400 mb-3">
                  {"★★★★★".split('').map((star, i) => (
                    <span key={i} className="text-lg">{star}</span>
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-4">
                  "My elderly mother accidentally pressed her pendant while gardening. We all got the alert immediately, but when we called her back she was fine. It's reassuring to know the system works perfectly."
                </p>
                <div className="text-sm font-semibold">- Anna P., Madrid</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical Specifications & Service Details */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
              Technical Specifications & Service Details
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Technical Specifications */}
            <Card className="p-8 shadow-xl border-2 border-primary/10 hover:border-primary/30 transition-all duration-300 hover-scale">
              <h3 className="text-2xl font-bold mb-6 text-primary">Device Specifications</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Bluetooth className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Connectivity</h4>
                    <p className="text-muted-foreground text-sm">Bluetooth 5.0 LE • 100m range • Quick pairing</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Battery className="h-6 w-6 text-guardian mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Power</h4>
                    <p className="text-muted-foreground text-sm">More than 7 days battery • USB-C charging • Rechargeable</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-emergency mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Durability</h4>
                    <p className="text-muted-foreground text-sm">IP67 waterproof • Shock resistant • 25g weight</p>
                  </div>
                </div>
                <div className="pt-2">
                  <h4 className="font-semibold mb-2">Dimensions</h4>
                  <p className="text-muted-foreground text-sm">45mm × 35mm × 12mm</p>
                </div>
              </div>
            </Card>

            {/* Medical Information Storage */}
            <Card className="p-8 shadow-xl border-2 border-guardian/10 hover:border-guardian/30 transition-all duration-300 hover-scale">
              <h3 className="text-2xl font-bold mb-6 text-guardian">Medical Information</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Stored Securely:</h4>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>• Emergency medical conditions</li>
                    <li>• Current medications</li>
                    <li>• Allergies and medical alerts</li>
                    <li>• Blood type and medical ID</li>
                    <li>• Preferred hospital/doctor</li>
                    <li>• Emergency contact information</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Privacy & Access:</h4>
                  <p className="text-muted-foreground text-sm">End-to-end encrypted. Only accessible by certified emergency operators during active SOS alerts. GDPR compliant.</p>
                </div>
              </div>
            </Card>

            {/* Global Coverage */}
            <Card className="p-8 shadow-xl border-2 border-emergency/10 hover:border-emergency/30 transition-all duration-300 hover-scale">
              <h3 className="text-2xl font-bold mb-6 text-emergency">Global Coverage</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Supported Languages:</h4>
                  <p className="text-muted-foreground text-sm">Spanish, English, French, German, Italian, Portuguese, Dutch, Polish, Swedish, Norwegian, Danish, Finnish</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Coverage Areas:</h4>
                  <p className="text-muted-foreground text-sm">All EU countries, UK, USA, Canada, Australia, New Zealand. Expanding to 50+ countries by 2025.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Smart Home Integration:</h4>
                  <p className="text-muted-foreground text-sm">Compatible with any Alexa or Google Home device. Works with iOS and Android smartphones.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-muted/30 via-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-3">What exactly happens when I press SOS?</h3>
              <p className="text-muted-foreground">Within 3 seconds, your GPS location and medical profile are sent to your 5 emergency contacts via SMS and app notifications. They receive your exact location, emergency status, and stored medical information to coordinate help quickly.</p>
            </Card>

            <Card className="p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-3">How fast is the response?</h3>
              <p className="text-muted-foreground">Emergency contacts receive alerts within 3 seconds of pressing SOS. How quickly help arrives depends on your emergency contacts' response time and local emergency services.</p>
            </Card>

            <Card className="p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-3">What if I accidentally press the button?</h3>
              <p className="text-muted-foreground">Your emergency contacts will receive the alert and can call you to verify. You can also cancel false alarms directly in the app within 30 seconds to notify contacts it was accidental.</p>
            </Card>

            <Card className="p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-3">Does this work internationally?</h3>
              <p className="text-muted-foreground">Yes, the app works in all EU countries, UK, USA, Canada, Australia, and New Zealand. Your emergency contacts will receive alerts with GPS coordinates no matter where you are.</p>
            </Card>

            <Card className="p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-3">What medical information do you store?</h3>
              <p className="text-muted-foreground">We store emergency medical conditions, current medications, allergies, blood type, emergency contacts, and preferred hospital. This information is shared with your emergency contacts during SOS alerts.</p>
            </Card>

            <Card className="p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-3">How much does it cost?</h3>
              <p className="text-muted-foreground">Premium Protection is €4.99/month with no setup fees. The Bluetooth pendant is €59.99 one-time + €4.99 shipping. Cancel anytime with 30 days notice.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 via-emergency/5 to-guardian/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready for Ultimate Peace of Mind?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands who trust ICE SOS Lite for their emergency protection. Get your Smart SOS Button today.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {comingSoon ? (
                <Badge className="px-8 py-4 text-lg font-semibold bg-secondary text-white">Coming Soon</Badge>
              ) : (
                <>
                  <Button size="lg" className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-emergency to-primary hover:from-emergency/90 hover:to-primary/90 shadow-xl" asChild>
                    <Link to="/ai-register">Order Complete System - €59.99 + €4.99 shipping</Link>
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    <Check className="h-4 w-4 inline mr-2 text-green-600" />
                    Free shipping • 30-day guarantee • 24/7 support
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  );
};

export default DeviceIceSosPendant;