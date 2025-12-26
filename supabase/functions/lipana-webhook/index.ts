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

    const payload = await req.json();
    console.log("Webhook received:", JSON.stringify(payload));

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Extract checkout_request_id from various possible payload structures
    const checkoutId = 
      payload.checkout_request_id || 
      payload.CheckoutRequestID || 
      payload.data?.checkout_request_id ||
      payload.data?.CheckoutRequestID;

    if (!checkoutId) {
      console.error("No checkout_request_id in webhook payload");
      return new Response(
        JSON.stringify({ error: "Invalid webhook payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the payment record
    const { data: payment, error: findError } = await supabase
      .from("payments")
      .select("*")
      .eq("checkout_id", checkoutId)
      .single();

    if (findError || !payment) {
      console.error("Payment not found for checkout_id:", checkoutId, findError);
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prevent duplicate processing
    if (payment.payment_status === "success") {
      console.log("Payment already processed as success:", payment.id);
      return new Response(
        JSON.stringify({ message: "Already processed" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine payment status from Lipana callback
    // Lipana typically sends result_code = 0 for success
    const resultCode = 
      payload.result_code ?? 
      payload.ResultCode ?? 
      payload.data?.result_code ??
      payload.data?.ResultCode;
    
    const isSuccess = resultCode === 0 || resultCode === "0" || payload.status === "success";
    const newStatus = isSuccess ? "success" : "failed";

    console.log("Updating payment", payment.id, "to status:", newStatus, "resultCode:", resultCode);

    // Update payment status - this will trigger the vote increment if successful
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        payment_status: newStatus,
        reference: payload.mpesa_receipt_number || payload.MpesaReceiptNumber || payload.data?.mpesa_receipt_number,
        lipana_response: payload,
      })
      .eq("id", payment.id);

    if (updateError) {
      console.error("Failed to update payment:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update payment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Payment updated successfully:", payment.id, "status:", newStatus);

    return new Response(
      JSON.stringify({ success: true, status: newStatus }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in lipana-webhook:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
