import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmergencyContact {
  name: string;
  email?: string;
  phone: string;
  relationship: string;
}

interface EmergencySOSRequest {
  userProfile: {
    first_name: string;
    last_name: string;
    emergency_contacts: EmergencyContact[];
  };
  location: string;
  timestamp: string;
}

// Sequential calling with Twilio
const makeSequentialCalls = async (contacts: EmergencyContact[], userName: string, location: string) => {
  const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    console.log("⚠️ Twilio not configured - calls will be simulated");
    return contacts.map((contact, index) => ({
      contact: contact.name,
      phone: contact.phone,
      priority: index + 1,
      status: "simulated",
      message: "Call simulation - Twilio not configured"
    }));
  }

  const callResults = [];
  
  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    if (!contact.phone) continue;

    try {
      const emergencyMessage = `Emergency alert for ${userName}. Location: ${location}. This is an automated emergency call from ICE SOS. Please check on ${userName} immediately and contact emergency services if needed.`;
      
      // Make Twilio call
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: contact.phone,
            From: twilioPhoneNumber,
            Twiml: `<Response><Say voice="alice">${emergencyMessage}</Say><Pause length="2"/><Say voice="alice">Press any key to confirm you received this emergency alert.</Say><Gather numDigits="1" timeout="10"><Say voice="alice">Waiting for confirmation...</Say></Gather><Say voice="alice">Emergency alert complete. Please take immediate action.</Say></Response>`
          })
        }
      );

      if (response.ok) {
        const callData = await response.json();
        callResults.push({
          contact: contact.name,
          phone: contact.phone,
          priority: i + 1,
          status: "initiated",
          callSid: callData.sid,
          message: "Emergency call initiated successfully"
        });

        console.log(`📞 Emergency call initiated to ${contact.name} (${contact.phone})`);
        
        // Wait 30 seconds before next call (allows time for answer)
        if (i < contacts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 30000));
        }
      } else {
        throw new Error(`Twilio API error: ${response.status}`);
      }

    } catch (error) {
      console.error(`❌ Failed to call ${contact.name}:`, error);
      callResults.push({
        contact: contact.name,
        phone: contact.phone,
        priority: i + 1,
        status: "failed",
        error: error.message
      });
    }
  }

  return callResults;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userProfile, location, timestamp }: EmergencySOSRequest = await req.json();
    
    const userName = `${userProfile.first_name} ${userProfile.last_name}`.trim();
    const emergencyTime = new Date(timestamp).toLocaleString();
    
    console.log(`🚨 ENHANCED EMERGENCY SOS triggered by ${userName} at ${emergencyTime}`);
    console.log(`📍 Location: ${location}`);

    const notifications = [];
    const callResults = [];

    // Start sequential calling immediately for high priority
    const phoneContacts = userProfile.emergency_contacts.filter(c => c.phone);
    if (phoneContacts.length > 0) {
      console.log(`📞 Initiating sequential calls to ${phoneContacts.length} contacts...`);
      const calls = await makeSequentialCalls(phoneContacts, userName, location);
      callResults.push(...calls);
    }

    // Send email notifications simultaneously
    for (const contact of userProfile.emergency_contacts) {
      if (contact.email) {
        try {
          const emailResponse = await resend.emails.send({
            from: "ICE SOS Emergency <emergency@resend.dev>",
            to: [contact.email],
            subject: `🚨 CRITICAL EMERGENCY - ${userName} needs immediate assistance`,
            html: `
              <div style="background: linear-gradient(135deg, #00CC66, #00AA55); color: white; padding: 20px; border-radius: 10px; font-family: Arial, sans-serif;">
                <h1 style="color: white; text-align: center; margin: 0 0 20px 0;">🚨 CRITICAL EMERGENCY ALERT 🚨</h1>
                
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="color: white; margin: 0 0 10px 0;">Emergency Details:</h2>
                  <p><strong>Person in Emergency:</strong> ${userName}</p>
                  <p><strong>Time:</strong> ${emergencyTime}</p>
                  <p><strong>Location:</strong> ${location}</p>
                  <p><strong>Your Relationship:</strong> ${contact.relationship}</p>
                  <p><strong>Contact Priority:</strong> ${userProfile.emergency_contacts.indexOf(contact) + 1}</p>
                </div>

                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: white; margin: 0 0 10px 0;">🚨 IMMEDIATE ACTION REQUIRED:</h3>
                  <ol style="color: white; line-height: 1.6;">
                    <li><strong>Call ${userName} immediately: ${contact.phone || 'Phone not provided'}</strong></li>
                    <li><strong>If no response, call emergency services NOW</strong></li>
                    <li><strong>Go to their location if possible: ${location}</strong></li>
                    <li><strong>This is a REAL EMERGENCY - not a test</strong></li>
                  </ol>
                </div>

                <div style="text-align: center; margin: 20px 0; background: rgba(255,0,0,0.3); padding: 15px; border-radius: 8px;">
                  <p style="font-size: 20px; font-weight: bold; color: white; margin: 0;">⚠️ AUTOMATIC CALLS IN PROGRESS ⚠️</p>
                  <p style="color: white; margin: 5px 0 0 0;">Sequential emergency calls are being made to all contacts</p>
                </div>

                <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 5px; margin-top: 20px;">
                  <p style="font-size: 12px; color: white; margin: 0; text-align: center;">
                    Sent by ICE SOS Enhanced Emergency Protection System | If false alarm, contact ${userName} immediately
                  </p>
                </div>
              </div>
            `,
          });

          notifications.push({
            contact: contact.name,
            email: contact.email,
            status: "sent",
            response: emailResponse
          });

          console.log(`✅ Emergency email sent to ${contact.name} (${contact.email})`);
        } catch (emailError) {
          console.error(`❌ Failed to send email to ${contact.name}:`, emailError);
          notifications.push({
            contact: contact.name,
            email: contact.email,
            status: "failed",
            error: emailError.message
          });
        }
      }
    }

    // Log comprehensive emergency summary
    console.log(`📋 ENHANCED EMERGENCY SOS SUMMARY:
      - User: ${userName}
      - Time: ${emergencyTime}
      - Location: ${location}
      - Total contacts: ${userProfile.emergency_contacts.length}
      - Emails sent: ${notifications.filter(n => n.status === 'sent').length}
      - Calls initiated: ${callResults.filter(c => c.status === 'initiated').length}
      - Failed emails: ${notifications.filter(n => n.status === 'failed').length}
      - Failed calls: ${callResults.filter(c => c.status === 'failed').length}
    `);

    return new Response(JSON.stringify({
      success: true,
      message: "Enhanced emergency SOS activated successfully",
      notifications,
      calls: callResults,
      summary: {
        total_contacts: userProfile.emergency_contacts.length,
        emails_sent: notifications.filter(n => n.status === 'sent').length,
        failed_emails: notifications.filter(n => n.status === 'failed').length,
        calls_initiated: callResults.filter(c => c.status === 'initiated').length,
        failed_calls: callResults.filter(c => c.status === 'failed').length,
        emergency_time: emergencyTime,
        location: location
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("🚨 Enhanced Emergency SOS function error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        message: "Enhanced emergency notification system encountered an error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);