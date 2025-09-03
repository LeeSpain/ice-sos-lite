import React from "react";
import { Shield, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { AppPreviewConfig } from "@/types/appPreview";
import { getTranslatedAppPreview } from "@/utils/appPreviewTranslations";
import { useTranslation } from 'react-i18next';
import { useInteractionTracking } from "@/hooks/useInteractionTracking";

const SITE_CONTENT_KEY = "homepage_app_preview";

const Footer = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const defaults = React.useMemo(() => getTranslatedAppPreview(t), [t]);
  const { value } = useSiteContent<AppPreviewConfig>(SITE_CONTENT_KEY, defaults);
  const { trackLinkClick } = useInteractionTracking();

  const handleFooterLinkClick = (linkType: string, destination: string, text: string) => {
    trackLinkClick('footer', destination, text);
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
              {t('footer.companyDescription')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('footer.quickLinks')}</h3>
            <div className="space-y-2">
              <Link to="/blog" className="block text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => handleFooterLinkClick('blog', '/blog', 'Blog')}>
                {t('footer.blog')}
              </Link>
              <Link to="/devices/ice-sos-pendant" className="block text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => handleFooterLinkClick('products', '/devices/ice-sos-pendant', 'Safety Products')}>
                {t('footer.safetyProducts')}
              </Link>
              <Link to="/regional-center/spain" className="block text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => handleFooterLinkClick('regional', '/regional-center/spain', 'Regional Services')}>
                {t('footer.regionalServices')}
              </Link>
              <Link to="/family-carer-access" className="block text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => handleFooterLinkClick('family', '/family-carer-access', 'Family Carer Access')}>
                {t('footer.familyCarerAccess')}
              </Link>
            </div>
          </div>

          {/* Account & Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('footer.account')}</h3>
            <div className="space-y-2">
              {!user ? (
                <>
                  <Link to="/auth" className="block text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => handleFooterLinkClick('auth', '/auth', 'Sign In')}>
                    {t('footer.signIn')}
                  </Link>
                  <Link to="/ai-register" className="block text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => handleFooterLinkClick('auth', '/ai-register', 'Subscribe')}>
                    {t('footer.subscribe')}
                  </Link>
                </>
              ) : (
                <Link to="/auth" className="block text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => handleFooterLinkClick('auth', '/auth', 'Sign Out')}>
                  {t('footer.signOut')}
                </Link>
              )}
            </div>
          </div>

          {/* Legal Compliance */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Legal & Compliance</h3>
            <div className="space-y-2">
              <a href="/privacy-policy.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="/terms-of-service.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="/emergency-liability.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Emergency Liability
              </a>
              <a href="/medical-data-compliance.html" target="_blank" rel="noopener noreferrer" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                Medical Compliance
              </a>
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('footer.connect')}</h3>
            <div className="space-y-2">
              <Link to="/contact" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => handleFooterLinkClick('contact', '/contact', 'Contact Us')}>
                <Mail className="h-4 w-4" />
                {t('footer.contactUs')}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
<p className="text-sm text-muted-foreground">
              © 2024 {(value ?? defaults).appName}. {t('footer.rights')}
            </p>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => handleFooterLinkClick('legal', '/privacy', 'Privacy')}>
                {t('footer.privacy')}
              </Link>
              <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => handleFooterLinkClick('legal', '/terms', 'Terms')}>
                {t('footer.terms')}
              </Link>
              <Link to="/support" className="text-sm text-muted-foreground hover:text-primary transition-colors" onClick={() => handleFooterLinkClick('support', '/support', 'Support')}>
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