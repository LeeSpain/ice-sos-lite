import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Download, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const AppDownload = () => {
  const { t } = useTranslation();
  return (
    <section className="py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center bg-primary/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-primary/20">
            <div className="w-3 h-3 bg-primary rounded-full mr-3 animate-pulse"></div>
            <span className="text-sm font-semibold text-primary uppercase tracking-wide">
              {t('appDownload.platformBadge')}
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent leading-tight">
            {t('appDownload.title')}
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-medium">
            {t('appDownload.subtitle')}
          </p>
        </div>

        {/* Main Content Card */}
        <div className="max-w-6xl mx-auto">
          <Card className="relative border-0 bg-gradient-to-br from-card/80 to-card backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-secondary/20 to-primary/20 rounded-full blur-3xl"></div>
            
            <CardContent className="relative p-12 md:p-16">
              {/* App Icon and Title */}
              <div className="text-center mb-16">
                <div className="relative inline-block mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary shadow-2xl rounded-3xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <Smartphone className="h-16 w-16 text-white relative z-10" />
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-xl opacity-50"></div>
                </div>
                <h3 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                  {t('appDownload.appName')}
                </h3>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {t('appDownload.heroDescription')}
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
                    <Check className="h-10 w-10 text-white" />
                  </div>
                  <h4 className="font-bold text-xl text-foreground mb-4">{t('appDownload.features.emergencySOS.title')}</h4>
                  <p className="text-muted-foreground leading-relaxed">{t('appDownload.features.emergencySOS.description')}</p>
                </div>
                
                <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-secondary/25 transition-all duration-300">
                    <Check className="h-10 w-10 text-white" />
                  </div>
                  <h4 className="font-bold text-xl text-foreground mb-4">{t('appDownload.features.globalCoverage.title')}</h4>
                  <p className="text-muted-foreground leading-relaxed">{t('appDownload.features.globalCoverage.description')}</p>
                </div>
                
                <div className="group text-center p-8 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/50 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl">
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
                    <Check className="h-10 w-10 text-white" />
                  </div>
                  <h4 className="font-bold text-xl text-foreground mb-4">{t('appDownload.features.instantSetup.title')}</h4>
                  <p className="text-muted-foreground leading-relaxed">{t('appDownload.features.instantSetup.description')}</p>
                </div>
              </div>
              
              {/* Call to Action */}
              <div className="text-center">
                <Button asChild size="xl" className="bg-gradient-to-r from-primary via-primary/90 to-secondary hover:from-primary/90 hover:via-primary/80 hover:to-secondary/90 text-white font-bold text-xl px-16 py-6 shadow-2xl hover:shadow-primary/25 transition-all duration-500 rounded-2xl border-2 border-white/20 hover:scale-105 group">
                  <Link to="/ai-register" className="flex items-center">
                    <div className="mr-4 p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                      <Download className="h-6 w-6" />
                    </div>
                    {t('appDownload.cta')}
                  </Link>
                </Button>
                <p className="text-sm text-muted-foreground mt-6 font-medium">
                  Free to download • No credit card required
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

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