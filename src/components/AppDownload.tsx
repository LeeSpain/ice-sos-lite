import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Download, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const AppDownload = () => {
  const { t } = useTranslation();
  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mb-6 border border-primary/20">
            <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium text-primary">{t('appDownload.platformBadge')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            {t('appDownload.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('appDownload.subtitle')}
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="relative border border-border/50 bg-card/80 backdrop-blur-sm shadow-lg overflow-hidden max-w-4xl mx-auto">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary to-secondary"></div>
          
          <CardContent className="p-8 md:p-12">
            {/* App Info */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary shadow-lg rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Smartphone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
                {t('appDownload.appName')}
              </h3>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {t('appDownload.heroDescription')}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-sm text-foreground mb-2">{t('appDownload.features.emergencySOS.title')}</h4>
                <p className="text-xs text-muted-foreground">{t('appDownload.features.emergencySOS.description')}</p>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl flex items-center justify-center">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-sm text-foreground mb-2">{t('appDownload.features.globalCoverage.title')}</h4>
                <p className="text-xs text-muted-foreground">{t('appDownload.features.globalCoverage.description')}</p>
              </div>
              
              <div className="text-center p-4 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <Check className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-semibold text-sm text-foreground mb-2">{t('appDownload.features.instantSetup.title')}</h4>
                <p className="text-xs text-muted-foreground">{t('appDownload.features.instantSetup.description')}</p>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="text-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                <Link to="/ai-register" className="flex items-center">
                  <Download className="mr-3 h-5 w-5" />
                  {t('appDownload.cta')}
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Free to download • No credit card required
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <div className="text-center max-w-4xl mx-auto mt-16">
          <div className="bg-muted/50 rounded-lg p-8">
            <h3 className="text-xl font-semibold mb-4">{t('appDownload.infoTitle')}</h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-primary mb-2">{t('appDownload.planFeaturesTitle')}</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t('appDownload.bullets.noFees')}</li>
                  <li>• {t('appDownload.bullets.cancelAnytime')}</li>
                  <li>• {t('appDownload.bullets.hardwareSeparate')}</li>
                  <li>• {t('appDownload.bullets.supportIncluded')}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">{t('appDownload.cancellationTitle')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('appDownload.cancellationDescription')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownload;