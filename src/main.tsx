import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n'
import { QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { PreferencesProvider } from '@/contexts/PreferencesContext'
import { initAnalytics } from '@/lib/analytics'
import { queryClient } from '@/lib/queryClient'
import { performanceMonitor } from '@/utils/performance'

// Initialize performance monitoring
performanceMonitor.mark('app-start');

// Initialize analytics
initAnalytics();

// Preload critical resources
const preloadCriticalResources = () => {
  const criticalImages = [
    '/lovable-uploads/7ad599e6-d1cd-4a1b-84f4-9b6b1e4242e1.png',
  ];
  
  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

preloadCriticalResources();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <App />
      </PreferencesProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

// Log performance metrics after app loads
window.addEventListener('load', () => {
  performanceMonitor.mark('app-loaded');
  performanceMonitor.measure('app-load-time', 'app-start', 'app-loaded');
  
  // Log Core Web Vitals after a delay
  setTimeout(() => {
    performanceMonitor.logSummary();
  }, 2000);
});