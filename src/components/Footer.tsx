import React from "react";
import { Shield, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteContent } from "@/hooks/useSiteContent";
import { AppPreviewConfig, getDefaultAppPreview } from "@/types/appPreview";
import { useTranslation } from 'react-i18next';

const SITE_CONTENT_KEY = "homepage_app_preview";

const Footer = () => {
  const { user } = useAuth();
  const defaults = React.useMemo(() => getDefaultAppPreview(), []);
  const { value } = useSiteContent<AppPreviewConfig>(SITE_CONTENT_KEY, defaults);
  const { t } = useTranslation();

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
              <Link to="/blog" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('footer.blog')}
              </Link>
              <Link to="/devices/ice-sos-pendant" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('footer.safetyProducts')}
              </Link>
              <Link to="/regional-center/spain" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                {t('footer.regionalServices')}
              </Link>
              <Link to="/family-carer-access" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
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
                  <Link to="/auth" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    {t('footer.signIn')}
                  </Link>
                  <Link to="/ai-register" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                    {t('footer.subscribe')}
                  </Link>
                </>
              ) : (
                <Link to="/auth" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.signOut')}
                </Link>
              )}
            </div>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('footer.connect')}</h3>
            <div className="space-y-2">
              <Link to="/contact" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
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