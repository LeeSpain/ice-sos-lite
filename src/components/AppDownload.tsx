import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Download, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const AppDownload = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-secondary/10 to-primary/5">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black bg-white p-4 rounded-lg shadow-sm mb-4 inline-block">
            {t('appDownload.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('appDownload.subtitle')}
          </p>
        </div>

        {/* Enhanced App Download Section */}
        <Card className="relative border-2 border-primary/20 bg-white shadow-2xl overflow-hidden max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5"></div>
          <CardHeader className="relative text-center py-12 px-8">
            <Badge className="bg-green-600 text-white w-fit mx-auto mb-6 text-sm font-semibold px-6 py-3 shadow-lg rounded-full">
              ⚡ {t('appDownload.platformBadge')}
            </Badge>
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-primary to-secondary shadow-2xl rounded-3xl flex items-center justify-center border-4 border-white">
              <Smartphone className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-4xl md:text-6xl font-bold mb-6 text-black">
              {t('appDownload.appName')}
            </CardTitle>
            <CardDescription className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              {t('appDownload.heroDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="relative px-8 pb-16">
            {/* Key Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
            <div className="text-center p-8 rounded-2xl bg-white border-2 border-primary/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-bold text-lg text-foreground mb-3">{t('appDownload.features.emergencySOS.title')}</h4>
              <p className="text-muted-foreground">{t('appDownload.features.emergencySOS.description')}</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-white border-2 border-primary/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-bold text-lg text-foreground mb-3">{t('appDownload.features.globalCoverage.title')}</h4>
              <p className="text-muted-foreground">{t('appDownload.features.globalCoverage.description')}</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-white border-2 border-primary/10 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-bold text-lg text-foreground mb-3">{t('appDownload.features.instantSetup.title')}</h4>
              <p className="text-muted-foreground">{t('appDownload.features.instantSetup.description')}</p>
            </div>
          </div>
            
            {/* Call to Action Button */}
            <div className="flex justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-bold text-lg px-12 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl">
                <Link to="/ai-register">
                  <Download className="mr-3 h-6 w-6" />
                  {t('appDownload.cta')}
                </Link>
              </Button>
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