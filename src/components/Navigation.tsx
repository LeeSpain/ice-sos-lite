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
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/contact" 
              className="text-sm font-medium text-foreground hover:text-primary transition-all duration-200 hover:scale-105 px-3 py-2 rounded-lg hover:bg-primary/5"
            >
              {t('nav.contact', 'Contact Us')}
            </Link>
            <IntroVideoModal 
              trigger={
                <button className="text-sm font-medium text-foreground hover:text-primary transition-all duration-200 hover:scale-105 px-3 py-2 rounded-lg hover:bg-primary/5">
                  {t('nav.introVideo', 'Intro Video')}
                </button>
              }
            />
            {language === 'es' && (
              <Link 
                to="/regional-center/spain" 
                className="text-sm font-medium text-foreground hover:text-primary transition-all duration-200 hover:scale-105 px-3 py-2 rounded-lg hover:bg-primary/5"
              >
                {t('nav.regionalCenter')}
              </Link>
            )}
            <div className="border-l border-border/30 pl-6 ml-2">
              <LanguageCurrencySelector compact />
            </div>
            <div className="flex items-center space-x-3">
              <Button asChild variant="outline" size="sm" className="font-medium hover:bg-primary/5 hover:border-primary/30 transition-all duration-200">
                <Link to="/auth">{t('nav.signIn')}</Link>
              </Button>
              <Button asChild size="sm" className="shadow-primary bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary font-medium transition-all duration-200 hover:scale-105">
                <Link to="/register">{t('nav.subscribeNow')}</Link>
              </Button>
            </div>
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
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="flex flex-col space-y-1 py-4">
              <div className="mb-4">
                <LanguageCurrencySelector />
              </div>
              <Link 
                to="/contact" 
                className="text-sm font-medium text-foreground hover:text-primary transition-all duration-200 px-4 py-3 rounded-lg hover:bg-primary/5"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.contact', 'Contact Us')}
              </Link>
              <IntroVideoModal 
                trigger={
                  <button 
                    className="text-left w-full text-sm font-medium text-foreground hover:text-primary transition-all duration-200 px-4 py-3 rounded-lg hover:bg-primary/5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('nav.introVideo', 'Intro Video')}
                  </button>
                }
              />
              {language === 'es' && (
                <Link 
                  to="/regional-center/spain" 
                  className="text-sm font-medium text-foreground hover:text-primary transition-all duration-200 px-4 py-3 rounded-lg hover:bg-primary/5"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.regionalCenter')}
                </Link>
              )}
              <div className="flex flex-col space-y-3 pt-6 mt-4 border-t border-border">
                <Button asChild variant="outline" size="sm" className="font-medium hover:bg-primary/5 hover:border-primary/30 transition-all duration-200">
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>{t('nav.signIn')}</Link>
                </Button>
                <Button asChild size="sm" className="shadow-primary bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary font-medium transition-all duration-200">
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>{t('nav.subscribeNow')}</Link>
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