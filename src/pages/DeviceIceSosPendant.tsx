import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Check, Bluetooth, Battery, Droplets, MapPin, Shield, PhoneCall, CheckCircle2, Smartphone } from "lucide-react";

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
    image: typeof window !== "undefined" ? `${window.location.origin}/lovable-uploads/141f77cc-c074-48dc-95f1-f886baacd2da.png` : "",
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
        <meta property="og:image" content={typeof window !== "undefined" ? `${window.location.origin}/lovable-uploads/141f77cc-c074-48dc-95f1-f886baacd2da.png` : ""} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
      </Helmet>

      <header className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-hero shadow-2xl">
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />

        {/* Subtle pattern like homepage */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:20px_20px]" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left text-white">
              <Badge variant="secondary" className="mb-6">ICE SOS Lite Device</Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                {t('products.icePendant.name', { defaultValue: 'ICE SOS Bluetooth Pendant' })}
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed font-medium drop-shadow-sm">
                {t('devices.icePendant.hero', { defaultValue: 'A discreet, one-button pendant that instantly activates your emergency plan via the ICE SOS Lite app. Designed for reliability, comfort, and peace of mind.' })}
              </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                  {comingSoon ? (
                    <Badge className="px-8 py-4 text-lg font-semibold bg-secondary text-white">{t('common.comingSoon', { defaultValue: 'Coming Soon' })}</Badge>
                  ) : (
                    <Button className="px-8 py-4 text-lg font-semibold" size="xl" asChild>
                      <Link to="/ai-register">{t('common.buyNow', { defaultValue: 'Buy now' })}</Link>
                    </Button>
                  )}
                  <Button variant="outline" className="px-8 py-4 text-lg font-semibold" size="xl" asChild>
                    <Link to="#how-it-works">{t('common.howItWorks', { defaultValue: 'How it works' })}</Link>
                  </Button>
                </div>
              <ul className="mt-8 space-y-3 text-white/80">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emergency" /> Works with any ICE SOS subscription</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emergency" /> One‑tap SOS activation from a wearable</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emergency" /> Quick pairing, secure connection</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/80">
                <span className="inline-flex items-center gap-2"><Shield className="h-4 w-4 text-emergency" />IP67 Waterproof</span>
                <span className="inline-flex items-center gap-2"><PhoneCall className="h-4 w-4 text-emergency" />App-assisted response</span>
              </div>
            </div>
            <div className="relative">
              <img
                src="/lovable-uploads/141f77cc-c074-48dc-95f1-f886baacd2da.png"
                alt="ICE SOS Lite Bluetooth Pendant with smartphone showing emergency activation"
                className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl hover-scale"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                sizes="(min-width: 1024px) 512px, 90vw"
              />
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-guardian/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </header>

      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-primary to-emergency bg-clip-text text-transparent">How it works</h2>
              <ol className="mt-4 space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-emergency mt-0.5" /><span>1. Pair the pendant with your phone via Bluetooth in the ICE SOS Lite app.</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-emergency mt-0.5" /><span>2. Wear it like a pendant, clip, or keyring for easy access.</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-emergency mt-0.5" /><span>3. Press once to trigger SOS. Your emergency contacts are alerted instantly.</span></li>
                <li className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5 text-emergency mt-0.5" /><span>4. Your phone securely shares GPS location and critical info with responders.</span></li>
              </ol>
              <div className="mt-6">
                <Button asChild disabled={comingSoon}>
                  {comingSoon ? (
                    <span>{t('common.comingSoon', { defaultValue: 'Coming Soon' })}</span>
                  ) : (
                    <Link to="/ai-register">Get the pendant</Link>
                  )}
                </Button>
              </div>
            </div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold">Key features</h3>
                <ul className="mt-4 grid gap-3">
                  {features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <f.icon className="h-5 w-5 text-primary mt-0.5" />
                      <span className="text-sm text-muted-foreground">{f.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Instant Alerts card with phone analytics */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl bg-background rounded-3xl shadow-xl border border-border p-8 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Every Second Counts</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold">Instant Alerts for Faster Emergency Response</h2>
            <p className="mt-3 text-muted-foreground">
              ICE SOS Lite sends instant alerts to your trusted contacts and responders with location and essential health info,
              reducing response times when it matters most.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="relative w-80 md:w-96 aspect-[4/3] bg-muted/20 rounded-2xl p-4 shadow-lg border border-border">
                <div className="h-full rounded-xl bg-background p-4 shadow-inner">
                  <div className="mb-3 text-center">
                    <p className="text-xs text-muted-foreground">Emergency Response Times</p>
                    <p className="text-sm font-medium">Daily Alert Volume</p>
                  </div>
                  <ChartContainer className="h-32 w-full" config={{ alerts: { color: "hsl(var(--emergency))" } }}>
                    <AreaChart data={alertData} margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Area type="monotone" dataKey="alerts" stroke="var(--color-alerts)" fill="var(--color-alerts)" fillOpacity={0.2} strokeWidth={2} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </AreaChart>
                  </ChartContainer>
                  <p className="mt-2 text-xs text-center text-muted-foreground">Real-time monitoring active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold bg-gradient-to-r from-primary to-emergency bg-clip-text text-transparent">Tech specs</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            <Card className="shadow-md border-border">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Bluetooth className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Connectivity</p>
                    <p className="text-sm text-muted-foreground">Bluetooth 5.0 LE, quick pairing</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-border">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Battery className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Battery</p>
                    <p className="text-sm text-muted-foreground">Rechargeable, up to 7 days typical use</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-border">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Droplets className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Durability</p>
                    <p className="text-sm text-muted-foreground">IP67 water and dust resistance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-border">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Range</p>
                    <p className="text-sm text-muted-foreground">Up to 100 meters from paired phone</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-border">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Compatibility</p>
                    <p className="text-sm text-muted-foreground">Works with ICE SOS Lite app on iOS and Android</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-border">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">What’s included</p>
                    <p className="text-sm text-muted-foreground">Pendant, charging cable, quick start guide</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature ring visuals */}
      <section className="py-20 bg-gradient-to-br from-secondary/10 via-background to-primary/5 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary-rgb),0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(var(--emergency-rgb),0.1),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-emergency to-guardian bg-clip-text text-transparent mb-4">
              ICE SOS Lite pendant — built for all needs
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Durable design with flexible wearing options and low‑energy connectivity for reliable, instant activation.
            </p>
          </div>

          <div className="relative mx-auto mt-12 max-w-4xl">
            <div className="relative grid place-items-center">
              {/* Enhanced concentric rings with gradients */}
              <div className="w-80 h-80 md:w-96 md:h-96 rounded-full border-2 border-gradient-to-r from-primary/30 to-emergency/30 bg-gradient-to-br from-background via-muted/20 to-background shadow-2xl animate-pulse" style={{animationDuration: '4s'}} />
              <div className="absolute w-52 h-52 md:w-64 md:h-64 rounded-full border border-primary/40 bg-gradient-to-br from-muted/30 to-background shadow-inner" />

              {/* Enhanced center token */}
              <div className="absolute w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-white via-muted/50 to-white border-2 border-primary/30 shadow-2xl grid place-items-center group hover:scale-105 transition-transform duration-300">
                <div className="text-center">
                  <Shield className="h-6 w-6 md:h-8 md:w-8 text-primary mx-auto mb-1" />
                  <span className="text-xs md:text-sm font-bold text-foreground">ICE SOS</span>
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-emergency/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Enhanced floating badges with improved colors and effects */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emergency to-emergency-glow text-white rounded-2xl border border-emergency/30 px-4 py-2 text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Battery className="h-4 w-4" />7‑day battery
                </span>
              </div>
              
              <div className="absolute top-1/2 -right-6 -translate-y-1/2 bg-gradient-to-r from-primary to-primary-glow text-white rounded-2xl border border-primary/30 px-4 py-2 text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Shield className="h-4 w-4" />Secure fit
                </span>
              </div>
              
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-guardian to-guardian-glow text-white rounded-2xl border border-guardian/30 px-4 py-2 text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <MapPin className="h-4 w-4" />Accurate location
                </span>
              </div>
              
              <div className="absolute top-1/2 -left-6 -translate-y-1/2 bg-gradient-to-r from-wellness to-wellness-glow text-white rounded-2xl border border-wellness/30 px-4 py-2 text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Bluetooth className="h-4 w-4" />BLE connectivity
                </span>
              </div>
              
              <div className="absolute top-8 left-8 bg-gradient-to-r from-blue to-blue-glow text-white rounded-2xl border border-blue/30 px-4 py-2 text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Check className="h-4 w-4" />Reliable & fast
                </span>
              </div>
              
              <div className="absolute top-8 right-8 bg-gradient-to-r from-green to-green-glow text-white rounded-2xl border border-green/30 px-4 py-2 text-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Droplets className="h-4 w-4" />IP67 waterproof
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced accessory cards with colorful gradients */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-lg text-foreground">Wristband</p>
                <p className="text-sm text-muted-foreground mt-1">Comfortable everyday wear</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-emergency/5 to-emergency/10 border-emergency/20 hover:border-emergency/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-emergency to-emergency-glow rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-lg text-foreground">Clip</p>
                <p className="text-sm text-muted-foreground mt-1">Attach to clothing or belts</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-guardian/5 to-guardian/10 border-guardian/20 hover:border-guardian/40 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-guardian to-guardian-glow rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-lg text-foreground">Keyring</p>
                <p className="text-sm text-muted-foreground mt-1">Keep it with your keys</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Brand strip - only our logo */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Brand</p>
            <img
              src="/lovable-uploads/7ad599e6-d1cd-4a1b-84f4-9b6b1e4242e1.png"
              alt="ICE SOS Lite brand logo"
              className="mx-auto h-12 md:h-14 object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold">Safety you can trust</h2>
              <p className="mt-4 text-muted-foreground">
                The ICE SOS Bluetooth Pendant is purpose-built for reliability. It’s a simple, tactile way to trigger an SOS when
                reaching for your phone isn’t practical. Perfect for independent living, outdoor activities, or added assurance at
                home and on the go.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild className="shadow-glow">
                <Link to="/ai-register">Buy now</Link>
              </Button>
              <Button variant="outline" asChild className="shadow-md">
                <Link to="/">Back to home</Link>
              </Button>
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
