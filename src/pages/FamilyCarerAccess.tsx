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
      <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-hero">
        <div className="container mx-auto px-4 text-center text-white">
          <Badge className="mb-6 bg-wellness text-white px-4 py-2">
            <Users className="mr-2 h-4 w-4" />
            Family & Carer Support
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Family & Carer <span className="text-wellness-glow">Access</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
            Connect your loved ones and care providers for comprehensive emergency support and peace of mind
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-wellness hover:bg-wellness/90">
                <UserPlus className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            </Link>
            <Link to="/">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
              Key Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to create a comprehensive support network for emergencies and everyday care
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {keyFeatures.map((feature, index) => {
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

      {/* Access Levels Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Access Levels</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Customize access permissions for different types of contacts based on their role in your care network
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {accessLevels.map((level, index) => (
              <Card key={index} className="border-2 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{level.level}</CardTitle>
                  </div>
                  <CardDescription>{level.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {level.permissions.map((permission, permIndex) => (
                      <div key={permIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-primary" />
                        <span className="text-sm">{permission}</span>
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
      <section className="py-20 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Use Cases</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how Family & Carer Access can benefit different types of care situations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <Card key={index} className="border-2 hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-wellness/20 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-wellness" />
                      </div>
                      <CardTitle className="text-xl">{useCase.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
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
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Connect Your Care Network?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start building your comprehensive support system today with Family & Carer Access
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-wellness hover:bg-wellness/90">
                <UserPlus className="mr-2 h-5 w-5" />
                Get Started Now
              </Button>
            </Link>
            <Link to="/#pricing">
              <Button size="lg" variant="outline">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FamilyCarerAccessPage;