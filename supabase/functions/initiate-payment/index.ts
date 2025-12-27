import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  creator_id: string;
  phone_number: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const lipanaSecretKey = Deno.env.get("LIPANA_SECRET_KEY");

    if (!supabaseUrl || !serviceRoleKey || !lipanaSecretKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { creator_id, phone_number }: PaymentRequest = await req.json();

    // Validate input
    if (!creator_id || !phone_number) {
      return new Response(
        JSON.stringify({ error: "Missing creator_id or phone_number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format phone number (remove leading 0, add 254 if needed)
    let formattedPhone = phone_number.replace(/\s+/g, "").replace(/^0/, "");
    if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone;
    }

    console.log("Initiating payment for creator:", creator_id, "phone:", formattedPhone);

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify creator exists
    const { data: creator, error: creatorError } = await supabase
      .from("creators")
      .select("id, alias, full_name")
      .eq("id", creator_id)
      .single();

    if (creatorError || !creator) {
      console.error("Creator not found:", creatorError);
      return new Response(
        JSON.stringify({ error: "Creator not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create payment record first
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        creator_id,
        phone_number: formattedPhone,
        amount: 10,
        payment_status: "pending",
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Failed to create payment record:", paymentError);
      return new Response(
        JSON.stringify({ error: "Failed to create payment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Created payment record:", payment.id);

    // Initiate Lipana STK Push using correct API endpoint
    const lipanaResponse = await fetch("https://api.lipana.dev/v1/transactions/push-stk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": lipanaSecretKey,
      },
      body: JSON.stringify({
        phone: formattedPhone.startsWith("+") ? formattedPhone : `+${formattedPhone}`,
        amount: 10,
      }),
    });

    const lipanaData = await lipanaResponse.json();
    console.log("Lipana response:", JSON.stringify(lipanaData));

    if (!lipanaResponse.ok) {
      // Update payment as failed
      await supabase
        .from("payments")
        .update({ 
          payment_status: "failed", 
          lipana_response: lipanaData 
        })
        .eq("id", payment.id);

      return new Response(
        JSON.stringify({ 
          error: lipanaData.message || "Payment initiation failed",
          details: lipanaData
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update payment with checkout_id from Lipana response
    const checkoutId = lipanaData.data?.checkoutRequestID || lipanaData.data?.transactionId || lipanaData.checkoutRequestID;
    
    await supabase
      .from("payments")
      .update({ 
        checkout_id: checkoutId,
        lipana_response: lipanaData 
      })
      .eq("id", payment.id);

    console.log("Payment initiated successfully, checkout_id:", checkoutId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment_id: payment.id,
        checkout_id: checkoutId,
        message: "STK Push sent. Please check your phone."
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in initiate-payment:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
