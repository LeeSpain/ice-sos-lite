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
    image: typeof window !== "undefined" ? `${window.location.origin}/lovable-uploads/0fa5e960-e1ec-4a6b-ac84-1017544dfeca.png` : "",
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: "59.99",
      availability: "https://schema.org/InStock",
      url: canonical
    }
  };

  React.useEffect(() => {
    const fetchStatus = async () => {
      const { data } = await supabase
        .from('products')
        .select('status')
        .eq('name', 'ICE SOS Bluetooth Pendant')
        .maybeSingle();
      if (data?.status === 'coming_soon') setComingSoon(true);
    };
    fetchStatus();
  }, []);

  const features = [
    { icon: Bluetooth, text: "Bluetooth 5.0 Low Energy – fast, reliable pairing" },
    { icon: Droplets, text: "IP67 waterproof for everyday wear" },
    { icon: Battery, text: "Up to 7 days battery life per charge" },
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
        <meta property="og:image" content={typeof window !== "undefined" ? `${window.location.origin}/lovable-uploads/0fa5e960-e1ec-4a6b-ac84-1017544dfeca.png` : ""} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
      </Helmet>

      {/* Hero Section with existing image */}
      <header className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-hero shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:20px_20px]" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left text-white">
              <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">✅ Professional response within 60 seconds, 24/7</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                Get Emergency Help in 30 Seconds - <span className="text-emergency">Even When You Can't Speak or Dial</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed font-medium drop-shadow-sm">
                Professional emergency operators respond to your GPS location with your medical information - in any language, anywhere in the world
              </p>
              
              {/* Hero Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">45 seconds</div>
                  <div className="text-sm text-white/80">Average response time</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">15+ years</div>
                  <div className="text-sm text-white/80">Emergency experience</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-sm text-white/80">Global coverage</div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                {comingSoon ? (
                  <Badge className="px-8 py-4 text-lg font-semibold bg-secondary text-white">Coming Soon</Badge>
                ) : (
                  <Button className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-emergency to-primary hover:from-emergency/90 hover:to-primary/90 shadow-xl" size="xl" asChild>
                    <Link to="/ai-register">Order Now - €59.99</Link>
                  </Button>
                )}
                <Button variant="outline" className="px-8 py-4 text-lg font-semibold border-white/30 text-white hover:bg-white/10" size="xl" asChild>
                  <Link to="#product-gallery">View Details</Link>
                </Button>
              </div>
              <ul className="mt-8 space-y-3 text-white/90">
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-emergency" /> Works with any ICE SOS subscription</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-emergency" /> One-tap SOS activation from anywhere</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-emergency" /> 7-day battery life</li>
                <li className="flex items-center gap-3"><Check className="h-5 w-5 text-emergency" /> IP67 waterproof design</li>
              </ul>
            </div>
            <div className="relative">
              <img
                src="/lovable-uploads/0fa5e960-e1ec-4a6b-ac84-1017544dfeca.png"
                alt="ICE SOS Lite Bluetooth Pendant with smartphone showing emergency activation"
                className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl hover-scale"
                loading="eager"
                decoding="async"
                sizes="(min-width: 1024px) 512px, 90vw"
              />
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-emergency/20 rounded-full blur-xl animate-pulse" />
              <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </header>

      {/* Product Gallery Section */}
      <section id="product-gallery" className="py-20 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-emergency bg-clip-text text-transparent mb-6">
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
            <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/50 transition-colors">
              <Zap className="h-12 w-12 text-emergency mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Instant Activation</h3>
              <p className="text-sm text-muted-foreground">One-button emergency alert</p>
            </Card>
            <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/50 transition-colors">
              <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2">7-Day Battery</h3>
              <p className="text-sm text-muted-foreground">Long-lasting reliability</p>
            </Card>
            <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/50 transition-colors">
              <Droplets className="h-12 w-12 text-guardian mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Waterproof</h3>
              <p className="text-sm text-muted-foreground">IP67 rated protection</p>
            </Card>
            <Card className="text-center p-6 border-2 border-primary/20 hover:border-primary/50 transition-colors">
              <Heart className="h-12 w-12 text-emergency mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Peace of Mind</h3>
              <p className="text-sm text-muted-foreground">Always connected to help</p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">How it Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple setup, powerful protection. Get emergency help with just one button press.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-emergency flex items-center justify-center text-white font-bold text-lg">1</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Pair & Setup</h3>
                  <p className="text-muted-foreground">Connect the pendant to your phone via Bluetooth in the ICE SOS Lite app. Quick 2-minute setup.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-emergency flex items-center justify-center text-white font-bold text-lg">2</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Wear Anywhere</h3>
                  <p className="text-muted-foreground">Attach to clothing, wear as a pendant, or keep on your keyring. Comfortable for daily use.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-emergency flex items-center justify-center text-white font-bold text-lg">3</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">One-Button Alert</h3>
                  <p className="text-muted-foreground">Press once to trigger SOS. Your emergency contacts receive instant alerts with your location.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-emergency flex items-center justify-center text-white font-bold text-lg">4</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Help Arrives</h3>
                  <p className="text-muted-foreground">Emergency responders receive your GPS location and critical medical information instantly.</p>
                </div>
              </div>

              <div className="pt-6">
                <Button size="lg" className="w-full md:w-auto" asChild disabled={comingSoon}>
                  {comingSoon ? (
                    <span>Coming Soon</span>
                  ) : (
                    <Link to="/ai-register">Get Your ICE Pendant - €59.99</Link>
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

      {/* Tech Specs */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-primary to-emergency bg-clip-text text-transparent">
            Technical Specifications
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-lg border-2 border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Bluetooth className="h-8 w-8 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Connectivity</h3>
                    <p className="text-muted-foreground">Bluetooth 5.0 LE</p>
                    <p className="text-muted-foreground">Quick pairing</p>
                    <p className="text-muted-foreground">100m range</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg border-2 border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Battery className="h-8 w-8 text-guardian mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Power</h3>
                    <p className="text-muted-foreground">Rechargeable battery</p>
                    <p className="text-muted-foreground">7 days typical use</p>
                    <p className="text-muted-foreground">USB-C charging</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-lg border-2 border-primary/10 hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Shield className="h-8 w-8 text-emergency mt-1" />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Durability</h3>
                    <p className="text-muted-foreground">IP67 waterproof</p>
                    <p className="text-muted-foreground">Shock resistant</p>
                    <p className="text-muted-foreground">Premium materials</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-muted/30 via-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-emergency bg-clip-text text-transparent">
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
            <Card className="p-6 shadow-xl border-2 border-primary/10 hover:border-primary/30 transition-colors">
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

            <Card className="p-6 shadow-xl border-2 border-primary/10 hover:border-primary/30 transition-colors">
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

            <Card className="p-6 shadow-xl border-2 border-primary/10 hover:border-primary/30 transition-colors">
              <div className="mb-4">
                <div className="flex text-yellow-400 mb-3">
                  {"★★★★★".split('').map((star, i) => (
                    <span key={i} className="text-lg">{star}</span>
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-4">
                  "My elderly mother accidentally pressed her pendant while gardening. We all got the alert immediately, but when we called her back she was fine. It's reassuring to know the system works."
                </p>
                <div className="text-sm font-semibold">- Anna P., Madrid</div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Technical & Service Details Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-emergency bg-clip-text text-transparent">
              Complete Technical Specifications
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Medical Information Storage */}
            <Card className="p-8 shadow-xl border-2 border-primary/10">
              <h3 className="text-2xl font-bold mb-6 text-primary">Medical Information Storage</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">What data is stored?</h4>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>• Emergency medical conditions</li>
                    <li>• Current medications</li>
                    <li>• Allergies and medical alerts</li>
                    <li>• Emergency contact information</li>
                    <li>• Preferred hospital/doctor</li>
                    <li>• Blood type and medical ID number</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">How is it accessed?</h4>
                  <p className="text-muted-foreground text-sm">Only by certified emergency operators during active SOS alerts. Data is encrypted and GDPR compliant.</p>
                </div>
              </div>
            </Card>

            {/* Language Support & Coverage */}
            <Card className="p-8 shadow-xl border-2 border-primary/10">
              <h3 className="text-2xl font-bold mb-6 text-emergency">Global Coverage</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Supported Languages:</h4>
                  <p className="text-muted-foreground text-sm">Spanish, English, French, German, Italian, Portuguese, Dutch, Polish, Swedish, Norwegian, Danish, Finnish</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Covered Countries:</h4>
                  <p className="text-muted-foreground text-sm">All EU countries, UK, USA, Canada, Australia, New Zealand. Expanding to 50+ countries by 2025.</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Device Specifications:</h4>
                  <ul className="text-muted-foreground space-y-1 text-sm">
                    <li>• Range: Up to 100 meters from phone</li>
                    <li>• Battery: Up to 3 years battery life</li>
                    <li>• Waterproof: IP67 rated</li>
                    <li>• Weight: 25 grams</li>
                    <li>• Dimensions: 45mm x 35mm x 12mm</li>
                  </ul>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-emergency bg-clip-text text-transparent">
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
              <p className="text-muted-foreground">Premium Protection is €4.99/month with no setup fees. The Bluetooth pendant is €59.99 one-time. Cancel anytime with 30 days notice.</p>
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
                    <Link to="/ai-register">Order Now - €59.99</Link>
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