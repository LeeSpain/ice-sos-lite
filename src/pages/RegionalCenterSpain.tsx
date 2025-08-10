import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import heroImage from '@/assets/hero-emergency.jpg';

const RegionalCenterSpain: React.FC = () => {
  const { t, i18n } = useTranslation();

  // Basic SEO: set page title programmatically
  useEffect(() => {
    const prev = document.title;
    document.title = `${t('regionalCenterES.h1')} | ICE SOS`;
    return () => { document.title = prev; };
  }, [t, i18n.language]);

  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ICE SOS – Spain Regional Call Centre',
    areaServed: 'ES',
    url: typeof window !== 'undefined' ? window.location.href : 'https://example.com/regional-center/spain',
    contactPoint: [{
      '@type': 'ContactPoint',
      contactType: 'emergency',
      availableLanguage: ['English', 'Spanish'],
      areaServed: 'ES'
    }]
  }), []);

  const whatWeDo: string[] = t('regionalCenterES.whatWeDo', { returnObjects: true }) as unknown as string[];
  const whenToContact: string[] = t('regionalCenterES.whenToContact', { returnObjects: true }) as unknown as string[];

  return (
    <main className="pt-20">
      <section className="container mx-auto px-4 py-10">
        <header className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{t('regionalCenterES.h1')}</h1>
            <p className="text-muted-foreground mb-4">{t('regionalCenterES.intro')}</p>
            <p className="text-foreground/90 mb-6">{t('regionalCenterES.heroDescription')}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/sos" className="inline-flex items-center px-5 py-2 rounded-md bg-primary text-primary-foreground shadow-primary transition-colors hover:opacity-90">
                {t('regionalCenterES.ctaSOS')}
              </Link>
              <Link to="/support" className="inline-flex items-center px-5 py-2 rounded-md border border-border text-foreground hover:bg-accent/50 transition-colors">
                {t('regionalCenterES.ctaSupport')}
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-3">{t('regionalCenterES.noEmergency')}</p>
          </div>
          <figure className="rounded-lg overflow-hidden shadow-xl">
            <img src={heroImage} alt="Emergency call centre support in Spain (English & Spanish)" loading="lazy" className="w-full h-auto object-cover" />
          </figure>
        </header>
      </section>

      <section className="bg-muted/30 border-t border-b border-border">
        <div className="container mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
          <article>
            <h2 className="text-2xl font-semibold text-foreground mb-3">{t('regionalCenterES.whatWeDoTitle')}</h2>
            <ul className="list-disc pl-5 space-y-2 text-foreground/90">
              {whatWeDo?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </article>
          <aside>
            <h2 className="text-2xl font-semibold text-foreground mb-3">{t('regionalCenterES.whenToContactTitle')}</h2>
            <ul className="list-disc pl-5 space-y-2 text-foreground/90">
              {whenToContact?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section>
        <div className="container mx-auto px-4 py-10 grid md:grid-cols-3 gap-6">
          <div className="rounded-lg border border-border p-5">
            <h3 className="font-semibold mb-2">{t('regionalCenterES.coverageTitle')}</h3>
            <ul className="space-y-1 text-foreground/90">
              <li>{t('regionalCenterES.coverageHours')}</li>
              <li>{t('regionalCenterES.coverageLanguages')}</li>
              <li>{t('regionalCenterES.coverageRegion')}</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border p-5">
            <h3 className="font-semibold mb-2">{t('regionalCenterES.confidentialityTitle')}</h3>
            <p className="text-foreground/90">{t('regionalCenterES.confidentialityDesc')}</p>
          </div>
          <div className="rounded-lg border border-border p-5">
            <h3 className="font-semibold mb-2">Support & Links</h3>
            <ul className="space-y-2">
              <li><Link to="/support" className="text-primary hover:underline">{t('regionalCenterES.ctaSupport')}</Link></li>
              <li><Link to="/sos" className="text-primary hover:underline">{t('regionalCenterES.ctaSOS')}</Link></li>
            </ul>
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
};

export default RegionalCenterSpain;
