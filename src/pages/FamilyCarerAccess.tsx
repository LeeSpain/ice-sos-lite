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
        {/* Hero Section */}
        <section className="py-section">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h1 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
                Family Emergency Coordination
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Connect your loved ones with instant SOS alerts, real-time location sharing during emergencies only, and 24/7 professional monitoring. Simple setup, complete privacy protection.
              </p>
            </div>

            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                {/* Benefits */}
                <div className="text-center lg:text-left">
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
                    Professional Emergency Coordination for Modern Families
                  </h2>
                  
                  <div className="grid gap-6 mb-8">
                    <div className="flex items-start space-x-4 text-left">
                      <div className="w-12 h-12 bg-emergency/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Shield className="h-6 w-6 text-emergency" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Instant SOS Alerts</h3>
                        <p className="text-muted-foreground">One-button emergency alerts reach all family members in under 30 seconds with precise location</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 text-left">
                      <div className="w-12 h-12 bg-wellness/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Users className="h-6 w-6 text-wellness" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Family Network</h3>
                        <p className="text-muted-foreground">Connect parents, children, grandparents and trusted contacts in one secure network</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 text-left">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Heart className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Privacy Protected</h3>
                        <p className="text-muted-foreground">Location shared only during emergencies. GDPR compliant with complete privacy control</p>
                      </div>
                    </div>
                  </div>

                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-wellness hover:bg-wellness/90 text-black font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Link to="/ai-register">
                      <Shield className="h-5 w-5 mr-2" />
                      Start Protecting Your Family
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Link>
                  </Button>
                </div>

                {/* Simple Demo */}
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-guardian/10 rounded-3xl p-8 border border-primary/20 shadow-xl">
                  <h3 className="text-xl font-bold mb-6 text-center">How It Works</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                      <div className="w-8 h-8 bg-emergency rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                      <div>
                        <p className="font-semibold">Emergency Happens</p>
                        <p className="text-sm text-muted-foreground">Family member presses SOS button</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                      <div className="w-8 h-8 bg-wellness rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                      <div>
                        <p className="font-semibold">Family Alerted</p>
                        <p className="text-sm text-muted-foreground">Everyone notified with location instantly</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
                      <div className="w-8 h-8 bg-guardian rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                      <div>
                        <p className="font-semibold">Help Arrives</p>
                        <p className="text-sm text-muted-foreground">Coordinated response ensures quick help</p>
                      </div>
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