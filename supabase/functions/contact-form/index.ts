import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  sessionId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Contact form handler called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { name, email, subject, message, sessionId }: ContactFormData = await req.json();

    console.log('Processing contact form submission:', { name, email, subject, sessionId });

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: 'All fields are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Get client IP and user agent from headers
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Store contact submission in database
    const { data: submission, error: dbError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        subject,
        message,
        ip_address: clientIP,
        user_agent: userAgent,
        session_id: sessionId || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to store submission' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('Contact submission stored:', submission.id);

    // Send notification email to admin
    const adminEmailResponse = await resend.emails.send({
      from: 'ICE SOS Lite Contact <noreply@icesoslite.com>',
      to: ['icesoslite@gmail.com'],
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Submission ID:</strong> ${submission.id}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <hr style="margin: 20px 0;">
        <p><strong>Technical Details:</strong></p>
        <ul>
          <li>IP Address: ${clientIP}</li>
          <li>User Agent: ${userAgent}</li>
          <li>Session ID: ${sessionId || 'Not provided'}</li>
          <li>Submitted: ${new Date().toISOString()}</li>
        </ul>
        <p><a href="https://supabase.com/dashboard/project/mqroziggaalltuzoyyao" target="_blank">View in Admin Dashboard</a></p>
      `,
    });

    if (adminEmailResponse.error) {
      console.error('Failed to send admin notification email:', adminEmailResponse.error);
      // Don't fail the request if admin email fails - user confirmation is more important
    } else {
      console.log('Admin notification email sent successfully');
    }

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: 'ICE SOS Lite Support <support@icesoslite.com>',
      to: [email],
      subject: 'We received your message - ICE SOS Lite',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #1f2937; margin-bottom: 20px;">Thank you for contacting us!</h1>
          
          <p>Dear ${name},</p>
          
          <p>We have received your message and will get back to you as soon as possible. Our typical response time is 24-48 hours during business days.</p>
          
          <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">Your Message Summary:</h3>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="color: #6b7280; font-style: italic;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <p>If you have any urgent emergency needs, please remember that ICE SOS Lite is designed to complement, not replace, traditional emergency services. In life-threatening situations, always contact your local emergency services (911, 112, etc.) immediately.</p>
          
          <p>For immediate assistance with our app, you can also use our AI assistant Emma directly in the application.</p>
          
          <p>Best regards,<br>
          The ICE SOS Lite Support Team</p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #6b7280;">
            This is an automated response to confirm we received your message. 
            Reference ID: ${submission.id}
          </p>
        </div>
      `,
    });

    if (userEmailResponse.error) {
      console.error('Failed to send user confirmation email:', userEmailResponse.error);
      return new Response(JSON.stringify({ 
        success: true, 
        submissionId: submission.id,
        warning: 'Message received but confirmation email failed to send'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('User confirmation email sent successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      submissionId: submission.id,
      message: 'Contact form submitted successfully. Check your email for confirmation.'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in contact-form function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);