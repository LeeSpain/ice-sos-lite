import React from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Heart, 
  Shield, 
  UserCheck, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  UserPlus,
  Settings,
  Bell,
  Lock,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import SEO from '@/components/SEO';
import OptimizedImage from "@/components/ui/optimized-image";
import { getImageSizes, generateBlurPlaceholder } from "@/utils/imageOptimization";

const FamilyCarerAccessPage = () => {
  const keyFeatures = [
    {
      icon: UserCheck,
      title: "Trusted Contact Management",
      description: "Add and manage family members, friends, and professional carers with customizable access levels and permissions.",
      color: "primary"
    },
    {
      icon: Heart,
      title: "Care Coordination Hub",
      description: "Centralized platform for coordinating care between multiple family members and healthcare providers.",
      color: "wellness"
    },
    {
      icon: Shield,
      title: "Advanced Privacy Controls",
      description: "Granular privacy settings allow you to control exactly what information each contact can access.",
      color: "guardian"
    },
    {
      icon: Clock,
      title: "Real-time Communication",
      description: "Instant notifications and updates keep everyone in the loop during emergencies and routine care.",
      color: "emergency"
    },
    {
      icon: MapPin,
      title: "Location Sharing",
      description: "Share your location with trusted contacts during emergencies or when requested by authorized carers.",
      color: "primary"
    },
    {
      icon: Activity,
      title: "Care Activity Tracking",
      description: "Monitor and track care activities, medication schedules, and health status updates.",
      color: "wellness"
    }
  ];

  const accessLevels = [
    {
      level: "Emergency Only",
      description: "Basic contact information and emergency alerts",
      permissions: ["Emergency notifications", "Basic profile information", "Emergency contact details"]
    },
    {
      level: "Family Member",
      description: "Extended family access with care coordination",
      permissions: ["All emergency features", "Location sharing", "Care plan access", "Medical information", "Activity updates"]
    },
    {
      level: "Primary Carer",
      description: "Full care coordination and management access",
      permissions: ["Complete profile access", "Care plan management", "Emergency response coordination", "Medical record access", "Communication hub"]
    }
  ];

  const useCases = [
    {
      title: "Multi-Generational Families",
      description: "Connect grandparents, parents, and adult children with appropriate access levels for each generation.",
      icon: Users
    },
    {
      title: "Professional Care Teams",
      description: "Integrate home care workers, nurses, and healthcare providers into your emergency response network.",
      icon: UserPlus
    },
    {
      title: "Emergency Response",
      description: "Ensure rapid response during emergencies with automatic notifications to all authorized contacts.",
      icon: Phone
    },
    {
      title: "Routine Care Management",
      description: "Coordinate daily care activities, medication reminders, and health monitoring.",
      icon: Activity
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
    <div className="min-h-screen">
      <SEO 
        title="Family & Carer Access - ICE SOS Lite"
        description="Connect your loved ones and care providers for comprehensive emergency support. Multi-generational family support with professional carer integration."
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-hero shadow-2xl">
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left text-white animate-fade-in">
              <div className="inline-flex items-center space-x-2 bg-wellness/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg border border-wellness/30">
                <Heart className="h-4 w-4 text-wellness-glow animate-pulse" />
                <span className="text-sm font-medium text-wellness-glow">Family Connection Platform</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                Connect Your <span className="text-wellness-glow drop-shadow-md">Loved Ones</span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl lg:max-w-none mx-auto mb-8 leading-relaxed font-medium drop-shadow-sm">
                Build a comprehensive support network that keeps your family connected and protected during emergencies and everyday care moments
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Button 
                  asChild 
                  size="xl" 
                  className="bg-wellness text-black hover:bg-wellness/90 shadow-glow hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg px-8 py-4 rounded-xl border-2 border-wellness-glow/20"
                >
                  <Link to="/register">
                    <UserPlus className="mr-2 h-5 w-5" />
                    <span className="text-wellness-glow font-bold">Start Connecting</span>
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative animate-scale-in">
              <div className="relative z-10">
                <OptimizedImage 
                  src="/lovable-uploads/0365334e-7587-4cf4-96a6-5744399b84b2.png" 
                  alt="Family using ICE SOS for emergency coordination and care support"
                  className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl hover-scale"
                  priority={true}
                  sizes={getImageSizes('hero')}
                  blurDataURL={generateBlurPlaceholder(400, 600)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-gradient-to-b from-wellness/5 to-wellness/10 dark:from-wellness/10 dark:to-wellness/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center bg-wellness/10 rounded-full px-4 py-2 mb-4 border border-wellness/20">
              <div className="w-2 h-2 bg-wellness rounded-full mr-2 animate-pulse"></div>
              <span className="text-sm font-medium text-wellness">Comprehensive Care Network</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything Your Family Needs
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Advanced features designed to create the strongest possible support network for your loved ones
            </p>
          </div>
          
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {keyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className={`group border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${getCardBorder(feature.color)} bg-white dark:bg-slate-800 hover:bg-gradient-to-br hover:from-white hover:to-wellness/5 dark:hover:from-slate-800 dark:hover:to-wellness/10 animate-fade-in`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-wellness to-wellness/80 shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground group-hover:text-wellness transition-colors duration-300">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Access Levels Section */}
      <section className="py-20 bg-gradient-to-b from-background to-wellness/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center bg-guardian/10 rounded-full px-4 py-2 mb-4 border border-guardian/20">
              <Shield className="h-4 w-4 text-guardian mr-2" />
              <span className="text-sm font-medium text-guardian">Secure Access Management</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Customized Access Levels
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Grant the right level of access to each person in your care network, from emergency-only contacts to full care coordinators
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {accessLevels.map((level, index) => (
              <Card 
                key={index} 
                className={`group border-2 hover:shadow-xl transition-all duration-500 animate-fade-in bg-white dark:bg-slate-800 hover:bg-gradient-to-br hover:from-white hover:to-guardian/5 dark:hover:from-slate-800 dark:hover:to-guardian/10 ${index === 1 ? 'border-wellness/40 ring-2 ring-wellness/20' : 'border-guardian/20 hover:border-guardian/40'}`}
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl ${index === 1 ? 'bg-gradient-to-br from-wellness to-wellness/80' : 'bg-gradient-to-br from-guardian to-guardian/80'} shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className={`text-xl font-bold ${index === 1 ? 'text-wellness' : 'text-guardian'} group-hover:scale-105 transition-transform duration-300`}>
                      {level.level}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-base text-muted-foreground">{level.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {level.permissions.map((permission, permIndex) => (
                      <div key={permIndex} className="flex items-center gap-3 group-hover:translate-x-1 transition-transform duration-300" style={{transitionDelay: `${permIndex * 50}ms`}}>
                        <CheckCircle className={`h-5 w-5 ${index === 1 ? 'text-wellness' : 'text-guardian'}`} />
                        <span className="text-sm font-medium text-foreground">{permission}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gradient-to-b from-wellness/5 via-wellness/10 to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mb-4 border border-primary/20">
              <Activity className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Real-World Applications</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Perfect for Every Care Situation
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From multi-generational families to professional care teams, see how our platform adapts to your unique needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <Card 
                  key={index} 
                  className="group border-2 hover:shadow-2xl transition-all duration-500 animate-fade-in bg-white dark:bg-slate-800 hover:bg-gradient-to-br hover:from-white hover:to-primary/5 dark:hover:from-slate-800 dark:hover:to-primary/10 border-primary/20 hover:border-primary/40"
                  style={{animationDelay: `${index * 0.15}s`}}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        {useCase.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                      {useCase.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-wellness/10 via-wellness/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-wellness/5 to-transparent opacity-50"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in">
            <div className="inline-flex items-center bg-wellness/10 rounded-full px-6 py-3 mb-6 border border-wellness/20 shadow-lg">
              <Heart className="h-5 w-5 text-wellness mr-2 animate-pulse" />
              <span className="text-base font-semibold text-wellness">Ready to Connect Your Family?</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Start Building Your <span className="text-wellness">Care Network</span> Today
            </h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of families who trust ICE SOS to keep their loved ones connected, protected, and cared for
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                asChild
                size="xl" 
                className="bg-wellness text-black hover:bg-wellness/90 shadow-glow hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold text-lg px-10 py-5 rounded-2xl border-2 border-wellness-glow/20"
              >
                <Link to="/register">
                  <UserPlus className="mr-3 h-6 w-6" />
                  Start Your Family Network
                </Link>
              </Button>
              <Button 
                asChild
                size="xl" 
                variant="outline" 
                className="border-2 border-wellness text-wellness hover:bg-wellness hover:text-black shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-bold text-lg px-10 py-5 rounded-2xl"
              >
                <Link to="/#pricing">
                  <Shield className="mr-3 h-6 w-6" />
                  View Pricing Plans
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FamilyCarerAccessPage;