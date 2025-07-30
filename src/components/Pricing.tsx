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
          <Card className="relative border-2 border-primary/20 bg-gradient-to-br from-card via-card to-secondary/50 shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-emergency/5"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emergency/10 to-transparent rounded-full blur-3xl"></div>
            
            <CardHeader className="relative text-center py-16 px-8">
              <div className="flex justify-center mb-6">
                <Badge className="bg-gradient-to-r from-emergency to-emergency/80 text-white text-sm font-bold px-6 py-3 shadow-lg border border-emergency/20">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    FREE TO DOWNLOAD
                  </span>
                </Badge>
              </div>
              
              <div className="w-28 h-28 mx-auto mb-8 bg-gradient-to-br from-primary to-primary/80 shadow-2xl rounded-3xl flex items-center justify-center border-4 border-white/20 backdrop-blur-sm">
                <Smartphone className="h-14 w-14 text-white drop-shadow-lg" />
              </div>
              
              <CardTitle className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Download ICE SOS Lite
              </CardTitle>
              <CardDescription className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                Start protecting yourself today with our professional emergency app. 
                <span className="text-primary font-semibold"> Essential SOS features included at no cost.</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="relative px-8 pb-16">
              <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative text-center p-8 rounded-2xl bg-gradient-to-br from-card to-secondary border border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-bold text-lg text-foreground mb-3">Emergency SOS</h4>
                    <p className="text-muted-foreground leading-relaxed">One-tap emergency button with instant GPS location sharing to your contacts</p>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-guardian/20 to-guardian/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative text-center p-8 rounded-2xl bg-gradient-to-br from-card to-secondary border border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-guardian to-guardian/80 rounded-2xl flex items-center justify-center shadow-lg">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-bold text-lg text-foreground mb-3">Global Coverage</h4>
                    <p className="text-muted-foreground leading-relaxed">Works worldwide with full multilingual support in your local language</p>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-wellness/20 to-wellness/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <div className="relative text-center p-8 rounded-2xl bg-gradient-to-br from-card to-secondary border border-border shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-wellness to-wellness/80 rounded-2xl flex items-center justify-center shadow-lg">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="font-bold text-lg text-foreground mb-3">Instant Setup</h4>
                    <p className="text-muted-foreground leading-relaxed">Ready to use in minutes with simple, intuitive configuration</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-lg mx-auto">
                <Button size="lg" className="group relative bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-bold text-lg px-10 py-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  <span className="relative flex items-center gap-3">
                    <Download className="h-5 w-5" />
                    Download for iOS
                  </span>
                </Button>
                <Button size="lg" variant="outline" className="group relative border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold text-lg px-10 py-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 bg-card/50 backdrop-blur-sm">
                  <span className="relative flex items-center gap-3">
                    <Download className="h-5 w-5" />
                    Download for Android
                  </span>
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