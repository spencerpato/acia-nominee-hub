import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  creatorId: string;
  recipientEmail: string;
  recipientName: string;
  category: string;
  subject: string;
  htmlContent: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role for database operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Get auth header for user verification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - Missing bearer token" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");

    // Create client and verify the user session using the provided access token
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    const { data: userData, error: userError } = await supabaseAuth.auth.getUser(token);

    if (userError || !userData?.user) {
      console.error("Auth error:", userError?.message || "No user found");
      return new Response(JSON.stringify({ error: "Unauthorized - Invalid session" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userId = userData.user.id;

    console.log("User authenticated:", userId);

    // Use service role client to check admin role (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "superadmin"]);

    if (roleError) {
      console.error("Role check error:", roleError.message);
      return new Response(JSON.stringify({ error: "Failed to verify permissions" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!roleData || roleData.length === 0) {
      console.error("User is not an admin:", userId);
      return new Response(JSON.stringify({ error: "Forbidden: Admin access required" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Admin role verified for user:", userId);

    const { creatorId, recipientEmail, recipientName, category, subject, htmlContent }: EmailRequest = await req.json();

    // Add signature to email
    const fullHtmlContent = `
      ${htmlContent}
      <br><br>
      <p style="color: #666; font-size: 14px;">
        Regards,<br>
        <strong>Africa Creators Impact Awards (ACIA)</strong>
      </p>
    `;

    // Send email using Resend API directly
    console.log("Sending email to:", recipientEmail);
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Africa Creators Impact Awards <onboarding@resend.dev>",
        reply_to: "awardsacia@gmail.com",
        to: [recipientEmail],
        subject: subject,
        html: fullHtmlContent,
      }),
    });

    const emailData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailData);

    // Log the email in database using service role
    const { error: logError } = await supabaseAdmin.from("email_logs").insert({
      creator_id: creatorId,
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      category: category,
      subject: subject,
      admin_user_id: userId,
      status: "sent",
    });

    if (logError) {
      console.error("Failed to log email:", logError);
    }

    return new Response(JSON.stringify({ success: true, data: emailData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-admin-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
