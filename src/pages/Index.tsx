import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import MetricPreview from "@/components/MetricPreview";
import Pricing from "@/components/Pricing";
import ChatWidget from "@/components/ai-chat/ChatWidget";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <Features />
      <MetricPreview />
      <Pricing />
      <ChatWidget />
    </div>
  );
};

export default Index;
