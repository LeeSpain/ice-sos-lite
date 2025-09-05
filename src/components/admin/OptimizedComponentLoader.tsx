import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EnhancedCommandCenter } from './EnhancedCommandCenter';
import { ContentApprovalDashboard } from './ContentApprovalDashboard';
import { RealContentApproval } from './RealContentApproval';
import { SocialHub } from './SocialHub';
import { RealSocialMediaOAuth } from './RealSocialMediaOAuth';
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
        return <RealContentApproval 
          contents={props.contents || []}
          onContentApproval={props.onContentApproval || (() => {})}
          onPublishContent={props.onPublishContent || (() => {})}
          isLoading={props.isLoading || false}
        />;
      case 'social-hub':
        return <RealSocialMediaOAuth onAccountsUpdate={props.onAccountsUpdate || (() => {})} />;
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