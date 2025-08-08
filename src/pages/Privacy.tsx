import React from "react";
import { Helmet } from "react-helmet-async";

const Privacy: React.FC = () => {
  const title = "Privacy Policy | ICE SOS Lite";
  const description = "Privacy Policy for ICE SOS Lite emergency SOS app.";
  const canonical = "/privacy";

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <main className="container mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">
            Your privacy matters. This page describes how we handle your data.
          </p>
        </header>
        <section className="prose prose-invert max-w-none">
          <h2>Information We Collect</h2>
          <p>
            We collect account details (email, name), emergency contacts, and optional medical profile data to help responders in emergencies. Location data is processed during active SOS only.
          </p>
          <h2>How We Use Data</h2>
          <ul>
            <li>Provide SOS and emergency features</li>
            <li>Improve reliability and safety</li>
            <li>Comply with legal requirements</li>
          </ul>
          <h2>Data Sharing</h2>
          <p>
            We may share necessary information with emergency services and trusted partners strictly to deliver the service.
          </p>
          <h2>Contact</h2>
          <p>
            For questions or data requests, email support@icesoslite.com
          </p>
          <p className="text-sm text-muted-foreground mt-6">Last updated: {new Date().getFullYear()}</p>
        </section>
      </main>
    </>
  );
};

export default Privacy;
