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
  Check,
  Mail,
  MessageSquare,
  Eye,
  EyeOff,
  Timer,
  CircleCheck,
  Smartphone,
  Lock,
  Server,
  Key,
  Database,
  Star,
  Quote,
  Video,
  FileText,
  Settings,
  UserCog,
  BellRing,
  Zap,
  HandHeart
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import OptimizedImage from "@/components/ui/optimized-image";
import { getImageSizes, generateBlurPlaceholder } from "@/utils/imageOptimization";
import { usePreferences } from '@/contexts/PreferencesContext';
import { convertCurrency, formatDisplayCurrency, languageToLocale } from '@/utils/currency';
import { IntroVideoModal } from '@/components/IntroVideoModal';

const FamilyCarerAccessPage = () => {
  const { t } = useTranslation();
  const { currency, language } = usePreferences();
  
  // Accurate pricing from our family access system
  const memberPlanPrice = convertCurrency(9.99, 'EUR', currency);
  const familySeatPrice = convertCurrency(2.99, 'EUR', currency);
  const formattedMemberPrice = formatDisplayCurrency(memberPlanPrice, currency, languageToLocale(language));
  const formattedSeatPrice = formatDisplayCurrency(familySeatPrice, currency, languageToLocale(language));

  // Core Family Features
  const familyFeatures = [
    {
      icon: Bell,
      title: "Instant SOS Emergency Alerts",
      description: "Get immediate push notifications when a family member triggers SOS with their exact location, emergency type, and current status.",
      color: "emergency"
    },
    {
      icon: MapPin,
      title: "Real-Time Emergency Location",
      description: "Access precise GPS coordinates and live location tracking during emergencies only. No constant monitoring - privacy first.",
      color: "primary"
    },
    {
      icon: UserCheck,
      title: "'Received & On It' Response System",
      description: "Acknowledge emergency alerts and let other family members know you're responding to coordinate help effectively.",
      color: "wellness"
    },
    {
      icon: Phone,
      title: "Emergency Call Coordination",
      description: "Automated call sequences to emergency contacts with intelligent routing and escalation if no response.",
      color: "guardian"
    },
    {
      icon: MessageSquare,
      title: "Family Emergency Chat",
      description: "Secure emergency group chat activated during SOS events for real-time coordination between family members.",
      color: "primary"
    },
    {
      icon: Timer,
      title: "Emergency Timeline & Status",
      description: "Live updates on emergency response progress, who's been contacted, and current resolution status.",
      color: "wellness"
    }
  ];

  // Simple invitation process flow
  const invitationProcess = [
    {
      step: "1",
      title: "Owner Sends Invite",
      description: "From your dashboard, enter family member's email and send a secure invitation link.",
      icon: Send,
      color: "primary"
    },
    {
      step: "2", 
      title: "Member Receives Email",
      description: "Family member gets invitation email with secure registration link and clear setup instructions.",
      icon: Mail,
      color: "wellness"
    },
    {
      step: "3",
      title: "Login & Download App", 
      description: "They log into their dashboard and download the family mobile app for emergency coordination.",
      icon: Smartphone,
      color: "guardian"
    },
    {
      step: "4",
      title: "Live Family Access",
      description: "Instant connection established - they now receive your SOS alerts and can coordinate emergency response.",
      icon: CircleCheck,
      color: "emergency"
    }
  ];

  // Family Member Experience
  const memberExperience = [
    {
      icon: Smartphone,
      title: "Mobile Emergency Dashboard",
      description: "Clean, intuitive mobile interface showing family emergency status, active alerts, and response coordination.",
      benefit: "Easy emergency response from any device"
    },
    {
      icon: BellRing,
      title: "Smart Emergency Notifications",
      description: "Intelligent alert system with location-aware notifications and escalation based on emergency severity.",
      benefit: "Never miss critical family emergencies"
    },
    {
      icon: HandHeart,
      title: "One-Touch Response Actions",
      description: "Simple 'Received & On It' buttons, call emergency services, or coordinate with other family members instantly.",
      benefit: "Respond to emergencies in seconds"
    },
    {
      icon: Eye,
      title: "Emergency-Only Location Access",
      description: "See family member locations only during active SOS events. Complete privacy outside emergencies.",
      benefit: "Privacy-first family safety"
    }
  ];

  // Pricing Options Comparison
  const pricingOptions = [
    {
      type: "Owner-Paid Seat",
      price: formattedSeatPrice,
      period: "/month",
      description: "Family owner pays for this seat",
      features: [
        "Full emergency access",
        "Real-time SOS alerts",
        "Emergency location sharing",
        "Family coordination tools",
        "No emergency contacts limit"
      ],
      popular: true,
      color: "primary"
    },
    {
      type: "Self-Paid Membership",
      price: formattedMemberPrice,
      period: "/month",
      description: "Family member pays their own subscription",
      features: [
        "Independent ICE SOS account",
        "5 personal emergency contacts",
        "All premium safety features",
        "Family emergency access",
        "Own emergency system"
      ],
      popular: false,
      color: "wellness"
    }
  ];

  // Privacy & Security Features
  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All emergency data encrypted with AES-256. Zero-knowledge architecture ensures your data stays private."
    },
    {
      icon: Key,
      title: "Secure Invitation Tokens",
      description: "Invitation links use cryptographically secure tokens with automatic 72-hour expiry."
    },
    {
      icon: Database,
      title: "Row-Level Security",
      description: "Database-level access controls ensure family members only see their authorized emergency data."
    },
    {
      icon: Server,
      title: "EU Data Protection",
      description: "GDPR compliant with European data centers. Your emergency data never leaves the EU."
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Maria Gonzalez",
      role: "Family Owner",
      content: "Having my elderly parents connected to my emergency system gives me incredible peace of mind. When mom had a fall, we were all notified instantly.",
      rating: 5
    },
    {
      name: "James Wilson",
      role: "Family Member",
      content: "The privacy-first approach is perfect. I know my location is only shared during actual emergencies, not constantly tracked.",
      rating: 5
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

  const getGradientBg = (color: string) => {
    switch (color) {
      case 'emergency': return 'from-emergency to-emergency/80';
      case 'guardian': return 'from-guardian to-guardian/80';
      case 'wellness': return 'from-wellness to-wellness/80';
      default: return 'from-primary to-primary/80';
    }
  };

  return (
    <div className="min-h-screen">
      <SEO 
        title="Family Emergency Access - Connect Your Family to Your Emergency System | ICE SOS"
        description="Give your family instant access to emergency alerts with live location sharing. Privacy-first family coordination for real emergencies. €2.99/month per family member."
        keywords={["family emergency access", "emergency alerts family", "family safety system", "emergency coordination", "family location sharing"]}
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
                <span className="text-sm font-medium text-white">Family Emergency Coordination</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                Connect Your <span className="text-wellness drop-shadow-md">Family</span> to Your Emergency System
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl lg:max-w-none mx-auto mb-8 leading-relaxed font-medium drop-shadow-sm">
                Invite family members to receive instant SOS alerts with your location during emergencies. Privacy-first design - no tracking outside actual emergencies.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                <Button 
                  asChild 
                  size="xl" 
                  className="bg-wellness text-black hover:bg-wellness/90 shadow-glow hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg px-8 py-4 rounded-xl border-2 border-wellness/20"
                >
                  <Link to="/ai-register">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Join Now
                  </Link>
                </Button>
                
                <IntroVideoModal 
                  defaultVideoId="family"
                  trigger={
                    <Button 
                      variant="outline"
                      size="xl"
                      className="bg-wellness text-black hover:bg-wellness/90 shadow-glow hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg px-8 py-4 rounded-xl border-2 border-wellness/20"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Watch Video
                    </Button>
                  }
                />
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative animate-scale-in">
              <div className="relative z-10">
                <OptimizedImage 
                  src="/lovable-uploads/0365334e-7587-4cf4-96a6-5744399b84b2.png" 
                  alt="Family emergency coordination dashboard showing real-time alerts, location sharing, and response coordination"
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

      {/* What Your Family Gets - Flow Layout */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-wellness/10 rounded-full px-4 py-2 mb-4 border border-wellness/20">
              <Users className="h-4 w-4 text-wellness mr-2" />
              <span className="text-sm font-medium text-wellness">What Your Family Gets</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Complete Emergency Coordination System
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              When you invite family members, they get instant access to your emergency alerts with precise location sharing during SOS events only.
            </p>
          </div>
          
          {/* Feature Flow */}
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-emergency to-emergency/80 rounded-xl flex items-center justify-center mr-4">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Instant SOS Alerts</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Family members receive immediate push notifications when you trigger an emergency. They see your exact location, 
                  emergency type, and can respond with "Received & On It" to coordinate help effectively.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-wellness mr-3" />
                    <span className="text-foreground">Emergency-only location sharing</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-wellness mr-3" />
                    <span className="text-foreground">Complete privacy outside emergencies</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-wellness mr-3" />
                    <span className="text-foreground">Real-time coordination tools</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <OptimizedImage 
                  src="/lovable-uploads/0365334e-7587-4cf4-96a6-5744399b84b2.png" 
                  alt="Family emergency alert notification showing location and response options"
                  className="w-full rounded-2xl shadow-lg"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
              <div className="order-2 lg:order-1 relative">
                <OptimizedImage 
                  src="/lovable-uploads/6adce9d3-1bbc-4e72-87d5-d397b11fcab8.png" 
                  alt="Family member dashboard showing emergency coordination tools"
                  className="w-full rounded-2xl shadow-lg"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center mr-4">
                    <MessageSquare className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Emergency Coordination Dashboard</h3>
                </div>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Family members get a clean, mobile-friendly dashboard to coordinate emergency response. See who's responding, 
                  contact emergency services, and communicate with other family members in real-time.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-wellness mr-3" />
                    <span className="text-foreground">One-click emergency response</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-wellness mr-3" />
                    <span className="text-foreground">Family coordination tools</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-wellness mr-3" />
                    <span className="text-foreground">Emergency timeline tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Family Access Works - Timeline */}
      <section className="py-20 bg-gradient-to-br from-muted/20 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mb-4 border border-primary/20">
              <UserCog className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Simple Setup</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How You Add Family Members
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              As the family owner, you control who joins your emergency network with secure invitations and flexible billing.
            </p>
          </div>
          
          {/* Simplified Timeline Layout */}
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              {invitationProcess.map((step, index) => {
                const Icon = step.icon;
                const colorClass = getGradientBg(step.color);
                const textColor = getIconColor(step.color);
                
                return (
                  <div key={index} className="relative text-center">
                    {/* Step Number and Icon */}
                    <div className="flex flex-col items-center mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${colorClass} rounded-full flex items-center justify-center shadow-lg mb-4 relative z-10`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-muted-foreground/60">0{step.step}</div>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3">
                      <h3 className={`text-xl font-bold ${textColor}`}>
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {step.description}
                      </p>
                    </div>
                    
                    {/* Arrow */}
                    {index < invitationProcess.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-full transform -translate-y-1/2 z-0">
                        <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Clean Ecommerce Pricing Card */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-muted/10 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-wellness to-wellness/90 px-8 py-4 text-center">
                <h2 className="text-2xl font-bold text-black">Family Connection</h2>
                <p className="text-black/80 text-sm">Emergency access for family members</p>
              </div>
              
              {/* Price */}
              <div className="px-8 py-8 text-center">
                <div className="mb-6">
                  <div className="text-5xl font-bold text-foreground mb-2">{formattedSeatPrice}</div>
                  <div className="text-lg text-muted-foreground">per family member / month</div>
                </div>
                
                {/* Features List */}
                <div className="space-y-3 mb-8 text-left">
                  <div className="flex justify-between items-center py-2 border-b border-muted/20">
                    <span className="text-foreground">Instant SOS alerts</span>
                    <span className="text-wellness font-semibold">✓</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-muted/20">
                    <span className="text-foreground">Live emergency location</span>
                    <span className="text-wellness font-semibold">✓</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-muted/20">
                    <span className="text-foreground">Emergency coordination</span>
                    <span className="text-wellness font-semibold">✓</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-muted/20">
                    <span className="text-foreground">Unlimited family members</span>
                    <span className="text-wellness font-semibold">✓</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-foreground">Emergency-only privacy</span>
                    <span className="text-wellness font-semibold">✓</span>
                  </div>
                </div>
                
                {/* Payment Options */}
                <div className="bg-muted/20 rounded-2xl p-4 mb-8">
                  <div className="text-sm font-semibold text-foreground mb-3">Payment Options</div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>• You pay for family members</div>
                    <div>• Family member pays when accepting invite</div>
                  </div>
                </div>
                
                {/* CTA Button */}
                <Button 
                  asChild 
                  size="xl" 
                  className="w-full bg-wellness hover:bg-wellness/90 text-black font-bold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to="/ai-register">
                    Join Now
                  </Link>
                </Button>
                
                <div className="mt-4 text-xs text-muted-foreground">
                  No setup fees • Cancel anytime • 30-day guarantee
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-muted/10 via-background to-muted/20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-wellness/10 rounded-full px-4 py-2 mb-4 border border-wellness/20">
              <Quote className="h-4 w-4 text-wellness mr-2" />
              <span className="text-sm font-medium text-wellness">Customer Stories</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Families Worldwide
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how families use ICE SOS to stay connected and coordinate emergency responses when it matters most.
            </p>
          </div>
          
          {/* Moving Testimonials */}
          <div className="relative">
            <div className="flex space-x-6 animate-slide-testimonials">
              {/* Testimonial 1 */}
              <div className="min-w-[350px] bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-muted/20 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-wellness text-wellness" />
                  ))}
                </div>
                <blockquote className="text-foreground italic leading-relaxed mb-6">
                  "When my husband had a heart attack while jogging, our adult children were instantly notified with his exact location. They coordinated with each other and emergency services perfectly."
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">MG</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Maria Gonzalez</div>
                    <div className="text-sm text-muted-foreground">Family Owner • Madrid, Spain</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="min-w-[350px] bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-muted/20 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-wellness text-wellness" />
                  ))}
                </div>
                <blockquote className="text-foreground italic leading-relaxed mb-6">
                  "The privacy-first approach is perfect. I know my location is only shared during actual emergencies, not constantly tracked. Finally, a system that respects boundaries."
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-guardian to-guardian/80 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">JW</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">James Wilson</div>
                    <div className="text-sm text-muted-foreground">Family Member • London, UK</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="min-w-[350px] bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-muted/20 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-wellness text-wellness" />
                  ))}
                </div>
                <blockquote className="text-foreground italic leading-relaxed mb-6">
                  "As a caregiver for my elderly father, having instant SOS coordination with my siblings has been life-changing. We avoid the chaos of multiple calls and confusion."
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-wellness to-wellness/80 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">SK</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Sarah Kim</div>
                    <div className="text-sm text-muted-foreground">Family Caregiver • Toronto, Canada</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 4 */}
              <div className="min-w-[350px] bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-muted/20 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-wellness text-wellness" />
                  ))}
                </div>
                <blockquote className="text-foreground italic leading-relaxed mb-6">
                  "The 'Received & On It' feature is brilliant. When mom triggered SOS, we could see who was responding in real-time. No duplicate efforts, perfect coordination."
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emergency to-emergency/80 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">DR</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">David Rodriguez</div>
                    <div className="text-sm text-muted-foreground">Adult Child • Barcelona, Spain</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 5 */}
              <div className="min-w-[350px] bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-muted/20 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-wellness text-wellness" />
                  ))}
                </div>
                <blockquote className="text-foreground italic leading-relaxed mb-6">
                  "Setup was incredibly simple. My three children connected within minutes, and the €2.99 per person is reasonable for the peace of mind it provides our family."
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">AM</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Anna Mueller</div>
                    <div className="text-sm text-muted-foreground">Family Owner • Berlin, Germany</div>
                  </div>
                </div>
              </div>

              {/* Duplicate cards for seamless loop */}
              <div className="min-w-[350px] bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-muted/20 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-wellness text-wellness" />
                  ))}
                </div>
                <blockquote className="text-foreground italic leading-relaxed mb-6">
                  "When my husband had a heart attack while jogging, our adult children were instantly notified with his exact location. They coordinated with each other and emergency services perfectly."
                </blockquote>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">MG</span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Maria Gonzalez</div>
                    <div className="text-sm text-muted-foreground">Family Owner • Madrid, Spain</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Connect Your Family?
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Join thousands of families using ICE SOS for emergency coordination. Set up family access in minutes.
            </p>
            
            <div className="flex justify-center mb-12">
              <Button 
                asChild 
                size="xl" 
                className="bg-wellness hover:bg-wellness/90 text-black font-semibold px-12 py-4 shadow-lg hover:shadow-xl transition-all duration-300 text-lg rounded-xl"
              >
                <Link to="/ai-register">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Join Now
                </Link>
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-muted/20 shadow-sm">
                <div className="text-lg font-bold text-primary mb-1">30-Day</div>
                <div className="text-sm text-muted-foreground">Money-back guarantee</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-muted/20 shadow-sm">
                <div className="text-lg font-bold text-primary mb-1">No Setup</div>
                <div className="text-sm text-muted-foreground">Fees or contracts</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-muted/20 shadow-sm">
                <div className="text-lg font-bold text-primary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Emergency support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FamilyCarerAccessPage;