import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useSiteContent } from "@/hooks/useSiteContent";
import { AppPreviewConfig } from "@/types/appPreview";
import { getTranslatedAppPreview } from "@/utils/appPreviewTranslations";
import { useTranslation } from 'react-i18next';
import LanguageCurrencySelector from '@/components/LanguageCurrencySelector';
import { usePreferences } from '@/contexts/PreferencesContext';
import IntroVideoModal from '@/components/IntroVideoModal';
import { useInteractionTracking } from '@/hooks/useInteractionTracking';
const SITE_CONTENT_KEY = "homepage_app_preview";

interface NavigationProps {
  onJoinNowClick?: () => void;
}

const Navigation = ({ onJoinNowClick }: NavigationProps = {}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const defaults = React.useMemo(() => getTranslatedAppPreview(t), [t]);
  const { value } = useSiteContent<AppPreviewConfig>(SITE_CONTENT_KEY, defaults);
  const { language } = usePreferences();
  const { trackButtonClick, trackLinkClick, trackVideoInteraction } = useInteractionTracking();

  const handleContactClick = () => {
    trackButtonClick('navigation', 'Contact Us', { location: 'header' });
  };

  const handleVideoClick = () => {
    trackVideoInteraction('video_modal_open', 'intro-video', 'Navigation Intro Video');
  };

  const handleSignInClick = () => {
    trackButtonClick('navigation', 'Sign In', { location: 'header' });
  };

  const handleJoinNowClick = () => {
    trackButtonClick('navigation', 'Join Now', { location: 'header' });
  };

  const handleLogoClick = () => {
    trackLinkClick('navigation', '/', 'Logo');
  };

  const handleRegionalCenterClick = () => {
    trackLinkClick('navigation', '/regional-center/spain', 'Regional Center Spain');
  };
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity" onClick={handleLogoClick}>
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold font-poppins text-foreground">{(value ?? defaults).appName}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Services Dropdown */}
            <div className="relative group">
              <Button 
                variant="ghost" 
                size="sm" 
                className="font-medium text-foreground hover:text-primary transition-all duration-200 hover:bg-primary/5"
              >
                Services
                <svg className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  <Link to="/emergency-response-services" className="block px-3 py-2 text-sm text-foreground hover:bg-primary/5 rounded-md transition-colors">
                    Emergency Response Services
                  </Link>
                  <Link to="/ai-emergency-assistant" className="block px-3 py-2 text-sm text-foreground hover:bg-primary/5 rounded-md transition-colors">
                    AI Emergency Assistant
                  </Link>
                  <Link to="/family-safety-monitoring" className="block px-3 py-2 text-sm text-foreground hover:bg-primary/5 rounded-md transition-colors">
                    Family Safety Monitoring
                  </Link>
                  <Link to="/senior-emergency-protection" className="block px-3 py-2 text-sm text-foreground hover:bg-primary/5 rounded-md transition-colors">
                    Senior Emergency Protection
                  </Link>
                </div>
              </div>
            </div>
            
            <Button asChild size="sm" className="bg-wellness hover:bg-wellness/90 text-black font-medium shadow-sm" onClick={handleContactClick}>
              <Link to="/contact">
                {t('nav.contact', 'Contact Us')}
              </Link>
            </Button>
            <IntroVideoModal 
              trigger={
                <Button size="sm" className="bg-wellness hover:bg-wellness/90 text-black font-medium shadow-sm" onClick={handleVideoClick}>
                  {t('nav.introVideo', 'Intro Video')}
                </Button>
              }
            />
            {language === 'es' && (
              <Link 
                to="/regional-center/spain" 
                className="text-sm font-medium text-foreground hover:text-primary transition-all duration-200 hover:scale-105 px-3 py-2 rounded-lg hover:bg-primary/5"
                onClick={handleRegionalCenterClick}
              >
                {t('nav.regionalCenter')}
              </Link>
            )}
            <div className="border-l border-border/30 pl-6 ml-2">
              <LanguageCurrencySelector compact />
            </div>
            <div className="flex items-center space-x-3">
              <Button asChild variant="outline" size="sm" className="font-medium hover:bg-primary/5 hover:border-primary/30 transition-all duration-200" onClick={handleSignInClick}>
                <Link to="/auth">{t('nav.signIn')}</Link>
              </Button>
              <Button asChild
                size="sm" 
                className="bg-wellness text-black hover:bg-wellness/90 font-medium transition-all duration-200 hover:scale-105 shadow-lg"
                onClick={handleJoinNowClick}
              >
                <Link to="/ai-register">{t('nav.joinNow', 'Join Now')}</Link>
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
            <div className="flex flex-col space-y-3 py-4">
              <div className="mb-4">
                <LanguageCurrencySelector />
              </div>
              <Button asChild size="sm" className="bg-wellness hover:bg-wellness/90 text-white font-medium shadow-sm mx-4">
                <Link to="/contact" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.contact', 'Contact Us')}
                </Link>
              </Button>
              <div className="mx-4">
                <IntroVideoModal 
                  trigger={
                    <Button 
                      size="sm" 
                      className="w-full bg-wellness hover:bg-wellness/90 text-white font-medium shadow-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('nav.introVideo', 'Intro Video')}
                    </Button>
                  }
                />
              </div>
              {language === 'es' && (
                <Link 
                  to="/regional-center/spain" 
                  className="text-sm font-medium text-foreground hover:text-primary transition-all duration-200 px-4 py-3 rounded-lg hover:bg-primary/5"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t('nav.regionalCenter')}
                </Link>
              )}
              <div className="flex flex-col space-y-3 pt-6 mt-4 border-t border-border mx-4">
                <Button asChild variant="outline" size="sm" className="font-medium hover:bg-primary/5 hover:border-primary/30 transition-all duration-200">
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>{t('nav.signIn')}</Link>
                </Button>
                <Button asChild
                  size="sm" 
                  className="bg-wellness text-white hover:bg-wellness/90 font-medium transition-all duration-200 shadow-lg"
                >
                  <Link to="/ai-register" onClick={() => setIsMenuOpen(false)}>
                    {t('nav.joinNow', 'Join Now')}
                  </Link>
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