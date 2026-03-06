import React from "react";
import { Button } from "@/components/ui/button";
import { Shield, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useClaraChat } from "@/contexts/ClaraChatContext";

const FinalCTA: React.FC = () => {
  const { t } = useTranslation();
  const { openClaraChat } = useClaraChat();

  return (
    <section className="py-section">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-primary/10 to-emergency/10 rounded-3xl p-10 border border-primary/20">
              <h3 className="text-3xl font-bold mb-4 text-foreground">
                {t('finalCta.title')}
              </h3>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('finalCta.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-emergency hover:bg-emergency/90 text-white font-bold px-10 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Link to="/ai-register">
                    <Shield className="h-5 w-5 mr-2" />
                    {t('finalCta.startProtection')}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={openClaraChat}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {t('howItWorks.chatWithClara')}
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