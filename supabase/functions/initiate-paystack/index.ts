import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaystackRequest {
  creator_id: string;
  email: string;
  amount: number; // Amount in cents (smallest currency unit) - already multiplied by 100
  votes_expected: number;
  currency: string; // Should always be KES for Kenyan Paystack account
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
      console.error("Missing environment variables:", {
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceRoleKey: !!serviceRoleKey,
        hasPaystackSecretKey: !!paystackSecretKey,
      });
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestBody = await req.json();
    const { creator_id, email, amount, votes_expected, currency, callback_url }: PaystackRequest = requestBody;

    console.log("Received Paystack request:", {
      creator_id,
      email,
      amount,
      votes_expected,
      currency,
      callback_url,
    });

    // Validate input
    if (!creator_id || !email || !amount || !votes_expected) {
      console.error("Missing required fields:", { creator_id, email, amount, votes_expected });
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Force KES currency for Kenyan Paystack account
    const finalCurrency = "KES";
    
    console.log("Initiating Paystack payment:", {
      creator_id,
      email,
      amount,
      votes_expected,
      currency: finalCurrency,
    });

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
    // Amount is already in cents, divide by 100 for storage in base unit
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        creator_id,
        phone_number: email, // Using email as identifier for Paystack
        amount: amount / 100, // Convert from cents to base unit for storage
        votes_expected,
        payment_status: "pending",
        payment_gateway: "paystack",
        currency: finalCurrency,
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

    console.log("Created payment record:", {
      payment_id: payment.id,
      amount: amount / 100,
      votes: votes_expected,
    });

    // Initialize Paystack transaction
    const paystackPayload = {
      email,
      amount, // Paystack expects amount in smallest currency unit (cents)
      currency: finalCurrency,
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
    };

    console.log("Sending to Paystack:", JSON.stringify(paystackPayload));

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${paystackSecretKey}`,
      },
      body: JSON.stringify(paystackPayload),
    });

    const paystackData = await paystackResponse.json();
    console.log("Paystack response status:", paystackResponse.status);
    console.log("Paystack response body:", JSON.stringify(paystackData));

    if (!paystackResponse.ok || !paystackData.status) {
      console.error("Paystack initialization failed:", {
        httpStatus: paystackResponse.status,
        response: paystackData,
      });
      
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
        checkout_id: reference,
        lipana_response: paystackData 
      })
      .eq("id", payment.id);

    console.log("Payment initiated successfully:", {
      reference,
      authorization_url: paystackData.data?.authorization_url,
    });

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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
