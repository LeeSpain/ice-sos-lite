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
  ArrowRight,
  Activity,
  Zap,
  Clock,
  Bell,
  TrendingUp,
  Users
} from 'lucide-react';

const WorkflowContent: React.FC = () => {
  const { 
    activeTab, 
    dispatch, 
    currentCampaignId, 
    activeWorkflows, 
    contentItems,
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

  const allTabs = [
    { id: 'command-center', label: 'Command Center', description: 'Start your AI marketing campaign' },
    { id: 'creation-pipeline', label: 'Creation Pipeline', description: 'Watch content being generated' },
    { id: 'content-approval', label: 'Content Approval', description: 'Review and publish content' },
    { id: 'social-hub', label: 'Social Hub', description: 'Manage social media accounts' },
    { id: 'analytics', label: 'Analytics', description: 'Track campaign performance' },
    { id: 'monitor', label: 'Monitor', description: 'Real-time system monitoring' },
    { id: 'ai-settings', label: 'AI Settings', description: 'Configure AI parameters' },
    { id: 'training-data', label: 'Training Data', description: 'Manage AI training datasets' },
    { id: 'riven-config', label: 'Riven Config', description: 'System configuration' }
  ];

  return (
    <div className="space-y-6">
      {/* Real-time Status Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${isRealTimeConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium">
                    {isRealTimeConnected ? 'Live' : 'Disconnected'}
                  </span>
                </div>

                {/* Real-time Analytics */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-muted-foreground">{analytics.completionRate}% Success</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-3 w-3 text-primary" />
                    <span className="text-muted-foreground">{analytics.activeAgents} Agents</span>
                  </div>
                </div>
              
              {currentCampaignId && (
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="bg-primary/10">Active Campaign</Badge>
                  <Progress value={getWorkflowProgress()} className="w-32" />
                  <span className="text-sm text-muted-foreground">{Math.round(getWorkflowProgress())}%</span>
                  
                  {estimatedTimeRemaining && estimatedTimeRemaining > 0 && (
                    <Badge variant="secondary">
                      <Clock className="h-3 w-3 mr-1" />
                      {Math.floor(estimatedTimeRemaining / 60)}:{(estimatedTimeRemaining % 60).toString().padStart(2, '0')}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {processingStage && (
                <div className="flex items-center gap-2 text-primary animate-pulse">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm font-medium">Processing: {processingStage.replace('_', ' ')}</span>
                </div>
              )}

              {/* Notifications Bell */}
              {notifications.filter(n => !n.read).length > 0 && (
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-orange-600 animate-pulse" />
                  <Badge variant="destructive" className="text-xs">
                    {notifications.filter(n => !n.read).length}
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Visualizer */}
      {currentCampaignId && (
        <RealTimeWorkflowVisualizer 
          campaignId={currentCampaignId} 
          workflow={getCurrentWorkflow()}
        />
      )}

      {/* Complete Riven Workflow Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Riven AI Marketing System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => dispatch({ type: 'SET_ACTIVE_TAB', payload: value })}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 mb-6">
              {allTabs.map((tab, index) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="relative flex items-center gap-1 data-[state=active]:bg-primary/10 text-xs lg:text-sm"
                >
                  {tab.id === 'command-center' && <Wand2 className="h-3 w-3 lg:h-4 lg:w-4" />}
                  {tab.id === 'creation-pipeline' && <Cog className="h-3 w-3 lg:h-4 lg:w-4" />}
                  {tab.id === 'content-approval' && <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4" />}
                  {tab.id === 'social-hub' && <Users className="h-3 w-3 lg:h-4 lg:w-4" />}
                  {tab.id === 'analytics' && <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4" />}
                  {tab.id === 'monitor' && <Activity className="h-3 w-3 lg:h-4 lg:w-4" />}
                  {tab.id === 'ai-settings' && <Zap className="h-3 w-3 lg:h-4 lg:w-4" />}
                  {tab.id === 'training-data' && <Bell className="h-3 w-3 lg:h-4 lg:w-4" />}
                  {tab.id === 'riven-config' && <Cog className="h-3 w-3 lg:h-4 lg:w-4" />}
                  
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{tab.label}</span>
                    <span className="text-xs text-muted-foreground hidden xl:block">
                      {tab.description}
                    </span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="command-center" className="space-y-6">
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

            <TabsContent value="creation-pipeline" className="space-y-6">
              <ContentGenerationPipeline campaignId={currentCampaignId} />
            </TabsContent>

            <TabsContent value="content-approval" className="space-y-6">
              <ContentApprovalDashboard />
            </TabsContent>

            <TabsContent value="social-hub" className="space-y-6">
              <SocialHub />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="monitor" className="space-y-6">
              <SystemMonitor />
            </TabsContent>

            <TabsContent value="ai-settings" className="space-y-6">
              <AISettings />
            </TabsContent>

            <TabsContent value="training-data" className="space-y-6">
              <TrainingDataManager />
            </TabsContent>

            <TabsContent value="riven-config" className="space-y-6">
              <RivenConfiguration />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
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