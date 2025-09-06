import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WorkflowProvider, useWorkflow } from '@/contexts/RivenWorkflowContext';
import { EnhancedCommandCenter } from './EnhancedCommandCenter';
import { ContentGenerationPipeline } from './ContentGenerationPipeline';
import { ContentApprovalDashboard } from './ContentApprovalDashboard';
import { RealTimeWorkflowVisualizer } from './RealTimeWorkflowVisualizer';
import { SocialHub } from './SocialHub';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { SystemMonitor } from './SystemMonitor';
import { AISettings } from './AISettings';
import { TrainingDataManager } from './TrainingDataManager';
import { RivenConfiguration } from './RivenConfiguration';
import { 
  Wand2, 
  Cog, 
  CheckCircle, 
  Activity,
  Zap,
  Clock,
  Bell,
  TrendingUp,
  Users,
  Settings,
  Database,
  Monitor
} from 'lucide-react';

const WorkflowContent: React.FC = () => {
  const { 
    activeTab, 
    dispatch, 
    currentCampaignId, 
    activeWorkflows, 
    isRealTimeConnected,
    processingStage,
    sendCommand,
    notifications,
    estimatedTimeRemaining,
    analytics
  } = useWorkflow();

  const [currentCommand, setCurrentCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendCommand = async (config: any) => {
    setIsProcessing(true);
    try {
      const campaignId = await sendCommand(currentCommand, config);
      if (campaignId) {
        setTimeout(() => {
          dispatch({ type: 'SET_ACTIVE_TAB', payload: 'creation-pipeline' });
        }, 2000);
      }
    } catch (error) {
      console.error('Command failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getCurrentWorkflow = () => {
    if (!currentCampaignId) return [];
    return activeWorkflows[currentCampaignId] || [];
  };

  const getWorkflowProgress = () => {
    const workflow = getCurrentWorkflow();
    if (workflow.length === 0) return 0;
    
    const completed = workflow.filter(stage => stage.status === 'completed').length;
    return (completed / workflow.length) * 100;
  };

  const tabs = [
    { id: 'command-center', label: 'Command Center', icon: Wand2, description: 'AI Marketing Commands' },
    { id: 'creation-pipeline', label: 'Creation Pipeline', icon: Cog, description: 'Content Generation' },
    { id: 'content-approval', label: 'Content Approval', icon: CheckCircle, description: 'Review & Publish' },
    { id: 'social-hub', label: 'Social Hub', icon: Users, description: 'Social Accounts' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Performance Data' },
    { id: 'monitor', label: 'Monitor', icon: Monitor, description: 'System Health' },
    { id: 'ai-settings', label: 'AI Settings', icon: Zap, description: 'AI Configuration' },
    { id: 'training-data', label: 'Training Data', icon: Database, description: 'AI Training' },
    { id: 'riven-config', label: 'Riven Config', icon: Settings, description: 'System Settings' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Status Header */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${isRealTimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium">
                    {isRealTimeConnected ? 'Live' : 'Disconnected'}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-muted-foreground">{analytics.completionRate || 0}% Success</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-primary" />
                    <span className="text-muted-foreground">{analytics.activeAgents || 0} Agents</span>
                  </div>
                </div>
              </div>
              
              {currentCampaignId && (
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-primary/10">Active Campaign</Badge>
                  <Progress value={getWorkflowProgress()} className="w-24" />
                  <span className="text-sm text-muted-foreground">{Math.round(getWorkflowProgress())}%</span>
                  
                  {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.floor(estimatedTimeRemaining / 60)}:{(estimatedTimeRemaining % 60).toString().padStart(2, '0')}
                    </Badge>
                  )}
                </div>
              )}
              
              {notifications.filter(n => !n.read).length > 0 && (
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-orange-600 animate-pulse" />
                  <Badge variant="destructive" className="text-xs">
                    {notifications.filter(n => !n.read).length}
                  </Badge>
                </div>
              )}
            </div>
            
            {processingStage && (
              <div className="flex items-center gap-2 text-primary animate-pulse mt-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm font-medium">Processing: {processingStage.replace('_', ' ')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Workflow Visualizer */}
        {currentCampaignId && (
          <RealTimeWorkflowVisualizer 
            campaignId={currentCampaignId} 
            workflow={getCurrentWorkflow()}
          />
        )}

        {/* Main Tabs Interface */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Riven AI Marketing System
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={(value) => dispatch({ type: 'SET_ACTIVE_TAB', payload: value })}>
              {/* Responsive Tab List */}
              <div className="px-6 pb-4">
                <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 h-auto">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <TabsTrigger 
                        key={tab.id} 
                        value={tab.id} 
                        className="flex flex-col items-center gap-1 p-3 data-[state=active]:bg-primary/10 text-xs lg:text-sm min-h-[60px] lg:min-h-[80px]"
                      >
                        <IconComponent className="h-3 w-3 lg:h-4 lg:w-4" />
                        <span className="font-medium leading-tight text-center">{tab.label}</span>
                        <span className="text-xs text-muted-foreground hidden xl:block leading-tight text-center">
                          {tab.description}
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="px-6 pb-6">
                <TabsContent value="command-center" className="mt-0">
                  <EnhancedCommandCenter
                    currentCommand={currentCommand}
                    setCurrentCommand={setCurrentCommand}
                    isProcessing={isProcessing}
                    onSendCommand={handleSendCommand}
                    commandTemplates={[]}
                    useTemplate={() => {}}
                    rivenResponse=""
                    campaignId={currentCampaignId}
                  />
                </TabsContent>

                <TabsContent value="creation-pipeline" className="mt-0">
                  <ContentGenerationPipeline campaignId={currentCampaignId} />
                </TabsContent>

                <TabsContent value="content-approval" className="mt-0">
                  <ContentApprovalDashboard />
                </TabsContent>

                <TabsContent value="social-hub" className="mt-0">
                  <SocialHub />
                </TabsContent>

                <TabsContent value="analytics" className="mt-0">
                  <AnalyticsDashboard />
                </TabsContent>

                <TabsContent value="monitor" className="mt-0">
                  <SystemMonitor />
                </TabsContent>

                <TabsContent value="ai-settings" className="mt-0">
                  <AISettings />
                </TabsContent>

                <TabsContent value="training-data" className="mt-0">
                  <TrainingDataManager />
                </TabsContent>

                <TabsContent value="riven-config" className="mt-0">
                  <RivenConfiguration />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export const UnifiedRivenWorkflow: React.FC = () => {
  return (
    <WorkflowProvider>
      <WorkflowContent />
    </WorkflowProvider>
  );
};