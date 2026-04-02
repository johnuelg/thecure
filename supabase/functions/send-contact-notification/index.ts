import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactNotificationRequest {
  name: string;
  email: string;
  subject: string | null;
  message: string;
  meetingUrl?: string;
  meetingPlatform?: string;
  meetingDate?: string;
  meetingTime?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resend = new Resend(resendApiKey);

    // Parse request body
    const { name, email, subject, message }: ContactNotificationRequest = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch profile email from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("email, full_name")
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch recipient email" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // In Resend testing mode, emails can only be sent to the verified owner email
    // Override to use the verified testing email address
    const recipientEmail = "shielaj.projects@outlook.com";
    console.log("Sending notification to:", recipientEmail);

    const emailSubject = subject 
      ? `New Contact Form Message: ${subject}` 
      : `New Contact Form Message from ${name}`;

    const timestamp = new Date().toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Message</h1>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #0f172a;">Sender Details</h2>
      <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${name}</p>
      <p style="margin: 0 0 8px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0ea5e9;">${email}</a></p>
      ${subject ? `<p style="margin: 0;"><strong>Subject:</strong> ${subject}</p>` : ''}
    </div>
    
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
      <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #0f172a;">Message</h2>
      <p style="margin: 0; white-space: pre-wrap;">${message}</p>
    </div>
    
    <div style="text-align: center; margin-top: 25px;">
      <a href="mailto:${email}?subject=Re: ${subject || 'Your message'}" 
         style="display: inline-block; background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Reply to ${name}
      </a>
    </div>
    
    <p style="margin: 25px 0 0 0; font-size: 12px; color: #64748b; text-align: center;">
      Received on ${timestamp}
    </p>
  </div>
</body>
</html>
    `;

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: emailSubject,
      html: htmlContent,
      reply_to: email,
    });

    console.log("Contact notification email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-contact-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
