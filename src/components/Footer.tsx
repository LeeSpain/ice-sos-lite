import React from "react";
import { Shield, Github, Twitter, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useSiteContent } from "@/hooks/useSiteContent";
import { AppPreviewConfig, getDefaultAppPreview } from "@/types/appPreview";
import { useTranslation } from 'react-i18next';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
const SITE_CONTENT_KEY = "homepage_app_preview";

const Footer = () => {
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
const defaults = React.useMemo(() => getDefaultAppPreview(), []);
const { value } = useSiteContent<AppPreviewConfig>(SITE_CONTENT_KEY, defaults);
const { t } = useTranslation();
  const handleDashboardClick = (e: React.MouseEvent, dashboardType: 'member' | 'admin') => {
    e.preventDefault();
    
    console.log('Dashboard click:', { user: !!user, isAdmin, loading, roleLoading, dashboardType });
    
    // If still loading auth state, wait
    if (loading) {
      console.log('Auth still loading, waiting...');
      return;
    }

    // If no user, redirect to auth
    if (!user) {
      console.log('No user, redirecting to auth');
      navigate('/auth');
      return;
    }

    // User is authenticated, navigate to appropriate dashboard
    // If role is still loading, default to member dashboard for member clicks
    // and allow admin dashboard access for admin clicks (will be protected by route)
    if (dashboardType === 'admin') {
      if (roleLoading) {
        console.log('Role loading, going to admin dashboard (route will handle protection)');
        navigate('/admin-dashboard');
      } else if (isAdmin) {
        console.log('Admin user, going to admin dashboard');
        navigate('/admin-dashboard');
      } else {
        console.log('Non-admin user, redirecting to member dashboard');
        navigate('/member-dashboard');
      }
    } else {
      console.log('Going to member dashboard');
      navigate('/member-dashboard');
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
              <span className="text-lg font-bold font-poppins text-foreground">{(value ?? defaults).appName}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Emergency response and family safety platform providing peace of mind through advanced protection services.
            </p>
          </div>

          {/* Quick Links */}
<div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('footer.quickLinks')}</h3>
            <div className="space-y-2">
              <a href="#features" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('nav.features')}
              </a>
              <a href="#pricing" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('footer.pricing')}
              </a>
              <Link to="/devices/ice-sos-pendant" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('footer.devices')}
              </Link>
              <Link to="/support" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('footer.supportLink')}
              </Link>
            </div>
          </div>

          {/* Account & Legal */}
<div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('footer.account')}</h3>
            <div className="space-y-2">
              {!user ? (
                <>
                  <Link to="/auth" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    {t('footer.signIn')}
                  </Link>
                  <Link to="/register" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    {t('footer.subscribe')}
                  </Link>
                </>
              ) : (
                <Link to="/auth" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.signOut')}
                </Link>
              )}
              <a 
                href="#" 
                onClick={(e) => handleDashboardClick(e, 'member')}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              >
                {loading ? 'Loading...' : t('footer.membersDashboard')}
              </a>
              <Link 
                to="/admin-dashboard"
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t('footer.adminDashboard')}
              </Link>
            </div>
          </div>

          {/* Contact & Social */}
<div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('footer.connect')}</h3>
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
              © 2024 {(value ?? defaults).appName}. {t('footer.rights')}
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('footer.terms')}
              </Link>
              <Link to="/support" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('footer.supportLink')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;