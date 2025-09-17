
import React, { useEffect } from 'react';
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import FamilyCarerAccess from "@/components/FamilyCarerAccess";
import Pricing from "@/components/Pricing";
import AppDownload from "@/components/AppDownload";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import { useScrollToTop } from '@/hooks/useScrollToTop';
import AppPreviewSection from '@/components/AppPreviewSection';
import { useTranslation } from 'react-i18next';
import { PageSEO } from '@/components/PageSEO';
import { usePerformanceMonitoring } from "@/hooks/usePerformanceMonitoring";
import { preloadCriticalImages } from "@/utils/imageOptimization";
import { useEmmaChat } from "@/contexts/EmmaChatContext";
import { FirstVisitPreferencesModal } from "@/components/FirstVisitPreferencesModal";
import StructuredData from '@/components/StructuredData';
import AIBusinessProfile from '@/components/AIBusinessProfile';
import BusinessAPIEndpoints from '@/components/BusinessAPIEndpoints';
import AIContentDiscovery from '@/components/AIContentDiscovery';
import EnhancedRobotsTxt from '@/components/EnhancedRobotsTxt';
import EnhancedSitemapGenerator from '@/components/EnhancedSitemapGenerator';


const Index = () => {
  useScrollToTop();
  usePerformanceMonitoring();
  const { t } = useTranslation();
  const { openEmmaChat } = useEmmaChat();

  // Preload critical images
  useEffect(() => {
    preloadCriticalImages();
  }, []);

  return (
    <div className="min-h-screen">
      <PageSEO pageType="home" />
      <StructuredData type="Organization" />
      <AIBusinessProfile />
      <BusinessAPIEndpoints />
      <AIContentDiscovery pageType="home" />
      <EnhancedRobotsTxt />
      <EnhancedSitemapGenerator />
      <FirstVisitPreferencesModal />
      <Navigation />

      <Hero onEmmaClick={openEmmaChat} />
      
      
      <Features />

      {/* Live App Preview Section (reflects admin "App Testing" settings) */}
      <AppPreviewSection />
      
      <Pricing />
      
      <FamilyCarerAccess />
      
      <AppDownload />
      <FinalCTA />
      <Footer />
      
    </div>
  );
};

export default Index;
