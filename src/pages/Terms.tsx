import React from "react";
import { Helmet } from "react-helmet-async";

const Terms: React.FC = () => {
  const title = "Terms of Service | ICE SOS Lite";
  const description = "Terms of Service for ICE SOS Lite emergency SOS app.";
  const canonical = "/terms";

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <main className="container mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">
            Please read these terms carefully before using ICE SOS Lite.
          </p>
        </header>
        <section className="prose prose-invert max-w-none">
          <h2>Use of Service</h2>
          <p>
            ICE SOS Lite provides tools to assist in emergencies. You agree to use the app responsibly and comply with local laws.
          </p>
          <h2>Subscriptions & Payments</h2>
          <p>
            Paid features are billed via our payment provider. Cancellations take effect at the end of the billing period.
          </p>
          <h2>Limitation of Liability</h2>
          <p>
            While we aim for high reliability, we do not guarantee uninterrupted service or emergency outcomes.
          </p>
          <h2>Contact</h2>
          <p>support@icesoslite.com</p>
          <p className="text-sm text-muted-foreground mt-6">Last updated: {new Date().getFullYear()}</p>
        </section>
      </main>
    </>
  );
};

export default Terms;
