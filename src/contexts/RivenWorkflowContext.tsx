import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WorkflowStage {
  id: string;
  campaign_id: string;
  stage_name: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  output_data?: any;
  error_message?: string;
}

interface Campaign {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

interface MarketingContent {
  id: string;
  campaign_id: string;
  platform: string;
  content_type: string;
  title?: string;
  body_text?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface WorkflowState {
  campaigns: Campaign[];
  activeWorkflows: Record<string, WorkflowStage[]>;
  contentItems: MarketingContent[];
  currentCampaignId?: string;
  activeTab: string;
  isRealTimeConnected: boolean;
  processingStage?: string;
}

type WorkflowAction =
  | { type: 'SET_CAMPAIGNS'; payload: Campaign[] }
  | { type: 'UPDATE_CAMPAIGN'; payload: Campaign }
  | { type: 'SET_WORKFLOW_STAGES'; payload: { campaignId: string; stages: WorkflowStage[] } }
  | { type: 'UPDATE_WORKFLOW_STAGE'; payload: WorkflowStage }
  | { type: 'SET_CONTENT_ITEMS'; payload: MarketingContent[] }
  | { type: 'ADD_CONTENT_ITEM'; payload: MarketingContent }
  | { type: 'UPDATE_CONTENT_ITEM'; payload: MarketingContent }
  | { type: 'SET_CURRENT_CAMPAIGN'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_REALTIME_STATUS'; payload: boolean }
  | { type: 'SET_PROCESSING_STAGE'; payload: string | undefined };

const initialState: WorkflowState = {
  campaigns: [],
  activeWorkflows: {},
  contentItems: [],
  activeTab: 'command-center',
  isRealTimeConnected: false,
};

function workflowReducer(state: WorkflowState, action: WorkflowAction): WorkflowState {
  switch (action.type) {
    case 'SET_CAMPAIGNS':
      return { ...state, campaigns: action.payload };
    
    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map(c => 
          c.id === action.payload.id ? action.payload : c
        )
      };
    
    case 'SET_WORKFLOW_STAGES':
      return {
        ...state,
        activeWorkflows: {
          ...state.activeWorkflows,
          [action.payload.campaignId]: action.payload.stages
        }
      };
    
    case 'UPDATE_WORKFLOW_STAGE':
      const campaignId = action.payload.campaign_id;
      const currentStages = state.activeWorkflows[campaignId] || [];
      return {
        ...state,
        activeWorkflows: {
          ...state.activeWorkflows,
          [campaignId]: currentStages.map(stage =>
            stage.stage_name === action.payload.stage_name ? action.payload : stage
          )
        }
      };
    
    case 'SET_CONTENT_ITEMS':
      return { ...state, contentItems: action.payload };
    
    case 'ADD_CONTENT_ITEM':
      return {
        ...state,
        contentItems: [...state.contentItems, action.payload]
      };
    
    case 'UPDATE_CONTENT_ITEM':
      return {
        ...state,
        contentItems: state.contentItems.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };
    
    case 'SET_CURRENT_CAMPAIGN':
      return { ...state, currentCampaignId: action.payload };
    
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    
    case 'SET_REALTIME_STATUS':
      return { ...state, isRealTimeConnected: action.payload };
    
    case 'SET_PROCESSING_STAGE':
      return { ...state, processingStage: action.payload };
    
    default:
      return state;
  }
}

interface WorkflowContextType extends WorkflowState {
  dispatch: React.Dispatch<WorkflowAction>;
  loadCampaigns: () => Promise<void>;
  loadWorkflowStages: (campaignId: string) => Promise<void>;
  loadContentItems: () => Promise<void>;
  sendCommand: (command: string, config: any) => Promise<string | undefined>;
  autoNavigateBasedOnProgress: () => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(workflowReducer, initialState);
  const { toast } = useToast();

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      dispatch({ type: 'SET_CAMPAIGNS', payload: data || [] });
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const loadWorkflowStages = async (campaignId: string) => {
    try {
      const { data, error } = await supabase
        .from('workflow_stages')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      dispatch({ 
        type: 'SET_WORKFLOW_STAGES', 
        payload: { campaignId, stages: data || [] } 
      });
    } catch (error) {
      console.error('Error loading workflow stages:', error);
    }
  };

