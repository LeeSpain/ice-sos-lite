import React from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from '@/components/SEO';
import { Button } from "@/components/ui/button";
import { Users, Shield, Heart, Clock, Phone, CheckCircle, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import OptimizedImage from "@/components/ui/optimized-image";
import { getImageSizes, generateBlurPlaceholder } from "@/utils/imageOptimization";
import { FamilyCircleSection } from "@/components/family-carer/FamilyCircleSection";

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
                  <span className="text-wellness drop-shadow-md">Emergency Response</span>
                </h1>
                
                <p className="text-xl md:text-2xl mb-8 text-white leading-relaxed font-medium drop-shadow-sm">
                  Instant SOS alerts, real-time coordination, and 24/7 professional monitoring. 
                  When emergencies happen, every family member knows immediately.
                </p>
                

                <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
                  {/* Primary CTA */}
                  <Button 
                    asChild
                    size="xl" 
                    className="bg-wellness text-black hover:bg-wellness/90 shadow-glow hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg px-8 py-4 rounded-xl border-2 border-wellness/20"
                  >
                    <Link to="/ai-register">
                      <Shield className="h-5 w-5 mr-2" />
                      Join Now
                    </Link>
                  </Button>

                  {/* Watch Video Button */}
                  <Button 
                    size="xl" 
                    className="bg-wellness text-black hover:bg-wellness/90 shadow-glow hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg px-8 py-4 rounded-xl border-2 border-wellness/20"
                  >
                    <Heart className="h-5 w-5 mr-2" />
                    Watch Video
                  </Button>
                </div>
              </div>
              
              {/* Hero Image - matching homepage layout */}
              <div className="relative">
                <div className="relative z-10">
                  <OptimizedImage 
                    src="/lovable-uploads/7b271d34-59d8-4874-9441-77c857b01fac.png" 
                    alt="Family carer emergency coordination - woman and elderly man using emergency alert system with family access dashboard"
                    className="w-full h-full object-cover rounded-3xl shadow-2xl"
                    priority={true}
                    sizes={getImageSizes('hero')}
                    blurDataURL={generateBlurPlaceholder(400, 600)}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Family Circle Section */}
        <FamilyCircleSection />

        {/* Pricing Section */}
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