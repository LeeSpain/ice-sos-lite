import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, MapPin, Users, Shield, MessageSquare, Timer } from "lucide-react";
import OptimizedImage from "@/components/ui/optimized-image";

export const ServiceBenefitsSection = () => {
  const scenarios = [
    {
      title: "Emergency Alert",
      description: "When dad presses his pendant, everyone gets an instant notification",
      image: "/lovable-uploads/2b0c6909-ca7b-4bb0-a664-1fd4211d6be7.png",
      features: [
        "Instant push notifications",
        "Exact GPS location",
        "Emergency type identification",
        "One-tap response options"
      ]
    },
    {
      title: "Family Coordination",
      description: "Real-time coordination dashboard for emergency response",
      image: "/lovable-uploads/6adce9d3-1bbc-4e72-87d5-d397b11fcab8.png",
      features: [
        "Who's responding tracker",
        "Emergency timeline",
        "Group coordination chat",
        "Emergency services integration"
      ]
    }
  ];

  const benefits = [
    {
      icon: Bell,
      title: "Instant Emergency Alerts",
      description: "Immediate notifications with precise location when SOS is triggered",
      color: "emergency"
    },
    {
      icon: MapPin,
      title: "Emergency-Only Location",
      description: "Location shared only during actual emergencies, never for tracking",
      color: "primary"
    },
    {
      icon: Users,
      title: "Family Coordination",
      description: "Coordinate response with other family members in real-time",
      color: "wellness"
    },
    {
      icon: Shield,
      title: "Privacy Protected",
      description: "No constant monitoring - emergency data only when needed",
      color: "guardian"
    },
    {
      icon: MessageSquare,
      title: "Emergency Communication",
      description: "Secure family chat activated automatically during emergencies",
      color: "primary"
    },
    {
      icon: Timer,
      title: "Response Timeline",
      description: "Track emergency response progress and coordination status",
      color: "wellness"
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

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Emergency Scenarios */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Real Emergency Scenarios
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how our family coordination system works in actual emergency situations.
          </p>
        </div>

        <div className="max-w-6xl mx-auto space-y-20">
          {scenarios.map((scenario, index) => (
            <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
              <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                <h3 className="text-2xl font-bold text-foreground mb-4">{scenario.title}</h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {scenario.description}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {scenario.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <div className="w-2 h-2 bg-wellness rounded-full mr-3" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                <OptimizedImage 
                  src={scenario.image}
                  alt={`${scenario.title} demonstration`}
                  className="w-full rounded-2xl shadow-lg"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Service Benefits */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Complete Emergency Coordination
            </h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-6 w-6 ${getIconColor(benefit.color)}`} />
                      <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};