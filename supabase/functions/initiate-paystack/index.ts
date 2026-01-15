import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaystackRequest {
  creator_id: string;
  email: string;
  amount: number; // Amount in kobo/pesewas (smallest currency unit)
  votes_expected: number;
  currency: string;
  callback_url: string;
}

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

    const { creator_id, email, amount, votes_expected, currency, callback_url }: PaystackRequest = await req.json();

    // Validate input
    if (!creator_id || !email || !amount || !votes_expected) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Initiating Paystack payment for creator:", creator_id, "email:", email, "amount:", amount, "currency:", currency);

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

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        creator_id,
        phone_number: email, // Using email as identifier for Paystack
        amount: amount / 100, // Convert from smallest unit to base unit for storage
        votes_expected,
        payment_status: "pending",
        payment_gateway: "paystack",
        currency: currency || "NGN",
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

    console.log("Created payment record:", payment.id, "amount:", amount, "votes:", votes_expected);

    // Initialize Paystack transaction
    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${paystackSecretKey}`,
      },
      body: JSON.stringify({
        email,
        amount, // Paystack expects amount in smallest currency unit (kobo, pesewas, etc.)
        currency: currency || "NGN",
        callback_url: callback_url || "https://aciawards.netlify.app/vote-success",
        metadata: {
          payment_id: payment.id,
          creator_id,
          votes_expected,
          custom_fields: [
            {
              display_name: "Votes",
              variable_name: "votes",
              value: votes_expected.toString()
            },
            {
              display_name: "Creator",
              variable_name: "creator",
              value: creator.alias
            }
          ]
        }
      }),
    });

    const paystackData = await paystackResponse.json();
    console.log("Paystack response:", JSON.stringify(paystackData));

    if (!paystackResponse.ok || !paystackData.status) {
      // Update payment as failed
      await supabase
        .from("payments")
        .update({ 
          payment_status: "failed",
          lipana_response: paystackData 
        })
        .eq("id", payment.id);

      return new Response(
        JSON.stringify({ 
          error: paystackData.message || "Payment initiation failed",
          details: paystackData
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update payment with Paystack reference
    const reference = paystackData.data?.reference;
    
    await supabase
      .from("payments")
      .update({ 
        paystack_reference: reference,
        checkout_id: reference, // Also store in checkout_id for consistency
        lipana_response: paystackData 
      })
      .eq("id", payment.id);

    console.log("Payment initiated successfully, reference:", reference);

    return new Response(
      JSON.stringify({ 
        success: true, 
        payment_id: payment.id,
        reference,
        authorization_url: paystackData.data?.authorization_url,
        access_code: paystackData.data?.access_code,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in initiate-paystack:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
