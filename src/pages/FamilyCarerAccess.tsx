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

      {/* Owner Invitation Process */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mb-4 border border-primary/20">
              <UserCog className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">For Family Owners</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How You Invite Family Members
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              As the family owner, you control who joins your emergency network with secure invitation links and flexible billing options.
            </p>
          </div>
          
          <div className="relative">
            {/* Process Flow Line */}
            <div className="hidden lg:block absolute top-32 left-1/2 transform -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-primary via-wellness to-emergency opacity-30"></div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 mt-4">
              {invitationProcess.map((step, index) => {
                const Icon = step.icon;
                const colorClass = getGradientBg(step.color);
                const textColor = getIconColor(step.color);
                
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

      {/* Complete Family Features */}
      <section className="py-20 bg-gradient-to-br from-muted/20 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-wellness/10 rounded-full px-4 py-2 mb-4 border border-wellness/20">
              <Zap className="h-4 w-4 text-wellness mr-2" />
              <span className="text-sm font-medium text-wellness">Complete Feature Set</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything Your Family Gets
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive emergency coordination tools designed for real-world family safety scenarios.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {familyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card 
                  key={index} 
                  className={`group border-2 transition-all duration-300 hover:shadow-lg ${getCardBorder(feature.color)} bg-white dark:bg-slate-800`}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getGradientBg(feature.color)} shadow-lg flex items-center justify-center mb-4`}>
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

      {/* Family Member Experience */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-guardian/10 rounded-full px-4 py-2 mb-4 border border-guardian/20">
              <Users className="h-4 w-4 text-guardian mr-2" />
              <span className="text-sm font-medium text-guardian">Family Member Experience</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Family Members See & Do
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Simple, intuitive interface designed for emergency response. No complex features - just effective family coordination.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {memberExperience.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={index} className="group border-2 border-guardian/20 hover:border-guardian/40 transition-all duration-300 hover:shadow-lg bg-white dark:bg-slate-800">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-guardian to-guardian/80 shadow-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-semibold text-foreground mb-2">{item.title}</CardTitle>
                        <CardDescription className="text-base leading-relaxed text-muted-foreground mb-3">
                          {item.description}
                        </CardDescription>
                        <div className="inline-flex items-center bg-guardian/10 rounded-full px-3 py-1 border border-guardian/20">
                          <CheckCircle className="h-3 w-3 text-guardian mr-2" />
                          <span className="text-xs font-medium text-guardian">{item.benefit}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Pricing & Billing */}
      <section className="py-20 bg-gradient-to-br from-warning/5 via-background to-warning/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-warning/10 rounded-full px-4 py-2 mb-4 border border-warning/20">
              <Euro className="h-4 w-4 text-warning mr-2" />
              <span className="text-sm font-medium text-warning">Flexible Billing Options</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Family Access Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose between owner-paid family seats or let family members manage their own subscriptions with full emergency features.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingOptions.map((option, index) => (
              <Card key={index} className={`relative border-2 ${option.popular ? 'border-primary/30 ring-2 ring-primary/20' : 'border-muted/20'} hover:border-primary/40 transition-all duration-300 bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl overflow-hidden`}>
                {option.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-primary/80 text-white text-center py-2 text-sm font-semibold">
                    Most Popular Choice
                  </div>
                )}
                
                <CardHeader className={`text-center ${option.popular ? 'pt-12' : 'pt-6'} pb-4`}>
                  <div className={`w-12 h-12 bg-gradient-to-br ${getGradientBg(option.color)} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-foreground mb-3">{option.type}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1 mb-2">
                    <span className={`text-3xl font-bold ${getIconColor(option.color)}`}>{option.price}</span>
                    <span className="text-sm text-muted-foreground">{option.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </CardHeader>
                
                <CardContent className="px-6 pb-6">
                  <div className="space-y-3 mb-6">
                    {option.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <Check className={`h-4 w-4 ${getIconColor(option.color)} flex-shrink-0`} />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    asChild 
                    size="lg" 
                    className={`w-full ${option.popular ? 'bg-primary hover:bg-primary/90' : 'bg-wellness hover:bg-wellness/90'} text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    <Link to="/ai-register">
                      <Users className="mr-2 h-4 w-4" />
                      Get Started
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Cost Examples */}
          <div className="mt-16 bg-muted/30 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center text-foreground mb-6">Family Size Cost Examples</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{formatDisplayCurrency(convertCurrency(5.98, 'EUR', currency), currency, languageToLocale(language))}</div>
                <div className="text-sm text-muted-foreground">2 family members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{formatDisplayCurrency(convertCurrency(11.96, 'EUR', currency), currency, languageToLocale(language))}</div>
                <div className="text-sm text-muted-foreground">4 family members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{formatDisplayCurrency(convertCurrency(17.94, 'EUR', currency), currency, languageToLocale(language))}</div>
                <div className="text-sm text-muted-foreground">6 family members</div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              All prices per month • No setup fees • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-guardian/10 rounded-full px-4 py-2 mb-4 border border-guardian/20">
              <Shield className="h-4 w-4 text-guardian mr-2" />
              <span className="text-sm font-medium text-guardian">Privacy & Security</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your family's emergency data is protected with military-grade encryption and privacy-first architecture.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-2 border-guardian/20 hover:border-guardian/40 transition-all duration-300 hover:shadow-lg bg-white dark:bg-slate-800">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-guardian to-guardian/80 shadow-md flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-foreground mb-2">{feature.title}</CardTitle>
                        <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
          
          <div className="mt-12 bg-guardian/5 rounded-2xl p-8 max-w-4xl mx-auto border border-guardian/20">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-guardian to-guardian/80 shadow-lg flex items-center justify-center flex-shrink-0">
                <EyeOff className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-3">Emergency-Only Location Sharing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Family members can only see your location during active SOS emergencies. No constant tracking, no location history, no monitoring. 
                  Your privacy is maintained until you specifically trigger an emergency alert.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-wellness/5 via-background to-wellness/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-wellness/10 rounded-full px-4 py-2 mb-4 border border-wellness/20">
              <Heart className="h-4 w-4 text-wellness mr-2" />
              <span className="text-sm font-medium text-wellness">Customer Stories</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Real Family Experiences
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how families use ICE SOS to stay connected and coordinate emergency responses.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-2 border-wellness/20 hover:border-wellness/40 transition-all duration-300 hover:shadow-lg bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-wellness text-wellness" />
                    ))}
                  </div>
                  <Quote className="h-8 w-8 text-wellness/40 mb-2" />
                </CardHeader>
                <CardContent>
                  <blockquote className="text-foreground italic leading-relaxed mb-4">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wellness to-wellness/80 flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emergency/5 via-primary/5 to-wellness/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-emergency/10 rounded-full px-4 py-2 mb-6 border border-emergency/20">
              <Users className="h-4 w-4 text-emergency mr-2" />
              <span className="text-sm font-medium text-emergency">Start Today</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Connect Your Family to Your Emergency System
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
              Join thousands of families who trust ICE SOS for emergency coordination. Set up your family access in minutes with our guided onboarding process.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                asChild 
                size="xl" 
                className="bg-wellness hover:bg-wellness/90 text-black font-semibold px-12 py-4 shadow-lg hover:shadow-xl transition-all duration-300 text-lg rounded-xl"
              >
                <Link to="/ai-register">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Start Family Access Setup
                </Link>
              </Button>
              
              <div className="flex items-center space-x-4">
                <IntroVideoModal 
                  defaultVideoId="family"
                  trigger={
                    <Button 
                      variant="outline"
                      size="lg"
                      className="border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Watch Demo
                    </Button>
                  }
                />
                
                <Button 
                  asChild 
                  variant="ghost" 
                  size="lg"
                  className="text-primary hover:bg-primary/10 font-medium"
                >
                  <Link to="/dashboard">
                    <Settings className="mr-2 h-4 w-4" />
                    Existing User Dashboard
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">30-Day</div>
                <div className="text-sm text-muted-foreground">Money-back guarantee</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">No Setup</div>
                <div className="text-sm text-muted-foreground">Fees or contracts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-2">24/7</div>
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