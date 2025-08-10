import * as Sentry from '@sentry/react';
import { GA_MEASUREMENT_ID, SENTRY_DSN } from '@/config/analytics';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

export function initAnalytics() {
  // Sentry init (safe if DSN missing)
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      integrations: [Sentry.browserTracingIntegration()],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.0,
      replaysOnErrorSampleRate: 0.1,
    });
  }

  // GA4 init (injects script if ID present)
  if (GA_MEASUREMENT_ID && typeof window !== 'undefined') {
    if (!window.dataLayer) window.dataLayer = [];
    if (!window.gtag) {
      window.gtag = function () { window.dataLayer!.push(arguments); } as any;
    }
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(gtagScript);

    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { send_page_view: false });
  }
}

export function trackPageView(path: string) {
  if (GA_MEASUREMENT_ID && typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, { page_path: path });
  }
}
