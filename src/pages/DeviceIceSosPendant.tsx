import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Check, Bluetooth, Battery, Droplets, MapPin, Shield, PhoneCall, CheckCircle2, Smartphone, Zap, Clock, Heart, Star, Users, Globe, Phone } from "lucide-react";
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
    { icon: Bluetooth, text: "Bluetooth 5.0 Low Energy – instant pairing" },
    { icon: Droplets, text: "IP67 waterproof for daily wear" },
    { icon: Battery, text: "More than 7 days battery life" },
    { icon: MapPin, text: "100m range from smartphone" }
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
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-hero">
        <div className="max-w-6xl mx-auto px-4 py-section relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left text-white">
              <div className="inline-flex items-center space-x-2 bg-emergency/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                <Shield className="h-4 w-4 text-emergency-glow" />
                <span className="text-sm font-medium">24/7 Professional Response</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                ICE SOS Emergency <span className="text-wellness">Bluetooth Pendant</span>
              </h1>
              
              <p className="text-lg md:text-xl mb-8 leading-relaxed opacity-90">
                Hands-free emergency protection with smart home integration. One button calls ALL your emergency contacts instantly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {comingSoon ? (
                  <Badge className="px-6 py-3 text-lg font-semibold bg-secondary text-white">Coming Soon</Badge>
                ) : (
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-wellness text-white hover:bg-wellness/90 hover-scale font-semibold px-8 py-3"
                  >
                    <Link to="/ai-register">Order Now - €59.99 + €4.99 shipping</Link>
                  </Button>
                )}
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="/lovable-uploads/acfcc77a-7e34-44f5-8487-4069c2acb56b.png" 
                alt="ICE SOS Bluetooth Pendant with smartphone"
                className="w-full max-w-md mx-auto rounded-2xl shadow-xl"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-section bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Emergency Protection Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade safety technology in a compact, wearable design
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover-scale border-primary/20 hover:border-primary/40 transition-colors">
                <feature.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                <p className="text-sm font-medium">{feature.text}</p>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative rounded-2xl overflow-hidden shadow-lg hover-scale">
              <img
                src="/lovable-uploads/eed57ca0-9285-4130-a053-d65b3e140e53.png"
                alt="ICE SOS Pendant packaging"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h3 className="font-semibold mb-2">Complete Package</h3>
                  <p className="text-sm opacity-90">Ready to use out of the box</p>
                </div>
              </div>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-lg hover-scale">
              <img
                src="/lovable-uploads/fc8e5cbc-2145-4857-81a9-17c7795350c1.png"
                alt="ICE SOS Pendant with card"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h3 className="font-semibold mb-2">Premium Design</h3>
                  <p className="text-sm opacity-90">Elegant and discreet</p>
                </div>
              </div>
            </div>
            
            <div className="relative rounded-2xl overflow-hidden shadow-lg hover-scale">
              <img
                src="/lovable-uploads/5c1a45e0-5a70-4691-bc64-550668fe6e0f.png"
                alt="ICE SOS Pendant on lanyard"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h3 className="font-semibold mb-2">Comfortable Wear</h3>
                  <p className="text-sm opacity-90">Daily protection</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Home Integration Section */}
      <section className="py-section bg-gradient-to-br from-guardian/5 to-primary/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Smart Home Integration</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Works with your existing devices - no additional hubs required
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="p-6 text-center hover-scale">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-primary">A</span>
              </div>
              <h3 className="text-lg font-bold mb-3">Amazon Alexa</h3>
              <p className="text-muted-foreground mb-4">
                "Alexa, help help help" triggers emergency alerts
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>✓ Any Alexa device</p>
                <p>✓ Voice activation</p>
                <p>✓ Household alerts</p>
              </div>
            </Card>

            <Card className="p-6 text-center hover-scale">
              <div className="w-16 h-16 mx-auto mb-4 bg-guardian/10 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-guardian">G</span>
              </div>
              <h3 className="text-lg font-bold mb-3">Google Home</h3>
              <p className="text-muted-foreground mb-4">
                "Hey Google, emergency" calls all contacts
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>✓ Google Nest devices</p>
                <p>✓ Multi-room broadcast</p>
                <p>✓ Location sharing</p>
              </div>
            </Card>

            <Card className="p-6 text-center hover-scale">
              <div className="w-16 h-16 mx-auto mb-4 bg-emergency/10 rounded-full flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-emergency" />
              </div>
              <h3 className="text-lg font-bold mb-3">Any Smartphone</h3>
              <p className="text-muted-foreground mb-4">
                iOS/Android compatible
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>✓ iPhone & Android</p>
                <p>✓ Background protection</p>
                <p>✓ Bluetooth connectivity</p>
              </div>
            </Card>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-lg">
            <h3 className="text-xl font-bold text-center mb-6">Simple Setup Process</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">1</div>
                <p className="text-sm">Download app</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-guardian rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">2</div>
                <p className="text-sm">Pair Bluetooth</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-emergency rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">3</div>
                <p className="text-sm">Connect smart home</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-wellness rounded-full flex items-center justify-center text-white font-bold mx-auto mb-3">4</div>
                <p className="text-sm">Test system</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Response Section */}
      <section className="py-section bg-emergency/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Emergency Response System</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One button press calls ALL emergency contacts simultaneously - no delays
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emergency rounded-full flex items-center justify-center text-white font-bold">1</div>
                <div>
                  <h4 className="font-semibold">Press Emergency Button</h4>
                  <p className="text-sm text-muted-foreground">Instant activation via pendant or voice command</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emergency rounded-full flex items-center justify-center text-white font-bold">2</div>
                <div>
                  <h4 className="font-semibold">ALL Contacts Called</h4>
                  <p className="text-sm text-muted-foreground">Simultaneous calls with GPS location sharing</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-emergency rounded-full flex items-center justify-center text-white font-bold">3</div>
                <div>
                  <h4 className="font-semibold">Smart Home Alert</h4>
                  <p className="text-sm text-muted-foreground">Alexa/Google announces emergency</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-wellness rounded-full flex items-center justify-center text-white font-bold">4</div>
                <div>
                  <h4 className="font-semibold">Help Arrives</h4>
                  <p className="text-sm text-muted-foreground">Professional response within 60 seconds</p>
                </div>
              </div>
            </div>

            <div className="relative bg-card rounded-2xl p-8 shadow-lg">
              <div className="text-center">
                <div className="w-20 h-20 bg-emergency rounded-full flex items-center justify-center mx-auto mb-6 pulse">
                  <PhoneCall className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-4">Emergency Triggered</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                    <p className="text-sm">Family</p>
                  </div>
                  <div className="text-center">
                    <Phone className="h-8 w-8 text-guardian mx-auto mb-2" />
                    <p className="text-sm">Friends</p>
                  </div>
                  <div className="text-center">
                    <Shield className="h-8 w-8 text-emergency mx-auto mb-2" />
                    <p className="text-sm">Emergency</p>
                  </div>
                  <div className="text-center">
                    <Globe className="h-8 w-8 text-wellness mx-auto mb-2" />
                    <p className="text-sm">Professional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-section bg-gradient-to-br from-muted/20 to-background">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Customer Stories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">2,847</div>
                <div className="text-xs text-muted-foreground">Emergencies handled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emergency mb-1">98.5%</div>
                <div className="text-xs text-muted-foreground">Satisfaction rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-guardian mb-1">45 sec</div>
                <div className="text-xs text-muted-foreground">Average response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-wellness mb-1">Zero</div>
                <div className="text-xs text-muted-foreground">Missed calls</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover-scale">
              <div className="flex text-yellow-400 mb-3">
                {Array.from({length: 5}).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                "ICE SOS Lite saved my father's life when he fell. All emergency contacts received his GPS location instantly."
              </p>
              <div className="text-xs font-semibold">- Maria S., Barcelona</div>
            </Card>

            <Card className="p-6 hover-scale">
              <div className="flex text-yellow-400 mb-3">
                {Array.from({length: 5}).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                "Had a medical emergency living alone. ICE SOS instantly alerted my daughter and neighbors with my location and medical info."
              </p>
              <div className="text-xs font-semibold">- James K., London</div>
            </Card>

            <Card className="p-6 hover-scale">
              <div className="flex text-yellow-400 mb-3">
                {Array.from({length: 5}).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                "Mother accidentally pressed pendant while gardening. We all got alerts immediately. Great to know it works perfectly."
              </p>
              <div className="text-xs font-semibold">- Anna P., Madrid</div>
            </Card>
          </div>
        </div>
      </section>


      {/* Technical Specifications Section */}
      <section className="py-section">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Technical Specifications</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover-scale">
              <h3 className="text-xl font-bold mb-4 text-primary">Device Specs</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Bluetooth className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">Bluetooth 5.0 LE</p>
                    <p className="text-xs text-muted-foreground">100m range, quick pairing</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Battery className="h-5 w-5 text-guardian" />
                  <div>
                    <p className="font-medium text-sm">More than 7 days battery</p>
                    <p className="text-xs text-muted-foreground">USB-C charging</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Droplets className="h-5 w-5 text-emergency" />
                  <div>
                    <p className="font-medium text-sm">IP67 waterproof</p>
                    <p className="text-xs text-muted-foreground">45×35×12mm, 25g</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover-scale">
              <h3 className="text-xl font-bold mb-4 text-guardian">Medical Data</h3>
              <div className="space-y-2">
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Medical conditions</li>
                  <li>• Current medications</li>
                  <li>• Allergies & alerts</li>
                  <li>• Emergency contacts</li>
                </ul>
                <p className="text-xs text-muted-foreground pt-2">
                  End-to-end encrypted, GDPR compliant
                </p>
              </div>
            </Card>

            <Card className="p-6 hover-scale">
              <h3 className="text-xl font-bold mb-4 text-emergency">Global Coverage</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  EU countries, UK, USA, Canada, Australia, New Zealand
                </p>
                <p className="text-sm text-muted-foreground">
                  12 languages supported
                </p>
                <p className="text-xs text-muted-foreground pt-2">
                  Compatible with any Alexa/Google Home device
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-section bg-gradient-to-br from-muted/20 to-background">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-bold mb-2">What happens when I press SOS?</h3>
              <p className="text-sm text-muted-foreground">Within 3 seconds, your GPS location and medical profile are sent to all emergency contacts via SMS and calls.</p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-2">How fast is the response?</h3>
              <p className="text-sm text-muted-foreground">Emergency contacts receive alerts within 3 seconds. Response time depends on your contacts and local emergency services.</p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-2">What if I accidentally press the button?</h3>
              <p className="text-sm text-muted-foreground">You can cancel false alarms in the app within 30 seconds to notify contacts it was accidental.</p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-2">Does this work internationally?</h3>
              <p className="text-sm text-muted-foreground">Yes, works in EU countries, UK, USA, Canada, Australia, and New Zealand with GPS coordinates.</p>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold mb-2">How much does it cost?</h3>
              <p className="text-sm text-muted-foreground">Bluetooth pendant €59.99 + €4.99 shipping. Premium Protection €4.99/month (optional).</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-section bg-gradient-to-br from-primary/10 to-emergency/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready for Complete Protection?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands who trust ICE SOS Lite for emergency protection
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {comingSoon ? (
              <Badge className="px-6 py-3 text-lg font-semibold bg-secondary text-white">Coming Soon</Badge>
            ) : (
              <>
                <Button size="lg" className="px-8 py-3 font-semibold bg-emergency hover:bg-emergency/90" asChild>
                  <Link to="/ai-register">Order Now - €59.99 + €4.99 shipping</Link>
                </Button>
                <div className="text-sm text-muted-foreground">
                  <Check className="h-4 w-4 inline mr-1 text-green-600" />
                  30-day guarantee • 24/7 support
                </div>
              </>
            )}
          </div>
        </div>
      </section>


      </main>
      <Footer />
    </div>
  );
};

export default DeviceIceSosPendant;