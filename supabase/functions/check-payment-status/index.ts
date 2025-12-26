import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const paymentId = url.searchParams.get("payment_id");

    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: "Missing payment_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: payment, error } = await supabase
      .from("payments")
      .select("id, payment_status, created_at")
      .eq("id", paymentId)
      .single();

    if (error || !payment) {
      console.error("Payment not found:", paymentId, error);
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if payment is too old (> 5 minutes) and still pending
    const createdAt = new Date(payment.created_at);
    const now = new Date();
    const ageMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    if (payment.payment_status === "pending" && ageMinutes > 5) {
      // Mark as expired/failed
      await supabase
        .from("payments")
        .update({ payment_status: "failed" })
        .eq("id", paymentId);

      return new Response(
        JSON.stringify({ status: "failed", reason: "timeout" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ status: payment.payment_status }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in check-payment-status:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
