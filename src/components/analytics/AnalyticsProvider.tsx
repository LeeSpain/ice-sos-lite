import React from 'react';
import { usePageTracking } from '@/hooks/usePageTracking';
import { useScrollTracking, useClickTracking, useFormTracking } from '@/hooks/useInteractionTracking';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  // Initialize all tracking hooks
  usePageTracking();
  useScrollTracking();
  useClickTracking();
  useFormTracking();

  return <>{children}</>;
};