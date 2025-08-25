import * as Sentry from '@sentry/react';
import { GA_MEASUREMENT_ID, SENTRY_DSN, GA_CONFIG } from '@/config/analytics';

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

export function trackPageView(path: string, title?: string) {
  if (GA_MEASUREMENT_ID && typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, { 
      page_path: path,
      page_title: title 
    });
  }
}

// Enhanced event tracking
export function trackEvent(eventName: string, parameters?: Record<string, any>) {
  if (GA_MEASUREMENT_ID && typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: parameters?.category || 'engagement',
      event_label: parameters?.label,
      value: parameters?.value,
      ...parameters
    });
  }
}

// Custom ICE SOS specific tracking
export function trackEmergencyEvent(action: string, details?: Record<string, any>) {
  trackEvent('emergency_action', {
    category: 'emergency',
    action,
    ...details
  });
}

export function trackSubscriptionEvent(action: string, planType?: string, value?: number) {
  trackEvent('subscription_action', {
    category: 'subscription',
    action,
    subscription_plan: planType,
    value
  });
}

export function trackUserInteraction(element: string, action: string, location?: string) {
  trackEvent('user_interaction', {
    category: 'ui_interaction',
    element,
    action,
    page_location: location || window.location.pathname
  });
}

// E-commerce tracking
export function trackPurchase(transactionId: string, items: any[], value: number, currency = 'EUR') {
  if (GA_MEASUREMENT_ID && typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: transactionId,
      value,
      currency,
      items
    });
  }
}

// User identification (for authenticated users)
export function setUserProperties(userId: string, properties: Record<string, any>) {
  if (GA_MEASUREMENT_ID && typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      user_id: userId,
      custom_map: GA_CONFIG.customDimensions
    });
    
    // Set custom dimensions
    if (properties.role) {
      window.gtag('event', 'page_view', {
        [GA_CONFIG.customDimensions.userRole]: properties.role
      });
    }
  }
}
