import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Mail, Smartphone, CircleCheck } from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      step: "1",
      title: "Send Invitation",
      description: "From your dashboard, enter family member's email and send a secure invitation.",
      icon: Send,
      color: "primary"
    },
    {
      step: "2", 
      title: "They Join",
      description: "Family member receives email, creates account, and downloads the mobile app.",
      icon: Mail,
      color: "wellness"
    },
    {
      step: "3",
      title: "App Setup",
      description: "Simple mobile app setup with emergency permissions and notification settings.",
      icon: Smartphone,
      color: "guardian"
    },
    {
      step: "4",
      title: "Connected",
      description: "They now receive your SOS alerts instantly with your location during emergencies.",
      icon: CircleCheck,
      color: "emergency"
    }
  ];

  const getStepColors = (color: string) => {
    switch (color) {
      case 'emergency': return 'bg-emergency text-emergency-foreground';
      case 'guardian': return 'bg-guardian text-guardian-foreground';
      case 'wellness': return 'bg-wellness text-wellness-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mb-4 border border-primary/20">
            <CircleCheck className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-medium text-primary">Simple 3-Step Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How Family Coordination Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Set up your family emergency network in minutes. No complex configurations or technical setup required.
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Card key={index} className="relative border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 rounded-xl ${getStepColors(step.color)} flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </div>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
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