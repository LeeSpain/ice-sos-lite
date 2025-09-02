import React from "react";
import { Button } from "@/components/ui/button";
import { Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const FinalCTA: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-section mb-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            {/* Call to Action */}
            <div className="bg-gradient-to-r from-primary/10 to-emergency/10 rounded-3xl p-8 border border-primary/20">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                {t('finalCta.title')}
              </h3>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                {t('finalCta.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to="/ai-register">
                    <Shield className="h-5 w-5 mr-2" />
                    {t('finalCta.startProtection')}
                  </Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to="/family-carer-access">
                    <Users className="h-5 w-5 mr-2" />
                    {t('finalCta.connectFamily')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;