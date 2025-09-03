import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, UserPlus, Play, Shield, Clock, CheckCircle, ArrowRight } from "lucide-react";
import { IntroVideoModal } from '@/components/IntroVideoModal';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_50%)] animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emergency/20 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-wellness/20 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Content */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-emergency/20 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-emergency/30 shadow-glow">
              <Users className="h-5 w-5 text-emergency-glow" />
              <span className="text-white font-medium">Professional Emergency Coordination</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-white">
              Your Family's
              <br />
              <span className="bg-gradient-to-r from-wellness via-white to-emergency-glow bg-clip-text text-transparent">
                Emergency Lifeline
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-white/90 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
              Instant SOS alerts. Real-time coordination. Complete privacy.
              <br />
              <span className="text-wellness font-medium">Professional emergency response for modern families.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button 
                asChild 
                size="xl" 
                className="bg-wellness text-black hover:bg-wellness/90 shadow-glow font-bold text-xl px-12 py-6 rounded-2xl hover-scale"
              >
                <Link to="/ai-register">
                  <UserPlus className="mr-3 h-6 w-6" />
                  Start Protecting Your Family
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
              
              <IntroVideoModal 
                defaultVideoId="family"
                trigger={
                  <Button 
                    variant="outline"
                    size="xl"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 font-bold text-xl px-12 py-6 rounded-2xl backdrop-blur-sm"
                  >
                    <Play className="h-6 w-6 mr-3 fill-current" />
                    See How It Works
                  </Button>
                }
              />
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3 text-white/80">
                <Shield className="h-8 w-8 text-wellness" />
                <div className="text-left">
                  <div className="font-bold text-white">Privacy First</div>
                  <div className="text-sm">No tracking outside emergencies</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3 text-white/80">
                <Clock className="h-8 w-8 text-wellness" />
                <div className="text-left">
                  <div className="font-bold text-white">Instant Setup</div>
                  <div className="text-sm">Connected in under 5 minutes</div>
                </div>
              </div>
              <div className="flex items-center justify-center space-x-3 text-white/80">
                <CheckCircle className="h-8 w-8 text-wellness" />
                <div className="text-left">
                  <div className="font-bold text-white">Proven System</div>
                  <div className="text-sm">Trusted by thousands of families</div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Demo Preview */}
          <div className="relative animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-t from-guardian/20 via-transparent to-transparent rounded-3xl"></div>
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Live Emergency Coordination</h3>
                <p className="text-white/80">Real-time family emergency response in action</p>
              </div>
              
              {/* Simulated Emergency Flow */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-emergency/20 backdrop-blur-sm rounded-2xl p-6 border border-emergency/30">
                  <div className="w-12 h-12 bg-emergency rounded-xl flex items-center justify-center mb-4">
                    <div className="text-white font-bold">1</div>
                  </div>
                  <h4 className="text-white font-bold mb-2">SOS Triggered</h4>
                  <p className="text-white/80 text-sm">Dad presses emergency button</p>
                </div>
                
                <div className="bg-primary/20 backdrop-blur-sm rounded-2xl p-6 border border-primary/30">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
                    <div className="text-white font-bold">2</div>
                  </div>
                  <h4 className="text-white font-bold mb-2">Family Alerted</h4>
                  <p className="text-white/80 text-sm">Instant notifications with location</p>
                </div>
                
                <div className="bg-wellness/20 backdrop-blur-sm rounded-2xl p-6 border border-wellness/30">
                  <div className="w-12 h-12 bg-wellness rounded-xl flex items-center justify-center mb-4">
                    <div className="text-white font-bold">3</div>
                  </div>
                  <h4 className="text-white font-bold mb-2">Response Coordinated</h4>
                  <p className="text-white/80 text-sm">Sarah responds "On my way!"</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};