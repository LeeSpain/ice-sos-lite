
import React, { useEffect } from 'react';
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
// import MetricPreview from "@/components/MetricPreview";
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
import { FreeTrialPopup } from "@/components/FreeTrialPopup";
import { useFreeTrialPopup } from "@/hooks/useFreeTrialPopup";
import { useState } from "react";

const Index = () => {
  useScrollToTop();
  usePerformanceMonitoring();
  const { t } = useTranslation();
  const { openEmmaChat } = useEmmaChat();
  const { showPopup, closePopup } = useFreeTrialPopup();
  const [showFreeTrialPopup, setShowFreeTrialPopup] = useState(false);

  // Preload critical images
  useEffect(() => {
    preloadCriticalImages();
  }, []);

  return (
    <div className="min-h-screen">
      <PageSEO pageType="home" />
      <FirstVisitPreferencesModal />
      <Navigation />

      {/* Quick Access for returning users */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
        <a
          href="/dashboard"
          className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          Open My App
        </a>
      </div>

      <Hero onEmmaClick={openEmmaChat} />
      
      
      <Features />
      {/* <MetricPreview /> */}

      {/* Live App Preview Section (reflects admin "App Testing" settings) */}
      <AppPreviewSection />

      <Pricing />
      
      
      <AppDownload />
      <FinalCTA />
      <Footer />
      
      {/* Free Trial Popups - Both rendered at root level */}
      {showPopup && <FreeTrialPopup onClose={closePopup} />}
      {showFreeTrialPopup && <FreeTrialPopup onClose={() => setShowFreeTrialPopup(false)} />}
    </div>
  );
};

export default Index;
