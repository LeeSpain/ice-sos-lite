import { Shield, Github, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

const Footer = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();

  const handleDashboardClick = (e: React.MouseEvent, dashboardType: 'member' | 'admin') => {
    e.preventDefault();
    
    if (!user) {
      // Not authenticated, go to auth page
      window.location.href = '/auth';
      return;
    }

    if (dashboardType === 'admin') {
      if (isAdmin) {
        window.location.href = '/admin-dashboard';
      } else {
        // User is authenticated but not admin, redirect to member dashboard
        window.location.href = '/dashboard';
      }
    } else {
      // Member dashboard
      window.location.href = '/dashboard';
    }
  };

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold font-poppins text-foreground">ICE SOS Lite</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Emergency response and family safety platform providing peace of mind through advanced protection services.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <div className="space-y-2">
              <a href="#features" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Features
              </a>
              <a href="#pricing" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Pricing
              </a>
              <a href="#support" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Support
              </a>
            </div>
          </div>

          {/* Account & Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Account</h3>
            <div className="space-y-2">
              {!user ? (
                <>
                  <Link to="/auth" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    Sign In
                  </Link>
                  <Link to="/register" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    Subscribe
                  </Link>
                </>
              ) : (
                <Link to="/auth" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Sign Out
                </Link>
              )}
              <a 
                href="#" 
                onClick={(e) => handleDashboardClick(e, 'member')}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Members Dashboard
              </a>
              <a 
                href="#" 
                onClick={(e) => handleDashboardClick(e, 'admin')}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                Admin Dashboard
              </a>
            </div>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Connect</h3>
            <div className="flex space-x-3">
              <a 
                href="mailto:support@icesoslite.com" 
                className="p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 text-muted-foreground" />
              </a>
              <a 
                href="#" 
                className="p-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              24/7 Emergency Support Available
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © 2024 ICE SOS Lite. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;