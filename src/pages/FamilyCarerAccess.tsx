import React from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Heart, 
  Shield, 
  UserCheck, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  UserPlus,
  Bell,
  Send,
  AlertTriangle,
  Euro,
  CreditCard,
  Play,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import OptimizedImage from "@/components/ui/optimized-image";
import { getImageSizes, generateBlurPlaceholder } from "@/utils/imageOptimization";
import { usePreferences } from '@/contexts/PreferencesContext';
import { convertCurrency, formatDisplayCurrency, languageToLocale } from '@/utils/currency';

const FamilyCarerAccessPage = () => {
  const { t } = useTranslation();
  const { currency, language } = usePreferences();
  
  // Accurate pricing from our family access system
  const memberPlanPrice = convertCurrency(9.99, 'EUR', currency);
  const familySeatPrice = convertCurrency(2.99, 'EUR', currency);
  const formattedMemberPrice = formatDisplayCurrency(memberPlanPrice, currency, languageToLocale(language));
  const formattedSeatPrice = formatDisplayCurrency(familySeatPrice, currency, languageToLocale(language));

  // Actual features we offer
  const actualFeatures = [
    {
      icon: Bell,
      title: "Instant SOS Alerts",
      description: "Family members receive immediate notifications when you trigger an SOS emergency with your location and situation details.",
      color: "emergency"
    },
    {
      icon: MapPin,
      title: "Emergency Location Sharing",
      description: "Your exact location is shared with family ONLY during active SOS emergencies - complete privacy otherwise.",
      color: "primary"
    },
    {
      icon: UserCheck,
      title: "'Received & On It' System",
      description: "Family members can acknowledge they've received your SOS and are responding, coordinating help effectively.",
      color: "wellness"
    },
    {
      icon: Shield,
      title: "Privacy-First Design",
      description: "No location tracking, device monitoring, or activity sharing. Family access is limited to SOS emergencies only.",
      color: "guardian"
    }
  ];

  // Clean process flow without pricing details
  const howItWorks = [
    {
      step: "1",
      title: "Join ICE SOS",
      description: "Sign up for your ICE SOS emergency system and set up your personal safety profile.",
      icon: UserPlus,
      color: "primary"
    },
    {
      step: "2", 
      title: "Add Family Members",
      description: "Invite your family members from your dashboard to join your emergency network.",
      icon: Users,
      color: "wellness"
    },
    {
      step: "3",
      title: "Family Accepts Invites", 
      description: "Family members receive secure invitations and join your emergency coordination system.",
      icon: Send,
      color: "guardian"
    },
    {
      step: "4",
      title: "Emergency Coordination",
      description: "When you trigger SOS, family instantly receives alerts with your location and can coordinate response.",
      icon: AlertTriangle,
      color: "emergency"
    }
  ];

  // Real benefits, not overstated claims
  const realBenefits = [
    "Family knows immediately when you're in trouble",
    "Your exact emergency location shared instantly", 
    "Coordinate who's responding to avoid confusion",
    "Complete privacy - no tracking outside emergencies",
    "Simple €2.99/month per family member",
    "Max 5 family members per account"
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
        title="Family Emergency Access - ICE SOS Lite"
        description="Connect your family to your emergency system. Get instant SOS alerts with location sharing during emergencies only. Privacy-first family coordination."
      />
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-hero shadow-2xl">
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left text-white animate-fade-in">
              <div className="inline-flex items-center space-x-2 bg-emergency/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg border border-emergency/30">
                <Users className="h-4 w-4 text-emergency-glow" />
                <span className="text-sm font-medium text-white">Family Emergency Access</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                Connect Your <span className="text-wellness drop-shadow-md">Family</span> to Your Emergency System
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl lg:max-w-none mx-auto mb-8 leading-relaxed font-medium drop-shadow-sm">
                Give your family instant access to your emergency alerts with location sharing during SOS events only. Complete privacy with emergency coordination when it matters most.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Button 
                  asChild 
                  size="xl" 
                  className="bg-wellness text-black hover:bg-wellness/90 shadow-glow hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg px-8 py-4 rounded-xl border-2 border-wellness/20"
                >
                  <Link to="/ai-register">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Join ICE SOS
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative animate-scale-in">
              <div className="relative z-10">
                <OptimizedImage 
                  src="/lovable-uploads/0365334e-7587-4cf4-96a6-5744399b84b2.png" 
                  alt="Family emergency coordination system showing real-time alerts and location sharing"
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

      {/* What You Actually Get */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mb-4 border border-primary/20">
              <CheckCircle className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">What You Actually Get</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Emergency Family Coordination
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Simple, privacy-first emergency alerts that keep your family informed when you need help most.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {actualFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className={`group border-2 transition-all duration-300 hover:shadow-lg ${getCardBorder(feature.color)} bg-white dark:bg-slate-800`}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color === 'emergency' ? 'from-emergency to-emergency/80' : feature.color === 'guardian' ? 'from-guardian to-guardian/80' : feature.color === 'wellness' ? 'from-wellness to-wellness/80' : 'from-primary to-primary/80'} shadow-lg flex items-center justify-center mb-4`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-foreground">{feature.title}</CardTitle>
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

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-muted/20 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-wellness/10 rounded-full px-6 py-3 mb-6 border border-wellness/20 shadow-sm">
              <Play className="h-5 w-5 text-wellness mr-3" />
              <span className="text-base font-semibold text-wellness">Simple Setup Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              How Family Access <span className="text-wellness">Works</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Connect your family to your emergency system in four simple steps. Privacy-first design ensures family access only during actual emergencies.
            </p>
          </div>
          
          <div className="relative pt-8">
            {/* Process Flow Line */}
            <div className="hidden lg:block absolute top-32 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-primary via-wellness to-emergency opacity-30"></div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 mt-4">
              {howItWorks.map((step, index) => {
                const Icon = step.icon;
                const colorClass = step.color === 'emergency' ? 'from-emergency to-emergency/80' : 
                                 step.color === 'guardian' ? 'from-guardian to-guardian/80' : 
                                 step.color === 'wellness' ? 'from-wellness to-wellness/80' : 
                                 'from-primary to-primary/80';
                const textColor = step.color === 'emergency' ? 'text-emergency' : 
                                step.color === 'guardian' ? 'text-guardian' : 
                                step.color === 'wellness' ? 'text-wellness' : 
                                'text-primary';
                
                return (
                  <div key={index} className="relative group mt-8">
                    <Card className="relative border-2 border-muted/20 hover:border-wellness/30 transition-all duration-500 hover:shadow-xl bg-white dark:bg-slate-800 group-hover:scale-105 overflow-visible">
                      {/* Step Number Circle */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20">
                        <div className={`w-12 h-12 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-4 border-background group-hover:scale-110 transition-transform duration-300`}>
                          {step.step}
                        </div>
                      </div>
                      
                      <CardHeader className="pt-12 pb-4">
                        <div className="flex justify-center mb-4">
                          <div className={`w-16 h-16 bg-gradient-to-br ${colorClass} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                            <Icon className="h-8 w-8 text-white" />
                          </div>
                        </div>
                        <CardTitle className={`text-xl font-bold text-center ${textColor} group-hover:scale-105 transition-transform duration-300`}>
                          {step.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center pb-8">
                        <CardDescription className="text-base leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                          {step.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-warning/10 rounded-full px-4 py-2 mb-4 border border-warning/20">
              <Euro className="h-4 w-4 text-warning mr-2" />
              <span className="text-sm font-medium text-warning">Simple Pricing</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Family Access Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transparent pricing with no hidden fees. Add family members to your emergency system for just {formattedSeatPrice} per month each.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Member Plan */}
            <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">Member Plan</CardTitle>
                <div className="text-3xl font-bold text-primary">{formattedMemberPrice}<span className="text-base font-normal text-muted-foreground">/month</span></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {["5 emergency call-only contacts", "SOS emergency system", "Location sharing during SOS", "Emergency services integration", "Basic family coordination"].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                  <Link to="/ai-register">Get Member Plan</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Family Seats */}
            <Card className="border-2 border-warning/20 hover:border-warning/40 transition-all duration-300 bg-white dark:bg-slate-800">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-warning to-warning/80 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">Family Access Seats</CardTitle>
                <div className="text-3xl font-bold text-warning">{formattedSeatPrice}<span className="text-base font-normal text-muted-foreground">/month per seat</span></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {["Instant SOS alert notifications", "Live emergency location access", "'Received & On It' responses", "Emergency coordination tools", "Max 5 family members", "Owner or invitee pays option"].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-warning" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                <Button asChild variant="outline" className="w-full border-warning text-warning hover:bg-warning hover:text-white">
                  <Link to="/ai-register">Join ICE SOS</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Summary */}
      <section className="py-20 bg-gradient-to-br from-emergency/5 via-primary/5 to-wellness/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-emergency/10 rounded-full px-4 py-2 mb-6 border border-emergency/20">
              <Heart className="h-4 w-4 text-emergency mr-2" />
              <span className="text-sm font-medium text-emergency">Peace of Mind for Everyone</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              What Your Family Gets
            </h2>
            <div className="grid md:grid-cols-2 gap-4 mb-12">
              {realBenefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 text-left">
                  <Check className="h-5 w-5 text-emergency flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild
                size="lg" 
                className="bg-emergency text-white hover:bg-emergency/90 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                <Link to="/ai-register">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Join ICE SOS
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