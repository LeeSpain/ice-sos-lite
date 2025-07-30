import { Button } from "@/components/ui/button";
import { Shield, Menu, X, Heart, Plus } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Professional Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              {/* Main logo container with layered design */}
              <div className="w-12 h-12 bg-gradient-to-br from-emergency via-emergency/90 to-emergency/80 rounded-2xl flex items-center justify-center shadow-lg border-2 border-white/20 backdrop-blur-sm">
                <div className="relative">
                  {/* Medical cross background */}
                  <Plus className="h-7 w-7 text-white absolute inset-0 opacity-30" strokeWidth={3} />
                  {/* Shield protection overlay */}
                  <Shield className="h-6 w-6 text-white relative z-10" strokeWidth={2.5} />
                </div>
              </div>
              {/* Status indicator dot */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white shadow-sm">
                <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xl font-bold font-poppins text-foreground leading-tight tracking-tight">
                ICE SOS
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-none">
                LITE
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