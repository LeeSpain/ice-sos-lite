
import React, { useEffect } from 'react';
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
// import MetricPreview from "@/components/MetricPreview";
import Pricing from "@/components/Pricing";

import FamilyCarerAccess from "@/components/FamilyCarerAccess";
import AppDownload from "@/components/AppDownload";
import Footer from "@/components/Footer";
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

  // Preload critical images
  useEffect(() => {
    preloadCriticalImages();
  }, []);

  const handleEmmaClick = () => {
    // Emma click handler for Hero component
    console.log('Emma clicked from Hero');
  };

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

      <Hero onEmmaClick={handleEmmaClick} />
      <Features />
      {/* <MetricPreview /> */}

      {/* Live App Preview Section (reflects admin "App Testing" settings) */}
      <AppPreviewSection />

      <Pricing />
      
      {/* Family & Carer Access moved below Pricing, above AppDownload */}
      <FamilyCarerAccess />
      
      <AppDownload />
      <Footer />
    </div>
  );
};

export default Index;
