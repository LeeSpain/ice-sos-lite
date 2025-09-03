import React from 'react';
import { Button } from "@/components/ui/button";
import { Shield, Heart, MapPin, Users, Clock, CheckCircle, Play, Phone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { IntroVideoModal } from "@/components/IntroVideoModal";

export const HeroSection = () => {
  return (
    <section className="py-section bg-gradient-hero shadow-2xl">
      <div className="container mx-auto px-4">
        {/* Header - matching other sections */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
            Family Emergency Coordination
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Connect your loved ones with instant SOS alerts, real-time location sharing during emergencies only, and 24/7 professional monitoring.
          </p>
        </div>

        {/* Main Content - matching Features section layout */}
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Right Side - Benefits */}
            <div className="text-center lg:text-left">
              <div className="mb-8">
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                  Protect Your Family With Professional Emergency Coordination
                </h3>
                <p className="text-lg text-muted-foreground mb-6">
                  When emergencies happen, every second counts. Our family coordination system ensures help arrives quickly while respecting privacy.
                </p>
              </div>

              <div className="grid gap-6 mb-8">
                <div className="flex items-start space-x-4 text-left">
                  <div className="w-12 h-12 bg-emergency/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-emergency" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Instant SOS Alerts</h4>
                    <p className="text-muted-foreground">One-button emergency alerts to all family members with precise location sharing</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 text-left">
                  <div className="w-12 h-12 bg-wellness/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="h-6 w-6 text-wellness" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Family Network</h4>
                    <p className="text-muted-foreground">Connect parents, children, grandparents and trusted contacts in one secure network</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-wellness hover:bg-wellness/90 text-black font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to="/ai-register">
                    <Shield className="h-5 w-5 mr-2" />
                    Start Protecting Your Family
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