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
              <span className="text-wellness drop-shadow-md">{t('hero.titleEmphasis')}</span> {t('hero.titlePart2')}
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-white leading-relaxed font-medium drop-shadow-sm">
              {t('hero.description')}
            </p>
            
            {/* App Selection */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-white">Choose Your App:</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center mb-3">
                    <Shield className="h-6 w-6 text-emergency-glow mr-3" />
                    <h3 className="text-xl font-semibold text-white">SOS Emergency App</h3>
                  </div>
                  <p className="text-white/80 mb-4">For owners - one-tap emergency alerts with location sharing</p>
                  <Button asChild className="w-full bg-emergency text-white hover:bg-emergency/90">
                    <Link to="/auth">Get SOS App</Link>
                  </Button>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex items-center mb-3">
                    <Heart className="h-6 w-6 text-wellness mr-3" />
                    <h3 className="text-xl font-semibold text-white">Family Tracker</h3>
                  </div>
                  <p className="text-white/80 mb-4">For family/carers - monitor and protect your loved ones</p>
                  <Button asChild variant="outline" className="w-full border-wellness text-wellness hover:bg-wellness hover:text-black">
                    <Link to="/family-carer-access">Get Family App</Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start">
              <Button 
                size="xl" 
                className="bg-wellness text-black hover:bg-wellness/90 shadow-glow hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg px-8 py-4 rounded-xl border-2 border-wellness/20"
                onClick={onEmmaClick}
              >
                {t('hero.ctaTalk')}
              </Button>
              <IntroVideoModal 
                defaultVideoId="meet-emma"
                trigger={
                  <Button 
                    size="xl" 
                    className="bg-wellness text-black hover:bg-wellness/90 shadow-glow hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold text-lg px-8 py-4 rounded-xl border-2 border-wellness/20"
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