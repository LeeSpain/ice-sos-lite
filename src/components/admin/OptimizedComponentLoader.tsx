import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EnhancedCommandCenter } from './EnhancedCommandCenter';
import { ContentApprovalDashboard } from './ContentApprovalDashboard';
import { SocialHub } from './SocialHub';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import CampaignMonitor from './CampaignMonitor';

interface OptimizedComponentLoaderProps {
  type: 'command-center' | 'content-approval' | 'social-hub' | 'analytics' | 'monitor';
  props: any;
}

export default function OptimizedComponentLoader({ type, props }: OptimizedComponentLoaderProps) {
  console.log('Loading component type:', type);
  
  try {
    switch (type) {
      case 'command-center':
        return <EnhancedCommandCenter {...props} />;
      case 'content-approval':
        return <ContentApprovalDashboard {...props} />;
      case 'social-hub':
        return <SocialHub {...props} />;
      case 'analytics':
        return <AnalyticsDashboard {...props} />;
      case 'monitor':
        return <CampaignMonitor {...props} />;
      default:
        console.warn('Unknown component type:', type);
        return null;
    }
  } catch (error) {
    console.error('Error loading component:', type, error);
    return <div>Error loading component: {type}</div>;
  }
}