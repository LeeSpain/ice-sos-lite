import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Bluetooth, Battery, Droplets, MapPin } from "lucide-react";
import heroImg from "@/assets/hero-emergency.jpg";

const DeviceIceSosPendant = () => {
  const title = "ICE SOS Bluetooth Pendant – ICE SOS Lite";
  const description = "Hands-free emergency pendant with Bluetooth, waterproof design, and 7-day battery. Works with ICE SOS Lite app.";
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
    image: canonical.replace("/devices/ice-sos-pendant", "/images/ice-sos-pendant.jpg"),
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: "59.99",
      availability: "https://schema.org/InStock",
      url: canonical
    }
  };

  const features = [
    { icon: Bluetooth, text: "Bluetooth 5.0 Low Energy – fast, reliable pairing" },
    { icon: Droplets, text: "IP67 waterproof for everyday wear" },
    { icon: Battery, text: "Up to 7 days battery life per charge" },
    { icon: MapPin, text: "100m range from your phone for flexible movement" }
  ];

  return (
    <main>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <script type="application/ld+json">{JSON.stringify(productJsonLd)}</script>
      </Helmet>

      <header className="bg-gradient-to-b from-background to-background/60">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                ICE SOS Bluetooth Pendant
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-prose">
                A discreet, one-button pendant that instantly activates your emergency plan via the ICE SOS Lite app. Designed for
                reliability, comfort, and peace of mind.
              </p>
              <div className="mt-6 flex gap-3">
                <Button className="px-6" asChild>
                  <Link to="/ai-register">Buy now</Link>
                </Button>
                <Button variant="outline" className="px-6" asChild>
                  <Link to="#how-it-works">How it works</Link>
                </Button>
              </div>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Works with any ICE SOS subscription</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> One-tap SOS activation from a wearable</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Quick pairing, secure connection</li>
              </ul>
            </div>
            <div>
              <img
                src={heroImg}
                alt="ICE SOS Bluetooth Pendant with smartphone showing emergency activation"
                className="w-full rounded-xl shadow-md"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </header>

      <section id="how-it-works" className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold">How it works</h2>
              <ol className="mt-4 space-y-3 text-muted-foreground">
                <li>1. Pair the pendant with your phone via Bluetooth in the ICE SOS Lite app.</li>
                <li>2. Wear it like a pendant, clip, or keyring for easy access.</li>
                <li>3. Press once to trigger SOS. Your emergency contacts are alerted instantly.</li>
                <li>4. Your phone securely shares GPS location and critical info with responders.</li>
              </ol>
              <div className="mt-6">
                <Button asChild>
                  <Link to="/ai-register">Get the pendant</Link>
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

      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Tech specs</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6 text-sm text-muted-foreground">
            <div>
              <p className="font-medium text-foreground">Connectivity</p>
              <p>Bluetooth 5.0 LE, quick pairing</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Battery</p>
              <p>Rechargeable, up to 7 days typical use</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Durability</p>
              <p>IP67 water and dust resistance</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Range</p>
              <p>Up to 100 meters from paired phone</p>
            </div>
            <div>
              <p className="font-medium text-foreground">Compatibility</p>
              <p>Works with ICE SOS Lite app on iOS and Android</p>
            </div>
            <div>
              <p className="font-medium text-foreground">What’s included</p>
              <p>Pendant, charging cable, quick start guide</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
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
              <Button asChild>
                <Link to="/ai-register">Buy now</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default DeviceIceSosPendant;
