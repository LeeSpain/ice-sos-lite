import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, UserPlus, Play } from "lucide-react";
import { IntroVideoModal } from '@/components/IntroVideoModal';
import OptimizedImage from "@/components/ui/optimized-image";

export const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-hero">
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left text-white">
            <div className="inline-flex items-center space-x-2 bg-emergency/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-emergency/30">
              <Users className="h-4 w-4 text-emergency-glow" />
              <span className="text-sm font-medium">Family Emergency Coordination</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
              Connect Your <span className="text-wellness">Family</span> to Your Emergency System
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto lg:mx-0 mb-8 leading-relaxed font-medium">
              When you press your SOS button, your family receives instant alerts with your exact location. 
              Privacy-first design - no tracking outside actual emergencies.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                asChild 
                size="lg" 
                className="bg-wellness text-black hover:bg-wellness/90 shadow-glow font-semibold"
              >
                <Link to="/ai-register">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Get Started
                </Link>
              </Button>
              
              <IntroVideoModal 
                defaultVideoId="family"
                trigger={
                  <Button 
                    variant="outline"
                    size="lg"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-semibold"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Watch Demo
                  </Button>
                }
              />
            </div>
          </div>
          
          {/* Hero Visual */}
          <div className="relative">
            <OptimizedImage 
              src="/lovable-uploads/0365334e-7587-4cf4-96a6-5744399b84b2.png" 
              alt="Family emergency coordination dashboard showing real-time alerts and location sharing"
              className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl"
              priority={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
};