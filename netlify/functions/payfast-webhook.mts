import type { Context, Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import md5 from "blueimp-md5";

export default async (req: Request, context: Context) => {
  console.log("PayFast webhook called");

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const paymentData: Record<string, string> = {};

    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      paymentData[key] = value.toString();
    }

    console.log("PayFast webhook data received");

    // Basic merchant validation
    const MERCHANT_ID = Netlify.env.get("PAYFAST_MERCHANT_ID") || "";
    const MERCHANT_KEY = Netlify.env.get("PAYFAST_MERCHANT_KEY") || "";
    const PASSPHRASE = Netlify.env.get("PAYFAST_PASSPHRASE") || "";

    if (!MERCHANT_ID || !MERCHANT_KEY || !PASSPHRASE) {
      console.error("PayFast credentials not configured in webhook env");
      return new Response("Missing credentials", { status: 500, headers: corsHeaders });
    }

    if (paymentData.merchant_id !== MERCHANT_ID || paymentData.merchant_key !== MERCHANT_KEY) {
      console.error("Merchant credentials mismatch");
      return new Response("Invalid merchant", { status: 400, headers: corsHeaders });
    }

    // Verify signature from PayFast
    const signatureFromPF = paymentData.signature;
    const dataForSig = Object.keys(paymentData)
      .filter((k) => k !== "signature" && paymentData[k] !== "" && paymentData[k] !== undefined && paymentData[k] !== null)
      .sort()
      .map((k) => `${k}=${encodeURIComponent(paymentData[k])}`)
      .join("&");
    const stringToHash = `${dataForSig}&passphrase=${encodeURIComponent(PASSPHRASE)}`;
    const expectedSignature = md5(stringToHash);

    if (!signatureFromPF || signatureFromPF.toLowerCase() !== expectedSignature.toLowerCase()) {
      console.error("Invalid signature", { signatureFromPF, expectedSignature });
      return new Response("Invalid signature", { status: 400, headers: corsHeaders });
    }

    // Verify the payment status
    const paymentStatus = paymentData.payment_status;
    const customStr1 = paymentData.custom_str1; // booking_id or membership identifier
    const customStr2 = paymentData.custom_str2; // user_id
    const customStr3 = paymentData.custom_str3; // payment type

    // Get Supabase credentials
    const SUPABASE_URL = Netlify.env.get("VITE_SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Supabase credentials not configured");
      return new Response("Missing Supabase credentials", { status: 500, headers: corsHeaders });
    }

    // Create Supabase service client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (paymentStatus === 'COMPLETE') {
      console.log("Payment completed successfully");

      if (customStr3 === 'booking_payment') {
        // Optional: validate amount matches booking
        const { data: bookingRow, error: bookingFetchError } = await supabase
          .from('bookings')
          .select('total_amount')
          .eq('id', customStr1)
          .single();

        if (bookingFetchError) {
          console.error("Failed to fetch booking for validation:", bookingFetchError);
        } else {
          const expectedCents = bookingRow?.total_amount ?? 0;
          const paidCents = Math.round(parseFloat(paymentData.amount || '0') * 100);
          if (expectedCents > 0 && paidCents !== expectedCents) {
            console.error("Amount mismatch", { expectedCents, paidCents });
            return new Response("Amount mismatch", { status: 400, headers: corsHeaders });
          }
        }

        // Handle booking payment
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({
            payment_status: 'paid',
            status: 'confirmed'
          })
          .eq('id', customStr1);

        if (bookingError) {
          console.error("Failed to update booking:", bookingError);
          throw bookingError;
        }

        console.log("Booking payment processed successfully");

      } else if (customStr3 === 'membership_payment') {
        // Handle membership payment
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3); // 3 months (quarterly)

        const { error: membershipError } = await supabase
          .from('memberships')
          .update({
            membership_type: 'premium',
            is_active: true,
            current_period_start: startDate.toISOString(),
            current_period_end: endDate.toISOString(),
            free_bookings_remaining: 3,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', customStr2);

        if (membershipError) {
          console.error("Failed to update membership:", membershipError);
          throw membershipError;
        }

        console.log("Membership payment processed successfully");
      }

    } else if (paymentStatus === 'CANCELLED' || paymentStatus === 'FAILED') {
      console.log("Payment cancelled or failed");

      if (customStr3 === 'booking_payment') {
        // Update booking status to cancelled
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({
            payment_status: 'failed',
            status: 'cancelled'
          })
          .eq('id', customStr1);

        if (bookingError) {
          console.error("Failed to update booking:", bookingError);
        }
      }
    }

    return new Response("OK", {
      status: 200,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error("PayFast webhook error:", error.message);

    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
};

export const config: Config = {
  path: "/api/payfast-webhook"
};
