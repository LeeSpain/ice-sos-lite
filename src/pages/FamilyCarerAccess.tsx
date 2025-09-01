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

  // Owner Invitation Process
  const invitationProcess = [
    {
      step: "1",
      title: "Owner Sends Secure Invite",
      description: "Family owner uses the dashboard to send secure invitation links with 72-hour expiry tokens.",
      icon: Send,
      color: "primary"
    },
    {
      step: "2", 
      title: "Family Member Receives Email",
      description: "Invitation arrives via email with secure registration link and clear explanation of family emergency access.",
      icon: Mail,
      color: "wellness"
    },
    {
      step: "3",
      title: "Choose Billing Option", 
      description: "Family member can join with owner-paid access or choose their own €9.99/month subscription with 5 emergency contacts.",
      icon: CreditCard,
      color: "guardian"
    },
    {
      step: "4",
      title: "Instant Family Connection",
      description: "Once accepted, immediate access to family emergency dashboard and real-time SOS coordination system.",
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
                    Start Family Access
                  </Link>
                </Button>
                
                <IntroVideoModal 
                  defaultVideoId="family"
                  trigger={
                    <Button 
                      variant="outline"
                      size="xl"
                      className="border-2 border-white text-white hover:bg-white hover:text-background font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl backdrop-blur-sm"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Watch Family Demo
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
                <div className="bg-emergency/5 border-l-4 border-emergency p-4 rounded-r-lg">
                  <p className="text-sm text-emergency font-medium">Real-time location sharing during emergencies only - no constant tracking</p>
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
          
          {/* Timeline Layout */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-wellness to-emergency opacity-30 hidden md:block"></div>
              
              <div className="space-y-12">
                {invitationProcess.map((step, index) => {
                  const Icon = step.icon;
                  const isEven = index % 2 === 0;
                  
                  return (
                    <div key={index} className={`relative flex items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      {/* Step Circle */}
                      <div className="absolute left-8 transform -translate-x-1/2 z-10 hidden md:block">
                        <div className={`w-16 h-16 bg-gradient-to-br ${getGradientBg(step.color)} rounded-full flex items-center justify-center shadow-lg border-4 border-background`}>
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className={`flex-1 ${isEven ? 'md:pl-24' : 'md:pr-24'}`}>
                        <div className={`bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-muted/20 ${isEven ? 'md:ml-8' : 'md:mr-8'}`}>
                          <div className="flex items-center mb-4 md:hidden">
                            <div className={`w-12 h-12 bg-gradient-to-br ${getGradientBg(step.color)} rounded-xl flex items-center justify-center mr-4`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-muted-foreground">0{step.step}</span>
                          </div>
                          <div className="hidden md:block text-right mb-2">
                            <span className="text-sm font-semibold text-muted-foreground">STEP {step.step}</span>
                          </div>
                          <h3 className={`text-xl font-bold mb-3 ${getIconColor(step.color)}`}>{step.title}</h3>
                          <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section - Clean Layout */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-warning/10 rounded-full px-4 py-2 mb-4 border border-warning/20">
              <Euro className="h-4 w-4 text-warning mr-2" />
              <span className="text-sm font-medium text-warning">Simple Pricing</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Family Access Costs
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              Two flexible options: you pay for family seats, or they manage their own subscriptions.
            </p>
          </div>
          
          {/* Pricing Comparison */}
          <div className="max-w-5xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-muted/20">
              <div className="grid md:grid-cols-2">
                {/* Option 1 */}
                <div className="p-8 border-r border-muted/20">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">You Pay for Family</h3>
                    <div className="text-4xl font-bold text-primary mb-1">{formattedSeatPrice}</div>
                    <div className="text-sm text-muted-foreground">per family member/month</div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-3" />
                      <span className="text-sm">You control all billing</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-3" />
                      <span className="text-sm">Family gets full access</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-primary mr-3" />
                      <span className="text-sm">Unlimited family members</span>
                    </div>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-3">
                    <div className="text-xs text-primary font-medium">Most Popular Choice</div>
                  </div>
                </div>
                
                {/* Option 2 */}
                <div className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-wellness to-wellness/80 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">They Pay Themselves</h3>
                    <div className="text-4xl font-bold text-wellness mb-1">{formattedMemberPrice}</div>
                    <div className="text-sm text-muted-foreground">per member/month</div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-wellness mr-3" />
                      <span className="text-sm">Independent subscription</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-wellness mr-3" />
                      <span className="text-sm">5 personal emergency contacts</span>
                    </div>
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-wellness mr-3" />
                      <span className="text-sm">Full ICE SOS features</span>
                    </div>
                  </div>
                  <div className="bg-wellness/5 rounded-lg p-3">
                    <div className="text-xs text-wellness font-medium">Includes Own Emergency System</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Cost Examples */}
            <div className="mt-12 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-6">Example Family Costs (Owner-Paid)</h3>
              <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                <div>
                  <div className="text-2xl font-bold text-primary">{formatDisplayCurrency(convertCurrency(5.98, 'EUR', currency), currency, languageToLocale(language))}</div>
                  <div className="text-sm text-muted-foreground">2 members</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{formatDisplayCurrency(convertCurrency(11.96, 'EUR', currency), currency, languageToLocale(language))}</div>
                  <div className="text-sm text-muted-foreground">4 members</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">{formatDisplayCurrency(convertCurrency(17.94, 'EUR', currency), currency, languageToLocale(language))}</div>
                  <div className="text-sm text-muted-foreground">6 members</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Benefits - Split Layout */}
      <section className="py-20 bg-gradient-to-br from-guardian/5 via-background to-guardian/10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Privacy */}
              <div>
                <div className="inline-flex items-center bg-guardian/10 rounded-full px-4 py-2 mb-6 border border-guardian/20">
                  <Shield className="h-4 w-4 text-guardian mr-2" />
                  <span className="text-sm font-medium text-guardian">Privacy First</span>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Emergency-Only Location Sharing
                </h2>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Your family can only see your location during active SOS emergencies. No constant tracking, 
                  no location history, no monitoring outside actual emergencies.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-guardian/20 rounded-full flex items-center justify-center mr-4 mt-1">
                      <Lock className="h-3 w-3 text-guardian" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">End-to-End Encryption</div>
                      <div className="text-sm text-muted-foreground">All emergency data protected with AES-256 encryption</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-guardian/20 rounded-full flex items-center justify-center mr-4 mt-1">
                      <EyeOff className="h-3 w-3 text-guardian" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">No Constant Monitoring</div>
                      <div className="text-sm text-muted-foreground">Location shared only during SOS events</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-guardian/20 rounded-full flex items-center justify-center mr-4 mt-1">
                      <Key className="h-3 w-3 text-guardian" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Secure Invitations</div>
                      <div className="text-sm text-muted-foreground">Cryptographically secure tokens with 72-hour expiry</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Benefits */}
              <div>
                <div className="inline-flex items-center bg-wellness/10 rounded-full px-4 py-2 mb-6 border border-wellness/20">
                  <Heart className="h-4 w-4 text-wellness mr-2" />
                  <span className="text-sm font-medium text-wellness">Peace of Mind</span>
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  What This Means for Your Family
                </h2>
                
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-muted/20">
                    <div className="flex items-center mb-3">
                      <Bell className="h-5 w-5 text-emergency mr-3" />
                      <span className="font-semibold text-foreground">Instant Emergency Response</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Family knows immediately when you're in trouble with your exact location</p>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-muted/20">
                    <div className="flex items-center mb-3">
                      <UserCheck className="h-5 w-5 text-primary mr-3" />
                      <span className="font-semibold text-foreground">Coordinated Help</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Avoid confusion with "Received & On It" responses showing who's helping</p>
                  </div>
                  
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-muted/20">
                    <div className="flex items-center mb-3">
                      <Shield className="h-5 w-5 text-guardian mr-3" />
                      <span className="font-semibold text-foreground">Complete Privacy</span>
                    </div>
                    <p className="text-sm text-muted-foreground">No tracking outside emergencies - privacy maintained until you need help</p>
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
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Button 
                asChild 
                size="xl" 
                className="bg-wellness hover:bg-wellness/90 text-black font-semibold px-12 py-4 shadow-lg hover:shadow-xl transition-all duration-300 text-lg rounded-xl"
              >
                <Link to="/ai-register">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Start Family Access
                </Link>
              </Button>
              
              <IntroVideoModal 
                defaultVideoId="family"
                trigger={
                  <Button 
                    variant="outline"
                    size="xl"
                    className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Watch Demo
                  </Button>
                }
              />
            </div>
            
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
              <div>
                <div className="text-lg font-bold text-primary mb-1">30-Day</div>
                <div className="text-sm text-muted-foreground">Money-back guarantee</div>
              </div>
              <div>
                <div className="text-lg font-bold text-primary mb-1">No Setup</div>
                <div className="text-sm text-muted-foreground">Fees or contracts</div>
              </div>
              <div>
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