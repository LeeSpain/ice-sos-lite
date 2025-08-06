import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.53.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UnifiedInboxRequest {
  action: 'get_conversations' | 'get_messages' | 'send_message' | 'assign_conversation' | 'handover_conversation' | 'update_status';
  conversation_id?: string;
  user_id?: string;
  filters?: {
    channel?: string;
    status?: string;
    assigned_to?: string;
    priority?: number;
  };
  message_data?: {
    content: string;
    direction: 'inbound' | 'outbound';
    sender_name?: string;
    sender_email?: string;
    sender_phone?: string;
  };
  assignment_data?: {
    user_id: string;
    role?: string;
  };
  handover_data?: {
    from_user_id?: string;
    to_user_id: string;
    reason?: string;
    notes?: string;
    initiated_by: string;
  };
  status_update?: {
    status: string;
    priority?: number;
    tags?: string[];
  };
}

// Get conversations with filters
async function getConversations(filters: any = {}) {
  console.log('Getting conversations with filters:', filters);
  
  let query = supabase
    .from('unified_conversations')
    .select(`
      *,
      conversation_categories(name),
      unified_messages(
        id, direction, content, created_at, sender_name
      )
    `)
    .order('last_activity_at', { ascending: false });
  
  // Apply filters
  if (filters.channel) {
    query = query.eq('channel', filters.channel);
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters.assigned_to) {
    query = query.eq('assigned_to', filters.assigned_to);
  }
  
  if (filters.priority) {
    query = query.eq('priority', filters.priority);
  }
  
  const { data, error } = await query.limit(50);
  
  if (error) {
    throw new Error(`Failed to get conversations: ${error.message}`);
  }
  
  // Add latest message info to each conversation
  const conversations = data?.map(conversation => ({
    ...conversation,
    latest_message: conversation.unified_messages?.[0] || null,
    message_count: conversation.unified_messages?.length || 0
  })) || [];
  
  return conversations;
}

// Get messages for a conversation
async function getMessages(conversationId: string) {
  console.log('Getting messages for conversation:', conversationId);
  
  const { data, error } = await supabase
    .from('unified_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  
  if (error) {
    throw new Error(`Failed to get messages: ${error.message}`);
  }
  
  return data || [];
}

// Send a message
async function sendMessage(conversationId: string, messageData: any) {
  console.log('Sending message to conversation:', conversationId);
  
  // Insert message
  const { data: message, error: messageError } = await supabase
    .from('unified_messages')
    .insert({
      conversation_id: conversationId,
      ...messageData
    })
    .select()
    .single();
  
  if (messageError) {
    throw new Error(`Failed to send message: ${messageError.message}`);
  }
  
  // Update conversation last activity
  await supabase
    .from('unified_conversations')
    .update({
      last_message_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString()
    })
    .eq('id', conversationId);
  
  return message;
}

// Assign conversation to user
async function assignConversation(conversationId: string, assignmentData: any) {
  console.log('Assigning conversation:', conversationId, 'to:', assignmentData.user_id);
  
  // Update conversation assignment
  const { error: updateError } = await supabase
    .from('unified_conversations')
    .update({
      assigned_to: assignmentData.user_id,
      status: 'assigned',
      last_activity_at: new Date().toISOString()
    })
    .eq('id', conversationId);
  
  if (updateError) {
    throw new Error(`Failed to assign conversation: ${updateError.message}`);
  }
  
  // Create assignment record
  const { error: assignmentError } = await supabase
    .from('conversation_assignments')
    .insert({
      conversation_id: conversationId,
      user_id: assignmentData.user_id,
      role: assignmentData.role || 'assignee',
      assigned_by: assignmentData.assigned_by || assignmentData.user_id
    });
  
  if (assignmentError) {
    console.error('Failed to create assignment record:', assignmentError);
  }
  
  return { success: true };
}

// Handover conversation
async function handoverConversation(conversationId: string, handoverData: any) {
  console.log('Handing over conversation:', conversationId);
  
  // Get current assignment
  const { data: currentConversation } = await supabase
    .from('unified_conversations')
    .select('assigned_to')
    .eq('id', conversationId)
    .single();
  
  // Create handover record
  const { error: handoverError } = await supabase
    .from('conversation_handovers')
    .insert({
      conversation_id: conversationId,
      from_user_id: currentConversation?.assigned_to,
      to_user_id: handoverData.to_user_id,
      handover_type: 'manual',
      reason: handoverData.reason,
      notes: handoverData.notes,
      initiated_by: handoverData.initiated_by
    });
  
  if (handoverError) {
    throw new Error(`Failed to create handover record: ${handoverError.message}`);
  }
  
  // Update conversation assignment
  const { error: updateError } = await supabase
    .from('unified_conversations')
    .update({
      assigned_to: handoverData.to_user_id,
      last_activity_at: new Date().toISOString()
    })
    .eq('id', conversationId);
  
  if (updateError) {
    throw new Error(`Failed to update conversation assignment: ${updateError.message}`);
  }
  
  // Deactivate old assignments and create new one
  await supabase
    .from('conversation_assignments')
    .update({ is_active: false, unassigned_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('is_active', true);
  
  await supabase
    .from('conversation_assignments')
    .insert({
      conversation_id: conversationId,
      user_id: handoverData.to_user_id,
      role: 'assignee',
      assigned_by: handoverData.initiated_by
    });
  
  return { success: true };
}

// Update conversation status
async function updateConversationStatus(conversationId: string, statusUpdate: any) {
  console.log('Updating conversation status:', conversationId);
  
  const updateData: any = {
    last_activity_at: new Date().toISOString()
  };
  
  if (statusUpdate.status) {
    updateData.status = statusUpdate.status;
  }
  
  if (statusUpdate.priority) {
    updateData.priority = statusUpdate.priority;
  }
  
  if (statusUpdate.tags) {
    updateData.tags = statusUpdate.tags;
  }
  
  const { error } = await supabase
    .from('unified_conversations')
    .update(updateData)
    .eq('id', conversationId);
  
  if (error) {
    throw new Error(`Failed to update conversation: ${error.message}`);
  }
  
  return { success: true };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      action,
      conversation_id,
      filters,
      message_data,
      assignment_data,
      handover_data,
      status_update
    }: UnifiedInboxRequest = await req.json();

    switch (action) {
      case 'get_conversations': {
        const conversations = await getConversations(filters);
        
        return new Response(JSON.stringify({ 
          success: true,
          conversations
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'get_messages': {
        if (!conversation_id) {
          throw new Error('Conversation ID is required');
        }
        
        const messages = await getMessages(conversation_id);
        
        return new Response(JSON.stringify({ 
          success: true,
          messages
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'send_message': {
        if (!conversation_id || !message_data) {
          throw new Error('Conversation ID and message data are required');
        }
        
        const message = await sendMessage(conversation_id, message_data);
        
        return new Response(JSON.stringify({ 
          success: true,
          message
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'assign_conversation': {
        if (!conversation_id || !assignment_data) {
          throw new Error('Conversation ID and assignment data are required');
        }
        
        const result = await assignConversation(conversation_id, assignment_data);
        
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'handover_conversation': {
        if (!conversation_id || !handover_data) {
          throw new Error('Conversation ID and handover data are required');
        }
        
        const result = await handoverConversation(conversation_id, handover_data);
        
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'update_status': {
        if (!conversation_id || !status_update) {
          throw new Error('Conversation ID and status update are required');
        }
        
        const result = await updateConversationStatus(conversation_id, status_update);
        
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

  } catch (error) {
    console.error('Error in unified-inbox function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);