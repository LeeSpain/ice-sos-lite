import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AppPreviewPhone from "@/components/app-preview/AppPreviewPhone";
import { useSiteContent } from "@/hooks/useSiteContent";
import { AppPreviewConfig, getDefaultAppPreview } from "@/types/appPreview";
import { useTranslation } from 'react-i18next';

const SITE_CONTENT_KEY = "homepage_app_preview";

const AppPreviewSection: React.FC = () => {
  const defaults = React.useMemo(() => getDefaultAppPreview(), []);
  const { value, isLoading } = useSiteContent<AppPreviewConfig>(SITE_CONTENT_KEY, defaults);
  const { t } = useTranslation();

  return (
    <section className="container mx-auto px-4 py-12">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold">{t('appPreview.title')}</CardTitle>
          <CardDescription className="mt-2 max-w-2xl mx-auto text-lg">
            {t('appPreview.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            {isLoading && !value ? (
              <div className="text-muted-foreground">{t('appPreview.loading')}</div>
            ) : (
              <AppPreviewPhone config={value ?? defaults} simulateRealtime />
            )}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t('appPreview.note')}
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

export default AppPreviewSection;