  const loadContentItems = async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      dispatch({ type: 'SET_CONTENT_ITEMS', payload: data || [] });
    } catch (error) {
      console.error('Error loading content items:', error);
    }
  };

  const sendCommand = async (command: string, config: any): Promise<string | undefined> => {
    try {
      const { data, error } = await supabase.functions.invoke('riven-marketing-enhanced', {
        body: { command, campaignId: crypto.randomUUID() }
      });

      if (error) throw error;

      const campaignId = data?.campaignId;
      if (campaignId) {
        dispatch({ type: 'SET_CURRENT_CAMPAIGN', payload: campaignId });
        await loadWorkflowStages(campaignId);
        
        toast({
          title: "Workflow Started",
          description: "Riven is now processing your command",
        });
      }

      return campaignId;
    } catch (error) {
      console.error('Error sending command:', error);
      toast({
        title: "Command Failed",
        description: "Failed to send command to Riven",
        variant: "destructive"
      });
    }
  };

  const autoNavigateBasedOnProgress = () => {
    if (!state.currentCampaignId) return;

    const workflow = state.activeWorkflows[state.currentCampaignId];
    if (!workflow) return;

    const completedStages = workflow.filter(stage => stage.status === 'completed');
    const inProgressStage = workflow.find(stage => stage.status === 'in_progress');
    
    if (inProgressStage) {
      dispatch({ type: 'SET_PROCESSING_STAGE', payload: inProgressStage.stage_name });
      
      // Auto-navigate based on stage
      if (inProgressStage.stage_name === 'content_creation' && state.activeTab === 'command-center') {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'creation-pipeline' });
      } else if (inProgressStage.stage_name === 'approval_ready' && state.activeTab !== 'content-approval') {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'content-approval' });
      }
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    const campaignsChannel = supabase
      .channel('campaigns-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'marketing_campaigns'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          dispatch({ type: 'UPDATE_CAMPAIGN', payload: payload.new as Campaign });
        } else if (payload.eventType === 'UPDATE') {
          dispatch({ type: 'UPDATE_CAMPAIGN', payload: payload.new as Campaign });
        }
      })
      .subscribe();

    const workflowChannel = supabase
      .channel('workflow-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workflow_stages'
      }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          dispatch({ type: 'UPDATE_WORKFLOW_STAGE', payload: payload.new as WorkflowStage });
        }
      })
      .subscribe();

    const contentChannel = supabase
      .channel('content-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'marketing_content'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          dispatch({ type: 'ADD_CONTENT_ITEM', payload: payload.new as MarketingContent });
          
          // Auto-navigate to approval when content is ready
          if (payload.new.status === 'draft') {
            dispatch({ type: 'SET_ACTIVE_TAB', payload: 'content-approval' });
          }
        } else if (payload.eventType === 'UPDATE') {
          dispatch({ type: 'UPDATE_CONTENT_ITEM', payload: payload.new as MarketingContent });
        }
      })
      .subscribe();

    dispatch({ type: 'SET_REALTIME_STATUS', payload: true });

    return () => {
      supabase.removeChannel(campaignsChannel);
      supabase.removeChannel(workflowChannel);
      supabase.removeChannel(contentChannel);
    };
  }, []);

  // Auto-navigate based on progress
  useEffect(() => {
    autoNavigateBasedOnProgress();
  }, [state.activeWorkflows, state.currentCampaignId]);

  // Load initial data
  useEffect(() => {
    loadCampaigns();
    loadContentItems();
  }, []);

  const contextValue: WorkflowContextType = {
    ...state,
    dispatch,
    loadCampaigns,
    loadWorkflowStages,
    loadContentItems,
    sendCommand,
    autoNavigateBasedOnProgress,
  };

  return (
    <WorkflowContext.Provider value={contextValue}>
      {children}
    </WorkflowContext.Provider>
  );
};