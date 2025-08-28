import { Button } from "@/components/ui/button";
import { Shield, Heart, MapPin, Smartphone, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import OptimizedImage from "@/components/ui/optimized-image";
import { getImageSizes, generateBlurPlaceholder } from "@/utils/imageOptimization";
import { IntroVideoModal } from "@/components/IntroVideoModal";

const heroImage = '/lovable-uploads/141f77cc-c074-48dc-95f1-f886baacd2da.png?v=1';


interface HeroProps {
  onEmmaClick?: () => void;
}

const Hero = ({ onEmmaClick }: HeroProps) => {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-r from-primary to-primary/80">
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left text-white">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">{t('hero.badge')}</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
              {t('hero.titlePart1')} 
              <span className="text-yellow-300">{t('hero.titleEmphasis')}</span> {t('hero.titlePart2')}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
              {t('hero.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <Button 
                asChild 
                size="lg"
              >
                <Link to="/register">{t('hero.ctaJoin')}</Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={onEmmaClick}
              >
                {t('hero.ctaTalk')}
              </Button>
              <IntroVideoModal 
                defaultVideoId="meet-emma"
                trigger={
                  <Button 
                    size="lg" 
                    variant="outline"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Meet Emma
                  </Button>
                }
              />
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <OptimizedImage 
                src={heroImage} 
                alt="ICE Bluetooth pendant and smartphone with SOS app - hero image"
                className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl"
                priority={true}
                sizes={getImageSizes('hero')}
                blurDataURL={generateBlurPlaceholder(400, 600)}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;