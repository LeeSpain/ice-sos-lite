import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ICE SOS Professional Logo */}
          <div className="flex items-center space-x-4">
            {/* Sophisticated Emergency Beacon Icon */}
            <div className="relative w-14 h-14">
              {/* Outer emergency pulse rings */}
              <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-emergency/30 animate-pulse"></div>
              <div className="absolute inset-1 w-12 h-12 rounded-full border border-emergency/20"></div>
              
              {/* Main hexagonal emergency beacon */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8">
                {/* Hexagonal base */}
                <div className="w-8 h-8 bg-gradient-to-br from-emergency to-emergency/80 transform rotate-45 rounded-sm shadow-lg"></div>
                
                {/* Central protection core */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gradient-to-br from-primary to-primary/90 rounded-full shadow-md">
                  {/* Emergency signal cross */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-3 h-0.5 bg-white rounded-full"></div>
                    <div className="w-0.5 h-3 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                </div>
              </div>
              
              {/* Directional signal indicators */}
              <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
                <div className="w-1 h-2 bg-gradient-to-t from-primary to-transparent rounded-full"></div>
              </div>
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                <div className="w-1 h-2 bg-gradient-to-b from-primary to-transparent rounded-full"></div>
              </div>
              <div className="absolute left-1 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-1 bg-gradient-to-l from-primary to-transparent rounded-full"></div>
              </div>
              <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-1 bg-gradient-to-r from-primary to-transparent rounded-full"></div>
              </div>
            </div>
            
            {/* Professional Typography */}
            <div className="flex flex-col">
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-bold font-poppins text-foreground tracking-tight">
                  ICE
                </span>
                <span className="text-2xl font-bold font-poppins text-emergency tracking-tight">
                  SOS
                </span>
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.15em] -mt-1">
                Emergency Protection
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="text-foreground hover:text-primary transition-colors">Pricing</a>
            <a href="#support" className="text-foreground hover:text-primary transition-colors">Support</a>
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm" className="shadow-primary">
              Download App
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col space-y-4">
              <a href="#features" className="text-foreground hover:text-primary transition-colors">Features</a>
              <a href="#pricing" className="text-foreground hover:text-primary transition-colors">Pricing</a>
              <a href="#support" className="text-foreground hover:text-primary transition-colors">Support</a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
                <Button size="sm" className="shadow-primary">
                  Download App
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;