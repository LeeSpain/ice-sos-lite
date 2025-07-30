import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Shield, Brain, Users, MapPin, MessageCircle } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Phone,
      title: "Emergency SOS System",
      description: "Tap-to-send SOS, voice trigger ('Help' x3), smart speaker integration with failsafe escalation.",
      color: "emergency"
    },
    {
      icon: Brain,
      title: "Guardian AI Assistant",
      description: "24/7 multilingual AI responding in local language, handling check-ins and smart escalation.",
      color: "guardian"
    },
    {
      icon: Shield,
      title: "Smart Protection",
      description: "Real-time wellness tracking, medication reminders, and appointment notifications.",
      color: "primary"
    },
    {
      icon: Users,
      title: "Family Connectivity",
      description: "Connect family via sharing codes, receive SOS alerts, and access shared health notes.",
      color: "wellness"
    },
    {
      icon: MapPin,
      title: "GPS Location Sharing",
      description: "Instant location sharing to call center or emergency contacts during SOS events.",
      color: "primary"
    },
    {
      icon: MessageCircle,
      title: "Voice Interaction",
      description: "Voice-to-text input, smart speaker support, and direct video calls to contacts.",
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Complete Emergency Protection Suite
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced safety features designed for seniors, caregivers, and solo users 
            with multilingual support and global availability.
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