import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Heart, Shield, Clock, ExternalLink, UserCheck, CheckCircle } from 'lucide-react';
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const FamilyCarerAccess = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: UserCheck,
      title: "Trusted Contacts",
      description: "Add family members and carers as emergency contacts with priority access levels",
      color: "primary"
    },
    {
      icon: Heart,
      title: "Care Coordination",
      description: "Seamless coordination between family members during emergencies",
      color: "wellness"
    },
    {
      icon: Shield,
      title: "Privacy Controls",
      description: "Granular privacy settings to control what information is shared with whom",
      color: "guardian"
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Instant notifications and status updates for all authorized contacts",
      color: "emergency"
    }
  ];

  const benefits = [
    "Multi-generational family support",
    "Professional carer integration",
    "Emergency contact hierarchy",
    "Location sharing permissions",
    "Medical information access",
    "Communication preferences",
    "Care plan coordination",
    "Emergency response tracking"
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
    <section className="py-20 bg-gradient-to-b from-wellness/5 to-wellness/10 dark:from-wellness/10 dark:to-wellness/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-wellness/10 rounded-full px-4 py-2 mb-4 border border-wellness/20">
            <div className="w-2 h-2 bg-wellness rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium text-wellness">Family & Carer Support</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
            Family & Carer Access
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Connect your loved ones and care providers for comprehensive emergency support and peace of mind
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="relative border-2 border-wellness/20 bg-white dark:bg-slate-800 shadow-xl overflow-hidden max-w-4xl mx-auto">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-wellness to-wellness/60"></div>
          
          <CardContent className="p-6 md:p-8">
            {/* Split Layout */}
            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* Left Side - Main Info */}
              <div className="text-center md:text-left">
                <div className="w-14 h-14 bg-gradient-to-br from-wellness to-wellness/80 shadow-lg rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-4">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">
                  Complete Family Protection
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Enable trusted family members and professional carers to access your emergency profile, receive instant alerts, and coordinate rapid response during critical situations.
                </p>
                
                {/* CTA Button */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" className="bg-gradient-to-r from-wellness to-wellness/80 hover:from-wellness/90 hover:to-wellness/70 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                      <Users className="mr-2 h-4 w-4" />
                      Learn More
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-center mb-4">Family & Carer Access</DialogTitle>
                      <DialogDescription className="text-center text-lg text-muted-foreground">
                        Comprehensive emergency support through trusted connections
                      </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="overview" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="features">Features</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-6 bg-muted/50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3 text-foreground">For Families</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              <li>• Receive instant emergency alerts</li>
                              <li>• Access medical information when needed</li>
                              <li>• Coordinate response with other family members</li>
                              <li>• Real-time location sharing during emergencies</li>
                              <li>• Secure messaging and communication</li>
                            </ul>
                          </div>
                          
                          <div className="p-6 bg-muted/50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-3 text-foreground">For Professional Carers</h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              <li>• Access authorized emergency protocols</li>
                              <li>• View relevant medical history</li>
                              <li>• Communicate with emergency services</li>
                              <li>• Track incident progress and resolution</li>
                              <li>• Professional liability protection</li>
                            </ul>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="features" className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                              <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                                <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${getIconColor(feature.color)}`}>
                                  <Icon className="h-5 w-5" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm">{feature.title}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </TabsContent>

                      <TabsContent value="details" className="space-y-4">
                        <div className="text-center p-8">
                          <h3 className="text-xl font-semibold mb-4">Ready to Get Started?</h3>
                          <p className="text-muted-foreground mb-6">
                            Learn more about our comprehensive Family & Carer Access features and how they can protect your loved ones.
                          </p>
                          <Button asChild className="bg-wellness hover:bg-wellness/90">
                            <a href="/family-carer-access" target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Visit Full Page
                            </a>
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                <p className="text-xs text-muted-foreground mt-2">
                  Secure access control • Privacy protected
                </p>
              </div>

              {/* Right Side - Features Grid */}
              <div className="grid grid-cols-1 gap-4">
                {features.slice(0, 3).map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-wellness/5 border border-wellness/10">
                      <div className={`w-10 h-10 bg-gradient-to-br from-wellness to-wellness/80 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-foreground">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
            <Heart className="h-4 w-4 text-wellness" />
            <span className="text-sm text-muted-foreground">
              Connecting families for stronger emergency response
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FamilyCarerAccess;