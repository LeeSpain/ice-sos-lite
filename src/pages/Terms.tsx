import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { TermsDialog } from "@/components/legal/TermsDialog";

const Terms: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const title = "Terms of Service | ICE SOS Lite";
  const description = "Terms of Service for ICE SOS Lite emergency SOS app.";
  const canonical = "/terms";

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
      
      <TermsDialog 
        open={dialogOpen} 
        onOpenChange={handleDialogClose}
      />
      
      {/* Fallback content for SEO and accessibility */}
      <main className="container mx-auto px-4 py-10" style={{ display: dialogOpen ? 'none' : 'block' }}>
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">
            Please read these terms carefully before using ICE SOS Lite.
          </p>
        </header>
        <section className="prose prose-invert max-w-none">
          <p>
            Our comprehensive Terms of Service are displayed in an interactive dialog for better readability. 
            If you're having trouble viewing the terms, please contact us at 
            <a href="mailto:icesoslite@gmail.com" className="text-primary hover:underline">
              icesoslite@gmail.com
            </a>
          </p>
        </section>
      </main>
    </>
  );
};

export default Terms;
