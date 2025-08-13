
import React, { useState, useCallback, useEffect } from 'react';
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
// import MetricPreview from "@/components/MetricPreview";
import Pricing from "@/components/Pricing";

import AppDownload from "@/components/AppDownload";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ai-chat/ChatWidget";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles } from 'lucide-react';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import AppPreviewSection from '@/components/AppPreviewSection';
import { useTranslation } from 'react-i18next';
import SEO from '@/components/SEO';
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import { preloadCriticalImages } from "@/utils/imageOptimization";

const Index = () => {
  useScrollToTop();
  usePerformanceMonitoring();
  const { t } = useTranslation();
  const [isEmmaOpen, setIsEmmaOpen] = useState(false);

  // Preload critical images
  useEffect(() => {
    preloadCriticalImages();
  }, []);

  const handleEmmaClick = useCallback(() => {
    setIsEmmaOpen(true);
  }, []);

  const handleEmmaClose = useCallback(() => {
    setIsEmmaOpen(false);
  }, []);

  return (
    <div className="min-h-screen">
      <SEO 
        title="ICE SOS Lite – Emergency SOS, Bluetooth SOS App"
        description="Tap once for immediate emergency help. Bluetooth SOS, secure profiles, regional services."
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "ICE SOS Lite",
          "url": typeof window !== 'undefined' ? window.location.origin : 'https://example.com'
        }}
      />
      <Navigation />

      <div className="fixed top-28 right-4 z-50">
        <div className="relative group cursor-pointer" onClick={handleEmmaClick}>
          {/* Floating animation wrapper */}
          <div className="animate-bounce">
            {/* Main container with gradient and glow */}
            <div className="bg-gradient-to-br from-primary/20 via-white to-emergency/10 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-primary/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-emergency/20 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              
              {/* Content */}
              <div className="relative flex items-center gap-3">
                {/* Enhanced Avatar */}
                <div className="relative">
                  <Avatar className="w-12 h-12 border-3 border-gradient-to-r from-primary to-emergency shadow-lg ring-2 ring-white/50">
                    <AvatarImage src="/emma-avatar.png" className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-emergency text-white font-bold text-lg">
                      E
                    </AvatarFallback>
                  </Avatar>
                  {/* Online status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                  {/* Sparkle effect */}
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="h-5 w-5 text-primary animate-spin" style={{animationDuration: '3s'}} />
                  </div>
                </div>
                
                {/* Text content */}
                <div className="hidden sm:block">
                  <div className="text-base font-bold bg-gradient-to-r from-primary to-emergency bg-clip-text text-transparent">
                    Emma AI
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {t('index.emma.roleCustomerService', { defaultValue: 'Customer Service' })}
                  </div>
                  <div className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {t('index.emma.online', { defaultValue: 'Online & Ready' })}
                  </div>
                </div>
                
                {/* Floating action indicator */}
                <div className="flex flex-col gap-1">
                  <div className="w-1 h-1 bg-primary rounded-full animate-ping"></div>
                  <div className="w-1 h-1 bg-emergency rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                  <div className="w-1 h-1 bg-primary rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                </div>
              </div>
              
              {/* Hover tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                {t('index.emma.tooltip', { defaultValue: 'Click to chat with Emma! 💬' })}
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
          
          {/* Ambient particles */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-2 left-2 w-1 h-1 bg-primary rounded-full animate-pulse opacity-60"></div>
            <div className="absolute bottom-3 right-6 w-1 h-1 bg-emergency rounded-full animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-8 right-2 w-1 h-1 bg-primary rounded-full animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
          </div>
        </div>
      </div>

      <Hero onEmmaClick={handleEmmaClick} />
      <Features />
      {/* <MetricPreview /> */}

      {/* Live App Preview Section (reflects admin "App Testing" settings) */}
      <AppPreviewSection />

      <Pricing />
      
      <AppDownload />
      <Footer />
      
      {/* Emma Chat Widget */}
      <ChatWidget 
        isOpen={isEmmaOpen} 
        onClose={handleEmmaClose}
        userName={t('common.visitor', { defaultValue: 'Visitor' })}
        context="homepage"
      />
    </div>
  );
};

export default Index;
