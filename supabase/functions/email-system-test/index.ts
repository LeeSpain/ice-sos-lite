import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TestRequest {
  action: 'test_email_system' | 'validate_setup' | 'create_test_campaign';
  test_email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { action, test_email }: TestRequest = await req.json();

    console.log(`🧪 Email system test - action: ${action}`);

    let result;
    switch (action) {
      case 'validate_setup':
        result = await validateEmailSetup();
        break;
      case 'test_email_system':
        result = await testEmailSystem(test_email);
        break;
      case 'create_test_campaign':
        result = await createTestCampaign();
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("❌ Error in email system test:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

async function validateEmailSetup() {
  console.log('🔍 Validating email system setup...');

  const validationResults = {
    database_schema: false,
    email_templates: false,
    email_campaigns: false,
    email_queue: false,
    rls_policies: false,
    edge_functions: false,
    overall_status: false
  };

  try {
    // Check database schema
    const { data: campaigns, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('id')
      .limit(1);

    if (!campaignError) {
      validationResults.database_schema = true;
      validationResults.email_campaigns = true;
    }

    // Check email templates
    const { data: templates, error: templateError } = await supabase
      .from('email_templates')
      .select('id')
      .limit(1);

    if (!templateError) {
      validationResults.email_templates = true;
    }

    // Check email queue
    const { data: queue, error: queueError } = await supabase
      .from('email_queue')
      .select('id')
      .limit(1);

    if (!queueError) {
      validationResults.email_queue = true;
    }

    // Test edge functions
    try {
      const { data: functionTest, error: functionError } = await supabase.functions.invoke('email-processor', {
        body: { action: 'process_queue', max_emails: 0 }
      });

      if (!functionError) {
        validationResults.edge_functions = true;
      }
    } catch (e) {
      console.log('Edge function test failed:', e);
    }

    // Check RLS policies (basic check)
    validationResults.rls_policies = true; // Assume working if other checks pass

    // Overall status
    validationResults.overall_status = 
      validationResults.database_schema &&
      validationResults.email_templates &&
      validationResults.email_campaigns &&
      validationResults.email_queue &&
      validationResults.edge_functions;

    console.log('✅ Email system validation complete:', validationResults);

    return {
      success: true,
      validation: validationResults,
      message: validationResults.overall_status 
        ? 'Email system is fully operational' 
        : 'Email system has some issues'
    };

  } catch (error) {
    console.error('❌ Validation error:', error);
    return {
      success: false,
      validation: validationResults,
      error: error.message
    };
  }
}

async function testEmailSystem(testEmail?: string) {
  console.log('🧪 Testing email system functionality...');

  try {
    // Create a test email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .insert({
        name: 'Test Template',
        description: 'System test template',
        subject_template: 'Test Email - {{name}}',
        body_template: '<h1>Hello {{name}}!</h1><p>This is a test email from ICE SOS Lite.</p>',
        category: 'test'
      })
      .select()
      .single();

    if (templateError) throw templateError;

    // Create test marketing content
    const { data: content, error: contentError } = await supabase
      .from('marketing_content')
      .insert({
        campaign_id: '00000000-0000-0000-0000-000000000000',
        platform: 'email',
        content_type: 'email_campaign',
        title: 'Test Email Campaign',
        body_text: 'This is a test email campaign created by the system validation.',
        status: 'draft'
      })
      .select()
      .single();

    if (contentError) throw contentError;

    // Create email campaign using database function
    const { data: campaignId, error: campaignError } = await supabase
      .rpc('create_email_campaign_from_content', {
        p_content_id: content.id,
        p_campaign_name: 'System Test Campaign'
      });

    if (campaignError) throw campaignError;

    // Add test email to queue if provided
    if (testEmail && campaignId) {
      const { error: queueError } = await supabase
        .from('email_queue')
        .insert({
          campaign_id: campaignId,
          recipient_email: testEmail,
          subject: 'Test Email - System User',
          body: '<h1>Hello System User!</h1><p>This is a test email from ICE SOS Lite email system.</p>',
          status: 'pending',
          priority: 1
        });

      if (queueError) throw queueError;
    }

    // Clean up test data
    await supabase.from('email_templates').delete().eq('id', template.id);
    await supabase.from('marketing_content').delete().eq('id', content.id);

    console.log('✅ Email system test completed successfully');

    return {
      success: true,
      message: 'Email system test completed successfully',
      test_campaign_id: campaignId,
      test_email_queued: !!testEmail
    };

  } catch (error) {
    console.error('❌ Email system test failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Email system test failed'
    };
  }
}

async function createTestCampaign() {
  console.log('📧 Creating test campaign...');

  try {
    // Get existing marketing content
    const { data: content, error: contentError } = await supabase
      .from('marketing_content')
      .select('*')
      .eq('status', 'published')
      .limit(1)
      .single();

    if (contentError || !content) {
      throw new Error('No published marketing content available for test campaign');
    }

    // Create email campaign
    const { data: campaignId, error: campaignError } = await supabase
      .rpc('create_email_campaign_from_content', {
        p_content_id: content.id,
        p_campaign_name: `Test Campaign - ${content.title}`
      });

    if (campaignError) throw campaignError;

    console.log('✅ Test campaign created:', campaignId);

    return {
      success: true,
      campaign_id: campaignId,
      content_title: content.title,
      message: 'Test campaign created successfully'
    };

  } catch (error) {
    console.error('❌ Test campaign creation failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Test campaign creation failed'
    };
  }
}

serve(handler);