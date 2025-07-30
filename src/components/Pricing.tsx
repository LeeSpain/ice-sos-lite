import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, MapPin, Brain, Users, Phone } from "lucide-react";

const Pricing = () => {
  const plans = [
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
      badge: "Popular",
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
    },
    {
      name: "Family Sharing",
      price: "€0.99",
      period: "/member/month",
      description: "Connect your loved ones",
      badge: "Add-on",
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

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Protection Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Flexible subscription options designed for different needs and budgets. 
            Start with basic protection and upgrade as needed.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => {
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
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            );
          })}
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