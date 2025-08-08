import React from "react";
import { Helmet } from "react-helmet-async";
import { Mail, Phone, MessageSquare } from "lucide-react";

const Support: React.FC = () => {
  const title = "Support | ICE SOS Lite";
  const description = "Get help with ICE SOS Lite – contact support or browse FAQs.";
  const canonical = "/support";

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <main className="container mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Support</h1>
          <p className="text-muted-foreground mt-2">
            We're here to help. Reach us anytime.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="mailto:support@icesoslite.com" className="p-6 rounded-lg border border-border hover:bg-muted/30 transition">
            <Mail className="h-5 w-5 mb-3" />
            <h2 className="font-semibold">Email Support</h2>
            <p className="text-sm text-muted-foreground">support@icesoslite.com</p>
          </a>
          <div className="p-6 rounded-lg border border-border">
            <Phone className="h-5 w-5 mb-3" />
            <h2 className="font-semibold">Emergency Hotline</h2>
            <p className="text-sm text-muted-foreground">Use in-app SOS to dial your regional emergency number.</p>
          </div>
          <div className="p-6 rounded-lg border border-border">
            <MessageSquare className="h-5 w-5 mb-3" />
            <h2 className="font-semibold">FAQs</h2>
            <p className="text-sm text-muted-foreground">Coming soon.</p>
          </div>
        </section>
      </main>
    </>
  );
};

export default Support;
