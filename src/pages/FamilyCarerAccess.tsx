import React from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from '@/components/SEO';
import { HeroSection } from '@/components/family-carer/HeroSection';
import { HowItWorksSection } from '@/components/family-carer/HowItWorksSection';
import { ServiceBenefitsSection } from '@/components/family-carer/ServiceBenefitsSection';
import { AccessLevelsSection } from '@/components/family-carer/AccessLevelsSection';
import { PricingSection } from '@/components/family-carer/PricingSection';
import { CallToActionSection } from '@/components/family-carer/CallToActionSection';

const FamilyCarerAccessPage = () => {
  return (
    <div className="min-h-screen">
      <SEO 
        title="Family Emergency Coordination - Connect Your Loved Ones | ICE SOS"
        description="Professional family emergency coordination system. Instant SOS alerts, real-time location sharing during emergencies only. Privacy-first family safety solution."
        keywords={["family emergency coordination", "emergency alerts", "family safety", "SOS system", "emergency response"]}
      />
      <Navigation />
      
      <main>
        <HeroSection />
        <HowItWorksSection />
        <ServiceBenefitsSection />
        <AccessLevelsSection />
        <PricingSection />
        <CallToActionSection />
      </main>
      
      <Footer />
    </div>
  );
};

export default FamilyCarerAccessPage;