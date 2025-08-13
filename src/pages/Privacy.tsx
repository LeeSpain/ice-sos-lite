import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { PrivacyDialog } from "@/components/legal/PrivacyDialog";

const Privacy: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const title = "Privacy Policy | ICE SOS Lite";
  const description = "Privacy Policy for ICE SOS Lite emergency SOS app.";
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
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">
            Your privacy matters. This page describes how we handle your data.
          </p>
        </header>
        <section className="prose prose-invert max-w-none">
          <p>
            Our comprehensive Privacy Policy is displayed in an interactive dialog for better readability. 
            If you're having trouble viewing the policy, please contact us at 
            <a href="mailto:icesoslite@gmail.com" className="text-primary hover:underline">
              icesoslite@gmail.com
            </a>
          </p>
        </section>
      </main>
    </>
  );
};

export default Privacy;
