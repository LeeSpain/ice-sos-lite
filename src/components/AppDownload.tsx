import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Download, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const AppDownload = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-primary/10 rounded-full px-4 py-2 mb-4 border border-primary/20">
            <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium text-primary">{t('appDownload.platformBadge')}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">
            {t('appDownload.title')}
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            {t('appDownload.subtitle')}
          </p>
        </div>

        {/* Main Content Card */}
        <Card className="relative border-2 border-primary/20 bg-white dark:bg-slate-800 shadow-xl overflow-hidden max-w-4xl mx-auto">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
          
          <CardContent className="p-6 md:p-8">
            {/* Compact Layout */}
            <div className="grid md:grid-cols-2 gap-6 items-center">
              {/* Left Side - App Info */}
              <div className="text-center md:text-left">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary shadow-lg rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-4">
                  <Smartphone className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 text-foreground">
                  {t('appDownload.appName')}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {t('appDownload.heroDescription')}
                </p>
                
                {/* CTA Button */}
                <Button asChild size="lg" className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
                  <Link to="/register" className="flex items-center justify-center">
                    <Download className="mr-2 h-4 w-4" />
                    {t('appDownload.cta')}
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Free to download • No credit card required
                </p>
              </div>

              {/* Right Side - Features Grid */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{t('appDownload.features.emergencySOS.title')}</h4>
                    <p className="text-xs text-muted-foreground">{t('appDownload.features.emergencySOS.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/5 border border-secondary/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary/80 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{t('appDownload.features.globalCoverage.title')}</h4>
                    <p className="text-xs text-muted-foreground">{t('appDownload.features.globalCoverage.description')}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{t('appDownload.features.instantSetup.title')}</h4>
                    <p className="text-xs text-muted-foreground">{t('appDownload.features.instantSetup.description')}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AppDownload;