import React from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from '@/components/SEO';
import { Button } from "@/components/ui/button";
import { Users, Shield, Heart, Clock, Phone, CheckCircle, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const FamilyCarerAccessPage = () => {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Family Emergency Coordination - Connect Your Loved Ones | ICE SOS"
        description="Professional family emergency coordination system. Instant SOS alerts, real-time location sharing during emergencies only. Privacy-first family safety solution."
        keywords={["family emergency coordination", "emergency alerts", "family safety", "SOS system", "emergency response"]}
      />
      <Navigation />
      
      <main>
        {/* Hero Section - matching homepage layout */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-hero shadow-2xl">
          <div className="container mx-auto px-4 py-16 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div className="text-center lg:text-left text-white">
                <div className="inline-flex items-center space-x-2 bg-emergency/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg border border-emergency/30">
                  <Users className="h-4 w-4 text-emergency-glow" />
                  <span className="text-sm font-medium text-white">Family Emergency Network</span>
                </div>
                
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
                  Connect Your Family's 
                  <span className="text-wellness drop-shadow-md block">Emergency Response</span>
                </h1>
                
                <p className="text-xl md:text-2xl mb-8 text-white leading-relaxed font-medium drop-shadow-sm">
                  Instant SOS alerts, real-time coordination, and 24/7 professional monitoring. 
                  When emergencies happen, every family member knows immediately.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-8">
                  {/* Primary CTA */}
                  <Button 
                    asChild
                    size="xl" 
                    className="bg-wellness text-black hover:bg-wellness/90 shadow-glow hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg px-8 py-4 rounded-xl border-2 border-wellness/20"
                  >
                    <Link to="/ai-register">
                      <Shield className="h-5 w-5 mr-2" />
                      Protect Your Family Now
                    </Link>
                  </Button>
                  
                  {/* Secondary CTA */}
                  <Button 
                    size="xl" 
                    variant="outline"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg px-8 py-4 rounded-xl"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    Talk to Expert
                  </Button>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                  <div className="flex items-center gap-2 text-white/80">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">GDPR Compliant</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">30-Second Response</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">24/7 Monitoring</span>
                  </div>
                </div>
              </div>
              
              {/* Hero Demo - Family Emergency Coordination */}
              <div className="relative">
                <div className="relative z-10">
                  {/* Phone Mockup with Family Emergency Interface */}
                  <div className="relative mx-auto w-80 h-[600px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-[3rem] p-2 shadow-2xl">
                    <div className="w-full h-full bg-gradient-to-b from-gray-50 to-white rounded-[2.5rem] overflow-hidden relative">
                      {/* Status Bar */}
                      <div className="flex justify-between items-center px-6 py-3 bg-primary text-white text-sm font-medium">
                        <span>Family Emergency</span>
                        <div className="flex items-center gap-1">
                          <div className="flex gap-0.5">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                          <span className="ml-2 text-xs">100%</span>
                        </div>
                      </div>

                      {/* Emergency Alert */}
                      <div className="p-4">
                        <div className="bg-emergency/10 border border-emergency/20 p-4 rounded-xl mb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-4 h-4 bg-emergency rounded-full animate-pulse"></div>
                            <span className="font-semibold text-emergency text-sm">SOS Alert - Grandma</span>
                          </div>
                          <p className="text-xs text-gray-700">Emergency button pressed</p>
                          <p className="text-xs text-gray-600 mt-1">📍 High Street, London</p>
                        </div>

                        {/* Family Response Status */}
                        <div className="space-y-3 mb-4">
                          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                👩
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-green-800 text-xs">Sarah - Responding</p>
                                <p className="text-xs text-green-600">2 minutes away</p>
                              </div>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                          </div>
                          
                          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                👨
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-blue-800 text-xs">Dad - En Route</p>
                                <p className="text-xs text-blue-600">5 minutes away</p>
                              </div>
                              <Clock className="h-4 w-4 text-blue-500" />
                            </div>
                          </div>
                          
                          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                🚑
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-yellow-800 text-xs">Emergency Services</p>
                                <p className="text-xs text-yellow-600">Dispatched</p>
                              </div>
                              <Shield className="h-4 w-4 text-yellow-500" />
                            </div>
                          </div>
                        </div>

                        {/* Action Bar */}
                        <div className="bg-primary text-white rounded-xl p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-xs">Professional Monitoring</p>
                              <p className="text-xs opacity-90">Coordinating response...</p>
                            </div>
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Stats */}
                  <div className="absolute -left-8 top-16 bg-white rounded-xl p-3 shadow-xl border border-wellness/20 max-w-40">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-wellness">30s</div>
                      <div className="text-xs text-gray-600">Average Alert Time</div>
                    </div>
                  </div>
                  
                  <div className="absolute -right-8 bottom-32 bg-white rounded-xl p-3 shadow-xl border border-primary/20 max-w-40">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">24/7</div>
                      <div className="text-xs text-gray-600">Professional Monitoring</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-section bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
                Simple, Transparent Pricing
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional family emergency coordination that fits your budget
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-guardian/10 rounded-3xl p-8 border border-primary/20 shadow-xl">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">Family Protection Plan</h3>
                  <div className="flex items-baseline justify-center gap-2 mb-4">
                    <span className="text-4xl font-bold text-primary">€9.99</span>
                    <span className="text-muted-foreground">/month per family member</span>
                  </div>
                  <p className="text-muted-foreground">Complete emergency coordination for your entire family</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Instant SOS alerts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Real-time location sharing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">24/7 professional monitoring</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Emergency coordination</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Family network management</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">GDPR compliant privacy</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link to="/ai-register">Start Free Trial</Link>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    First family member free • 30-day guarantee • Cancel anytime
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof & CTA */}
        <section className="py-section">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-lg text-foreground mb-4 italic">
                "This system saved my mother's life. When she had a fall, the entire family was alerted immediately 
                and help arrived within minutes. I can't imagine not having this protection now."
              </blockquote>
              <cite className="text-muted-foreground">— Sarah M., Mother of 3, London</cite>
              
              <div className="mt-8 pt-8 border-t">
                <p className="text-muted-foreground mb-6">
                  Have questions? Want to learn more about how family emergency coordination works?
                </p>
                <Button 
                  asChild
                  variant="outline"
                  size="lg" 
                  className="font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to="/contact">
                    Talk to a Family Safety Expert
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default FamilyCarerAccessPage;