import { Button } from "@/components/ui/button";
import { Shield, Heart, MapPin, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
const heroImage = '/lovable-uploads/141f77cc-c074-48dc-95f1-f886baacd2da.png?v=1';


interface HeroProps {
  onEmmaClick?: () => void;
}

const Hero = ({ onEmmaClick }: HeroProps) => {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-hero shadow-2xl">
      
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
                alt="ICE Bluetooth pendant and smartphone with SOS app - hero image"
                className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                sizes="(min-width: 1024px) 512px, 90vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;