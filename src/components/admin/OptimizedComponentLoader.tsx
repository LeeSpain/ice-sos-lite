import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import EnhancedCommandCenter from './EnhancedCommandCenter';
import ContentApprovalDashboard from './ContentApprovalDashboard';
import SocialHub from './SocialHub';
import AnalyticsDashboard from './AnalyticsDashboard';
import CampaignMonitor from './CampaignMonitor';

interface OptimizedComponentLoaderProps {
  type: 'command-center' | 'content-approval' | 'social-hub' | 'analytics' | 'monitor';
  props: any;
}

export default function OptimizedComponentLoader({ type, props }: OptimizedComponentLoaderProps) {
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
      return null;
  }
}