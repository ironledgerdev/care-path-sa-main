import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import md5 from "https://esm.sh/blueimp-md5@2.19.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PayFastPaymentRequest {
  booking_id: string;
  amount: number;
  description: string;
  doctor_name: string;
  appointment_date: string;
  appointment_time: string;
}

serve(async (req) => {
  console.log("PayFast payment function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Authentication failed");
    }

    console.log("User authenticated:", user.id);

    // Parse request body
    const {
      booking_id,
      amount,
      description,
      doctor_name,
      appointment_date,
      appointment_time
    }: PayFastPaymentRequest = await req.json();

    console.log("Payment request:", { booking_id, amount, description });

    // PayFast credentials
    const MERCHANT_ID = Deno.env.get("PAYFAST_MERCHANT_ID");
    const MERCHANT_KEY = Deno.env.get("PAYFAST_MERCHANT_KEY");
    const PASSPHRASE = Deno.env.get("PAYFAST_PASSPHRASE");

    if (!MERCHANT_ID || !MERCHANT_KEY || !PASSPHRASE) {
      throw new Error("PayFast credentials not configured");
    }

    // Get user profile for payment details
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Failed to get user profile");
    }

    // Determine frontend origin for return/cancel URLs
    const originHeader = req.headers.get("origin");
    const refererHeader = req.headers.get("referer");
    const FRONTEND_BASE_URL = Deno.env.get("FRONTEND_BASE_URL") ?? "";

    let frontendOrigin = originHeader || FRONTEND_BASE_URL;
    if (!frontendOrigin && refererHeader) {
      try {
        frontendOrigin = new URL(refererHeader).origin;
      } catch (_) {
        // ignore parsing errors
      }
    }

    if (!frontendOrigin) {
      throw new Error("Unable to determine frontend origin. Set FRONTEND_BASE_URL env or ensure Origin/Referer header is sent.");
    }

    // PayFast payment data
    const paymentData = {
      merchant_id: MERCHANT_ID,
      merchant_key: MERCHANT_KEY,
      return_url: `${frontendOrigin}/booking-success?booking_id=${booking_id}`,
      cancel_url: `${frontendOrigin}/booking-cancelled?booking_id=${booking_id}`,
      notify_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/payfast-webhook`,

      // Payment details
      amount: (amount / 100).toFixed(2), // Convert from cents to rands
      item_name: description,
      item_description: `Appointment with ${doctor_name} on ${appointment_date} at ${appointment_time}`,

      // Customer details
      name_first: profile.first_name || '',
      name_last: profile.last_name || '',
      email_address: profile.email,

      // Custom fields
      custom_str1: booking_id,
      custom_str2: user.id,
      custom_str3: 'booking_payment',
    };

    // Generate signature for PayFast (MD5 of paramString + optional passphrase)
    const generateSignature = (data: Record<string, unknown>, passphrase: string) => {
      const paramString = Object.keys(data)
        .filter((key) => data[key] !== '' && data[key] !== null && data[key] !== undefined)
        .sort()
        .map((key) => `${key}=${encodeURIComponent(String(data[key]))}`)
        .join('&');
      const stringToHash = passphrase
        ? `${paramString}&passphrase=${encodeURIComponent(passphrase)}`
        : paramString;
      return md5(stringToHash);
    };

    // Add signature to payment data
    const signature = generateSignature(paymentData, PASSPHRASE);
    const finalPaymentData = { ...paymentData, signature };

    console.log("Payment data prepared:", finalPaymentData);

    // Create payment URL for PayFast (sandbox or live based on env)
    const PAYFAST_MODE = (Deno.env.get("PAYFAST_MODE") ?? "sandbox").toLowerCase();
    const payfastBase = PAYFAST_MODE === "live"
      ? "https://www.payfast.co.za/eng/process"
      : "https://sandbox.payfast.co.za/eng/process";

    const paymentUrl = `${payfastBase}?${Object.keys(finalPaymentData)
      .map(key => `${key}=${encodeURIComponent(finalPaymentData[key])}`)
      .join('&')}`;

    console.log("Payment URL created");

    // Update booking with PayFast reference
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: updateError } = await supabaseService
      .from('bookings')
      .update({
        payment_reference: `PF_${booking_id}_${Date.now()}`,
        payment_status: 'pending'
      })
      .eq('id', booking_id);

    if (updateError) {
      console.error("Failed to update booking:", updateError);
      throw new Error("Failed to update booking record");
    }

    console.log("Booking updated successfully");

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: paymentUrl,
        booking_id: booking_id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("PayFast payment error:", error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
