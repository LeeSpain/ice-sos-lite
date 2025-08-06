import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Shield, Brain, Users, MapPin, MessageCircle } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Phone,
      title: "24/7 Emergency Response",
      description: "One-tap SOS activation with instant GPS location sharing to emergency contacts and professional call center.",
      color: "emergency"
    },
    {
      icon: Brain,
      title: "AI Health Monitoring",
      description: "Intelligent wellness tracking with Premium Protection plan including AI-powered health insights.",
      color: "guardian"
    },
    {
      icon: Shield,
      title: "Global Call Center Access",
      description: "Professional emergency response coordination available 24/7 with multilingual support worldwide.",
      color: "primary"
    },
    {
      icon: Users,
      title: "Family Emergency Alerts",
      description: "Instant SOS notifications to up to 5 emergency contacts with Family Connection and Premium plans.",
      color: "wellness"
    },
    {
      icon: MapPin,
      title: "GPS Location Tracking",
      description: "Real-time location sharing during emergencies with precise coordinates sent to responders.",
      color: "primary"
    },
    {
      icon: MessageCircle,
      title: "Bluetooth Device Support",
      description: "Compatible with ICE SOS Bluetooth Pendant for hands-free emergency activation up to 100m range.",
      color: "guardian"
    }
  ];

  const getIconColor = (color: string) => {
    switch (color) {
      case 'emergency': return 'text-emergency';
      case 'guardian': return 'text-guardian';
      case 'wellness': return 'text-wellness';
      default: return 'text-primary';
    }
  };

  const getCardBorder = (color: string) => {
    switch (color) {
      case 'emergency': return 'border-emergency/20 hover:border-emergency/40';
      case 'guardian': return 'border-guardian/20 hover:border-guardian/40';
      case 'wellness': return 'border-wellness/20 hover:border-wellness/40';
      default: return 'border-primary/20 hover:border-primary/40';
    }
  };

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
            Complete Emergency Protection Suite
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Professional emergency protection with global call center access, Bluetooth device support, 
            and AI monitoring — starting from €1.99/month with worldwide coverage.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className={`border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${getCardBorder(feature.color)}`}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 ${getIconColor(feature.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;