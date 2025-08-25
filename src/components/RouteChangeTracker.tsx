import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';

const RouteChangeTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Get page title for better tracking
    const pageTitle = document.title;
    trackPageView(location.pathname + location.search, pageTitle);
  }, [location.pathname, location.search]);

  return null;
};

export default RouteChangeTracker;
