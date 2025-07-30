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
            {/* Emergency Communication Hub Icon */}
            <div className="relative w-14 h-14">
              {/* Emergency beacon base - smartphone shape */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-7 h-10 bg-gradient-to-b from-foreground to-foreground/80 rounded-lg shadow-lg">
                {/* Screen area */}
                <div className="absolute top-1 left-1 right-1 bottom-1 bg-gradient-to-br from-primary to-primary/90 rounded-md">
                  {/* Emergency pulse heartbeat */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center">
                    <div className="w-0.5 h-1 bg-white"></div>
                    <div className="w-0.5 h-2 bg-white ml-0.5"></div>
                    <div className="w-0.5 h-3 bg-white ml-0.5"></div>
                    <div className="w-0.5 h-2 bg-white ml-0.5"></div>
                    <div className="w-0.5 h-1 bg-white ml-0.5"></div>
                  </div>
                </div>
              </div>
              
              {/* Emergency signal waves emanating from device */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
                <div className="w-8 h-4 border-2 border-emergency rounded-b-full border-t-0 opacity-60"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-3 border-2 border-emergency rounded-b-full border-t-0 opacity-80"></div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4 h-2 border-2 border-emergency rounded-b-full border-t-0"></div>
              </div>
              
              {/* Emergency alert indicators */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-emergency rounded-full animate-pulse"></div>
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-primary rounded-full"></div>
              
              {/* Life connection indicator */}
              <div className="absolute bottom-1 right-1 w-2 h-2 bg-gradient-to-br from-primary to-emergency rounded-full shadow-sm"></div>
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