import { Button } from "@/components/ui/button";
import { Shield, Heart, MapPin, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
const heroImage = "/lovable-uploads/7ad599e6-d1cd-4a1b-84f4-9b6b1e4242e1.png";

interface HeroProps {
  onEmmaClick?: () => void;
}

const Hero = ({ onEmmaClick }: HeroProps) => {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-hero shadow-2xl">
      {/* Darker Shadow Overlay for Professional Look */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[size:20px_20px]" />
      </div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left text-white">
            <div className="inline-flex items-center space-x-2 bg-emergency/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-lg border border-emergency/30">
              <Shield className="h-4 w-4 text-emergency-glow" />
              <span className="text-sm font-medium text-white">{t('hero.badge')}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
              {t('hero.titlePart1')} 
              <span className="text-emergency-glow drop-shadow-md">{t('hero.titleEmphasis')}</span> {t('hero.titlePart2')}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white leading-relaxed font-medium drop-shadow-sm">
              {t('hero.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <Button 
                asChild 
                size="xl" 
                className="bg-emergency text-black hover:bg-emergency/90 shadow-glow hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg px-8 py-4 rounded-xl border-2 border-emergency-glow/20"
              >
                <Link to="/register">{t('hero.ctaJoin')}</Link>
              </Button>
              <Button 
                size="xl" 
                className="bg-emergency text-black hover:bg-emergency/90 shadow-glow hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg px-8 py-4 rounded-xl border-2 border-emergency-glow/20"
                onClick={onEmmaClick}
              >
                {t('hero.ctaTalk')}
              </Button>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src={heroImage} 
                alt="ICE SOS Emergency Protection App Interface"
                className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl"
                loading="eager"
                decoding="async"
              />
            </div>
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-guardian/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;