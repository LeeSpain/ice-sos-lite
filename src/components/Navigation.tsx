
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative w-10 h-10 bg-gradient-to-br from-primary to-guardian rounded-xl flex items-center justify-center shadow-primary">
              {/* Emergency Shield Base */}
              <div className="absolute inset-1 bg-primary/20 rounded-lg"></div>
              
              {/* Central Emergency Cross */}
              <div className="relative z-10">
                <div className="w-1 h-6 bg-emergency rounded-full absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                <div className="w-6 h-1 bg-emergency rounded-full absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              
              {/* Emergency Signal Lines */}
              <div className="absolute -top-1 -right-1">
                <div className="w-3 h-0.5 bg-emergency rounded-full transform rotate-45 animate-pulse"></div>
                <div className="w-2 h-0.5 bg-emergency/70 rounded-full transform rotate-45 mt-0.5 ml-0.5"></div>
              </div>
              
              <div className="absolute -bottom-1 -left-1">
                <div className="w-3 h-0.5 bg-emergency rounded-full transform -rotate-45 animate-pulse delay-75"></div>
                <div className="w-2 h-0.5 bg-emergency/70 rounded-full transform -rotate-45 mt-0.5 mr-0.5"></div>
              </div>
              
              {/* Corner Emergency Indicators */}
              <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-emergency rounded-full animate-pulse delay-150"></div>
              <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-emergency rounded-full animate-pulse delay-300"></div>
              <div className="absolute bottom-0.5 left-0.5 w-1 h-1 bg-emergency rounded-full animate-pulse delay-450"></div>
              <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-emergency rounded-full animate-pulse delay-600"></div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xl font-bold font-poppins text-foreground leading-none">ICE SOS</span>
              <span className="text-xs font-medium text-muted-foreground leading-none">Emergency Protection</span>
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
