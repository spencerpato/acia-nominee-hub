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
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

    if (!supabaseUrl || !serviceRoleKey || !paystackSecretKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const reference = url.searchParams.get("reference");

    if (!reference) {
      return new Response(
        JSON.stringify({ error: "Missing reference parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verifying Paystack payment:", reference);

    // Verify transaction with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
      },
    });

    const paystackData = await paystackResponse.json();
    console.log("Paystack verification response:", JSON.stringify(paystackData));

    if (!paystackResponse.ok || !paystackData.status) {
      return new Response(
        JSON.stringify({ 
          error: "Verification failed",
          status: "failed",
          details: paystackData
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Check if payment was successful
    if (paystackData.data?.status === "success") {
      // Find and update the payment record
      const { data: payment, error: findError } = await supabase
        .from("payments")
        .select("*")
        .or(`paystack_reference.eq.${reference},checkout_id.eq.${reference}`)
        .single();

      if (findError || !payment) {
        console.error("Payment not found for reference:", reference);
        return new Response(
          JSON.stringify({ error: "Payment record not found", status: "failed" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Only update if not already successful
      if (payment.payment_status !== "success") {
        const { error: updateError } = await supabase
          .from("payments")
          .update({
            payment_status: "success",
            reference: paystackData.data.id?.toString() || reference,
            lipana_response: paystackData,
          })
          .eq("id", payment.id);

        if (updateError) {
          console.error("Failed to update payment:", updateError);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          status: "success",
          payment_id: payment.id,
          votes: payment.votes_expected,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        status: paystackData.data?.status || "pending",
        message: paystackData.data?.gateway_response || "Payment not completed"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in verify-paystack:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", status: "failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
