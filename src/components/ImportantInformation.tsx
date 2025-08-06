import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, AlertTriangle, Shield, Clock, Globe, Smartphone } from "lucide-react";

const ImportantInformation = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Important Information
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Essential details about our emergency protection services and how they work
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Emergency Response */}
          <Card className="border-2 border-emergency/20 hover:border-emergency/40 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-emergency/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-emergency" />
              </div>
              <CardTitle className="text-xl font-semibold">Emergency Response</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed space-y-3">
                <p>Our professional call center operates 24/7 with trained emergency operators.</p>
                <p>Response times vary by location and emergency type. We coordinate with local emergency services when needed.</p>
                <Badge variant="outline" className="text-emergency border-emergency/40 mt-2">
                  Professional Support
                </Badge>
              </CardDescription>
            </CardContent>
          </Card>

          {/* Service Availability */}
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl font-semibold">Global Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed space-y-3">
                <p>ICE SOS Lite works worldwide with multilingual support in major languages.</p>
                <p>Regional call centers provide local language support and emergency coordination.</p>
                <Badge variant="outline" className="text-primary border-primary/40 mt-2">
                  Worldwide Available
                </Badge>
              </CardDescription>
            </CardContent>
          </Card>

          {/* Technical Requirements */}
          <Card className="border-2 border-guardian/20 hover:border-guardian/40 transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-guardian/10 flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-guardian" />
              </div>
              <CardTitle className="text-xl font-semibold">Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed space-y-3">
                <p>Requires smartphone with internet connection (WiFi or mobile data).</p>
                <p>GPS location services must be enabled for emergency location sharing.</p>
                <Badge variant="outline" className="text-guardian border-guardian/40 mt-2">
                  Smartphone Required
                </Badge>
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Important Notices */}
        <div className="mt-12 space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-base">
              <strong>Service Notice:</strong> ICE SOS Lite is designed to complement, not replace, traditional emergency services. 
              In life-threatening situations, always call your local emergency number (911, 112, etc.) first.
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-base">
              <strong>Subscription Terms:</strong> All subscriptions auto-renew monthly. You can cancel anytime through your account settings or the Stripe customer portal. 
              No long-term contracts required.
            </AlertDescription>
          </Alert>

          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-base">
              <strong>Activation Time:</strong> Premium features activate immediately upon successful subscription payment. 
              Family connections can be set up instantly through the mobile app.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </section>
  );
};

export default ImportantInformation;