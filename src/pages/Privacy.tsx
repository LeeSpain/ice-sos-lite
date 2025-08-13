import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { PrivacyDialog } from "@/components/legal/PrivacyDialog";
import { useTranslation } from "react-i18next";

const Privacy: React.FC = () => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const title = `${t('privacy.title')} | ICE SOS Lite`;
  const description = t('privacy.description');
  const canonical = "/privacy";

  // Open dialog automatically when page loads
  useEffect(() => {
    setDialogOpen(true);
  }, []);

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Navigate back to previous page or home
    window.history.back();
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
      </Helmet>
      
      <PrivacyDialog 
        open={dialogOpen} 
        onOpenChange={handleDialogClose}
      />
      
      {/* Fallback content for SEO and accessibility */}
      <main className="container mx-auto px-4 py-10" style={{ display: dialogOpen ? 'none' : 'block' }}>
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{t('privacy.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('privacy.description')}
          </p>
        </header>
        <section className="prose prose-invert max-w-none">
          <p>
            {t('privacy.fallback')} {" "}
            <a href={`mailto:${t('privacy.email')}`} className="text-primary hover:underline">
              {t('privacy.email')}
            </a>
          </p>
        </section>
      </main>
    </>
  );
};

export default Privacy;
