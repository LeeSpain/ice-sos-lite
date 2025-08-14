import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";
import { AppPreviewConfig, getDefaultAppPreview } from "@/types/appPreview";
import { useTranslation } from 'react-i18next';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { usePreferences } from '@/contexts/PreferencesContext';
import IntroVideoModal from '@/components/IntroVideoModal';
const SITE_CONTENT_KEY = "homepage_app_preview";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const defaults = React.useMemo(() => getDefaultAppPreview(), []);
  const { value } = useSiteContent<AppPreviewConfig>(SITE_CONTENT_KEY, defaults);
  const { t } = useTranslation();
  const { language } = usePreferences();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold font-poppins text-foreground">{(value ?? defaults).appName}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
              {t('nav.contact', 'Contact Us')}
            </Link>
            <IntroVideoModal 
              trigger={
                <button className="text-foreground hover:text-primary transition-colors text-sm">
                  {t('nav.introVideo', 'Intro Video')}
                </button>
              }
            />
            {language === 'es' && (
              <Link to="/regional-center/spain" className="text-foreground hover:text-primary transition-colors">
                {t('nav.regionalCenter')}
              </Link>
            )}
            <LanguageCurrencySelector compact />
            <Button asChild variant="outline" size="sm">
              <Link to="/auth">{t('nav.signIn')}</Link>
            </Button>
            <Button asChild size="sm" className="shadow-primary">
              <Link to="/register">{t('nav.subscribeNow')}</Link>
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
              <LanguageCurrencySelector />
              <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
                {t('nav.contact', 'Contact Us')}
              </Link>
              <IntroVideoModal 
                trigger={
                  <button className="text-left text-foreground hover:text-primary transition-colors">
                    {t('nav.introVideo', 'Intro Video')}
                  </button>
                }
              />
              {language === 'es' && (
                <Link to="/regional-center/spain" className="text-foreground hover:text-primary transition-colors">
                  {t('nav.regionalCenter')}
                </Link>
              )}
              <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                <Button asChild variant="outline" size="sm">
                  <Link to="/auth">{t('nav.signIn')}</Link>
                </Button>
                <Button asChild size="sm" className="shadow-primary">
                  <Link to="/register">{t('nav.subscribeNow')}</Link>
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