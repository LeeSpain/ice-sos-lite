import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCog, Heart, Building } from "lucide-react";

export const AccessLevelsSection = () => {
  const accessLevels = [
    {
      type: "Family Members",
      icon: Users,
      description: "Direct family members with full emergency access",
      features: [
        "Instant SOS alerts",
        "Real-time location during emergencies",
        "Family coordination dashboard",
        "Emergency response tools",
        "Two-way emergency communication"
      ],
      color: "primary",
      badge: "Most Common"
    },
    {
      type: "Trusted Friends",
      icon: Heart,
      description: "Close friends who can help in emergency situations",
      features: [
        "Emergency notifications",
        "Location sharing during SOS",
        "Response coordination access",
        "Emergency contact abilities",
        "Support network integration"
      ],
      color: "wellness",
      badge: "Flexible"
    },
    {
      type: "Professional Carers",
      icon: UserCog,
      description: "Healthcare workers, caregivers, or professional services",
      features: [
        "Professional emergency protocols",
        "Medical information access",
        "Care coordination tools",
        "Professional response workflows",
        "Integration with care services"
      ],
      color: "guardian",
      badge: "Professional"
    },
    {
      type: "Regional Services",
      icon: Building,
      description: "Local emergency services and community support",
      features: [
        "Regional emergency integration",
        "Local service coordination",
        "Community response networks",
        "Professional emergency protocols",
        "Regional compliance support"
      ],
      color: "emergency",
      badge: "Advanced"
    }
  ];

  const getCardColors = (color: string) => {
    switch (color) {
      case 'emergency': return 'border-emergency/20 hover:border-emergency/40';
      case 'guardian': return 'border-guardian/20 hover:border-guardian/40';
      case 'wellness': return 'border-wellness/20 hover:border-wellness/40';
      default: return 'border-primary/20 hover:border-primary/40';
    }
  };

  const getBadgeColors = (color: string) => {
    switch (color) {
      case 'emergency': return 'bg-emergency text-emergency-foreground';
      case 'guardian': return 'bg-guardian text-guardian-foreground';
      case 'wellness': return 'bg-wellness text-wellness-foreground';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const getIconColors = (color: string) => {
    switch (color) {
      case 'emergency': return 'text-emergency';
      case 'guardian': return 'text-guardian';
      case 'wellness': return 'text-wellness';
      default: return 'text-primary';
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-guardian/10 rounded-full px-4 py-2 mb-4 border border-guardian/20">
            <UserCog className="h-4 w-4 text-guardian mr-2" />
            <span className="text-sm font-medium text-guardian">Access Levels</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Who Can Access Your Emergency System?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the right access level for different people in your support network. 
            From family members to professional carers, everyone gets the appropriate level of access.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {accessLevels.map((level, index) => {
              const Icon = level.icon;
              return (
                <Card key={index} className={`relative ${getCardColors(level.color)} transition-all duration-300 hover:shadow-lg`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-6 w-6 ${getIconColors(level.color)}`} />
                        <CardTitle className="text-xl">{level.type}</CardTitle>
                      </div>
                      <Badge className={getBadgeColors(level.color)}>
                        {level.badge}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {level.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {level.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${getIconColors(level.color).replace('text-', 'bg-')}`} />
                          <span className="text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
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