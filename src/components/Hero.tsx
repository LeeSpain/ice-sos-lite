import { Button } from "@/components/ui/button";
import { Shield, Heart, MapPin, Smartphone } from "lucide-react";
import heroImage from "@/assets/hero-emergency.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero shadow-2xl">
      {/* Darker Shadow Overlay for Professional Look */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:20px_20px]" />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left text-white">
            <div className="inline-flex items-center space-x-2 bg-emergency/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg border border-emergency/30">
              <Shield className="h-4 w-4 text-emergency-glow" />
              <span className="text-sm font-medium text-white">Device-Free Emergency Protection</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
              Transform Your Phone Into a 
              <span className="text-emergency-glow drop-shadow-md"> Life-Saving</span> Assistant
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white leading-relaxed font-medium drop-shadow-sm">
              ICE SOS Lite provides multilingual emergency protection with AI Guardian, 
              professional call center access, and family connectivity — globally available.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button size="xl" className="bg-emergency text-black hover:bg-emergency/90 shadow-glow">
                Start Free Trial
              </Button>
              <Button size="xl" className="bg-emergency text-black hover:bg-emergency/90 shadow-glow">
                Watch Demo
              </Button>
            </div>
            
            {/* Features Icons */}
            <div className="grid grid-cols-3 gap-8 max-w-md mx-auto lg:mx-0">
              <div className="text-center">
                <div className="w-12 h-12 bg-emergency/20 rounded-full flex items-center justify-center mx-auto mb-2 shadow-emergency border border-emergency/30 backdrop-blur-sm">
                  <Heart className="h-6 w-6 text-emergency" />
                </div>
                <p className="text-sm text-emergency-glow font-medium">24/7 Guardian AI</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emergency/20 rounded-full flex items-center justify-center mx-auto mb-2 shadow-emergency border border-emergency/30 backdrop-blur-sm">
                  <MapPin className="h-6 w-6 text-emergency" />
                </div>
                <p className="text-sm text-emergency-glow font-medium">GPS Location</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emergency/20 rounded-full flex items-center justify-center mx-auto mb-2 shadow-emergency border border-emergency/30 backdrop-blur-sm">
                  <Smartphone className="h-6 w-6 text-emergency" />
                </div>
                <p className="text-sm text-emergency-glow font-medium">Multilingual</p>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src={heroImage} 
                alt="ICE SOS Emergency Protection App Interface"
                className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl"
              />
            </div>
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-guardian/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;