import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EnhancedCommandCenter } from './EnhancedCommandCenter';
import { ContentApprovalDashboard } from './ContentApprovalDashboard';
import { RealContentApproval } from './RealContentApproval';
import { SocialHub } from './SocialHub';
import { RealSocialMediaOAuth } from './RealSocialMediaOAuth';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import CampaignMonitor from './CampaignMonitor';

// Enhanced Professional Components
import EnhancedContentApproval from './enhanced/ContentApprovalDashboard';
import AdvancedAnalyticsDashboard from './enhanced/AdvancedAnalyticsDashboard';
import ProfessionalSocialHub from './enhanced/ProfessionalSocialHub';
import AdvancedCampaignMonitor from './enhanced/AdvancedCampaignMonitor';

interface OptimizedComponentLoaderProps {
  type: 'command-center' | 'content-approval' | 'social-hub' | 'analytics' | 'monitor';
  props: any;
  enhanced?: boolean; // Flag to use enhanced components
}

export default function OptimizedComponentLoader({ type, props, enhanced = true }: OptimizedComponentLoaderProps) {
  console.log('Loading component type:', type, 'Enhanced:', enhanced);
  
  try {
    switch (type) {
      case 'command-center':
        return <EnhancedCommandCenter {...props} />;
      case 'content-approval':
        return enhanced ? (
          <EnhancedContentApproval 
            contents={props.contents || []}
            onContentApproval={props.onContentApproval || (() => {})}
            onPublishContent={props.onPublishContent || (() => {})}
            isLoading={props.isLoading || false}
          />
        ) : (
          <RealContentApproval 
            contents={props.contents || []}
            onContentApproval={props.onContentApproval || (() => {})}
            onPublishContent={props.onPublishContent || (() => {})}
            isLoading={props.isLoading || false}
          />
        );
      case 'social-hub':
        return enhanced ? (
          <ProfessionalSocialHub onAccountsUpdate={props.onAccountsUpdate || (() => {})} />
        ) : (
          <RealSocialMediaOAuth onAccountsUpdate={props.onAccountsUpdate || (() => {})} />
        );
      case 'analytics':
        return enhanced ? (
          <AdvancedAnalyticsDashboard {...props} />
        ) : (
          <AnalyticsDashboard {...props} />
        );
      case 'monitor':
        return enhanced ? (
          <AdvancedCampaignMonitor {...props} />
        ) : (
          <CampaignMonitor {...props} />
        );
      default:
        console.warn('Unknown component type:', type);
        return null;
    }
  } catch (error) {
    console.error('Error loading component:', type, error);
    return <div>Error loading component: {type}</div>;
  }
}