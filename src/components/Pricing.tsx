import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, MapPin, Brain, Users, Phone, Download, Smartphone } from "lucide-react";

const Pricing = () => {
  const globalPlans = [
    {
      name: "Personal Contact",
      price: "€1.99",
      period: "/month",
      description: "Essential emergency protection",
      badge: "Global",
      badgeColor: "bg-primary",
      icon: Phone,
      features: [
        "Up to 5 personal emergency contacts",
        "SOS sends SMS + GPS location",
        "Available in every country",
        "Multilingual support",
        "Basic emergency alerts"
      ]
    },
    {
      name: "Guardian Wellness",
      price: "€4.99",
      period: "/month",
      description: "AI-powered health monitoring",
      badge: "Global",
      badgeColor: "bg-guardian",
      icon: Brain,
      features: [
        "AI daily check-ins (voice or screen)",
        "Missed check-in alerts",
        "Wellness reminders (meds, hydration)",
        "Weekly summaries to family",
        "Available globally in local language"
      ]
    },
    {
      name: "Family Sharing",
      price: "€0.99",
      period: "/member/month",
      description: "Connect your loved ones",
      badge: "Global",
      badgeColor: "bg-wellness",
      icon: Users,
      features: [
        "Independent app download",
        "Connect via sharing code",
        "View alerts and SOS events",
        "Guardian reports access",
        "Wellness status visibility"
      ]
    }
  ];

  const regionalPlans = [
    {
      name: "Call Centre",
      price: "€24.99",
      period: "/month",
      description: "Professional emergency response",
      badge: "Spain Only",
      badgeColor: "bg-emergency",
      icon: MapPin,
      features: [
        "24/7 access to ICE Alarm support team",
        "Staff speak English and Spanish",
        "Direct escalation to call center",
        "Professional emergency response",
        "Geofenced to Spain region"
      ]
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Free, Upgrade When Ready
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Download the app for free, then choose the protection level that fits your needs.
          </p>
        </div>

        {/* Free Download Hero Section */}
        <div className="mb-20">
          <Card className="relative border border-border bg-card shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-secondary to-muted"></div>
            <CardHeader className="relative text-center py-16 px-8">
              <Badge className="bg-emergency text-white w-fit mx-auto mb-6 text-sm font-semibold px-4 py-2 shadow-lg">
                FREE TO DOWNLOAD
              </Badge>
              <div className="w-24 h-24 mx-auto mb-8 bg-white shadow-lg rounded-2xl flex items-center justify-center border border-border/20">
                <Smartphone className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Download ICE SOS Lite
              </CardTitle>
              <CardDescription className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Start protecting yourself today with our professional emergency app. 
                Essential SOS features included at no cost.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative px-8 pb-16">
              <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                <div className="text-center p-6 rounded-xl bg-white/50 border border-border/20 shadow-sm">
                  <Check className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Emergency SOS</h4>
                  <p className="text-sm text-muted-foreground">One-tap emergency button with GPS location sharing</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-white/50 border border-border/20 shadow-sm">
                  <Check className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Global Coverage</h4>
                  <p className="text-sm text-muted-foreground">Works worldwide with full multilingual support</p>
                </div>
                <div className="text-center p-6 rounded-xl bg-white/50 border border-border/20 shadow-sm">
                  <Check className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Instant Setup</h4>
                  <p className="text-sm text-muted-foreground">Ready to use in minutes with simple configuration</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Download className="mr-2 h-5 w-5" />
                  Download for iOS
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-lg px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300">
                  <Download className="mr-2 h-5 w-5" />
                  Download for Android
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Plans Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Global Protection Plans
            </h3>
            <p className="text-lg text-muted-foreground">
              Available worldwide with full multilingual support
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {globalPlans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <Card key={index} className="relative border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <CardHeader className="text-center">
                    <Badge className={`${plan.badgeColor} text-white w-fit mx-auto mb-4`}>
                      {plan.badge}
                    </Badge>
                    <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-2">
                          <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={index === 1 ? "default" : "outline"}
                    >
                      Start Free Trial
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Regional Plans Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Regional Services
            </h3>
            <p className="text-lg text-muted-foreground">
              Professional emergency response available in select regions
            </p>
          </div>
          
          <div className="flex justify-center">
            {regionalPlans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <Card key={index} className="relative border-2 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:scale-105 max-w-md">
                  <CardHeader className="text-center">
                    <Badge className={`${plan.badgeColor} text-white w-fit mx-auto mb-4`}>
                      {plan.badge}
                    </Badge>
                    <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-2">
                          <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant="default"
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            All plans include end-to-end encryption, GDPR compliance, and can be cancelled anytime.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;