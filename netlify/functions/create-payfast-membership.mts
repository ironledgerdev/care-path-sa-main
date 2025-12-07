import type { Context, Config } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";
import md5 from "blueimp-md5";

interface MembershipPaymentRequest {
  amount: number; // in cents
  description: string;
  plan: 'premium';
}

export default async (req: Request, context: Context) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  try {
    console.log("PayFast membership payment function called");

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Get environment variables
    const SUPABASE_URL = Netlify.env.get("VITE_SUPABASE_URL") || "";
    const SUPABASE_ANON_KEY = Netlify.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Netlify.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase configuration missing");
    }

    // Create Supabase client for user authentication
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Authentication failed");
    }

    console.log("User authenticated:", user.id);

    // Parse request body
    const { amount, description, plan }: MembershipPaymentRequest = await req.json();

    console.log("Membership payment request:", { amount, description, plan });

    // PayFast credentials
    const MERCHANT_ID = Netlify.env.get("PAYFAST_MERCHANT_ID") || "";
    const MERCHANT_KEY = Netlify.env.get("PAYFAST_MERCHANT_KEY") || "";
    const PASSPHRASE = Netlify.env.get("PAYFAST_PASSPHRASE") || "";

    if (!MERCHANT_ID || !MERCHANT_KEY || !PASSPHRASE) {
      throw new Error("PayFast credentials not configured");
    }

    // Use service role client to read profiles (bypass RLS)
    let profile: { first_name: string | null; last_name: string | null; email: string } | null = null;

    if (SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseServiceForProfile = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error: profileError } = await supabaseServiceForProfile
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      if (!profileError && data) {
        profile = data;
      }
    }

    // Fallback to anon client
    if (!profile) {
      const { data, error: profileError } = await supabaseClient
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single();

      if (profileError || !data) {
        throw new Error("Failed to get user profile");
      }
      profile = data;
    }

    // Determine frontend origin for return/cancel URLs
    const originHeader = req.headers.get("origin");
    const refererHeader = req.headers.get("referer");
    const FRONTEND_BASE_URL = Netlify.env.get("NETLIFY_SITE_URL") || Netlify.env.get("URL") || "";

    let frontendOrigin = originHeader || FRONTEND_BASE_URL;
    if (!frontendOrigin && refererHeader) {
      try {
        frontendOrigin = new URL(refererHeader).origin;
      } catch (_) {
        // ignore parsing errors
      }
    }

    if (!frontendOrigin) {
      frontendOrigin = "https://www.medmap.co.za";
    }

    // Get notify URL for webhook
    const siteUrl = Netlify.env.get("URL") || FRONTEND_BASE_URL || "https://www.medmap.co.za";

    // PayFast payment data
    const paymentData: Record<string, string> = {
      merchant_id: MERCHANT_ID,
      merchant_key: MERCHANT_KEY,
      return_url: `${frontendOrigin}/memberships?status=success`,
      cancel_url: `${frontendOrigin}/memberships?status=cancelled`,
      notify_url: `${siteUrl}/.netlify/functions/payfast-webhook`,
      amount: (amount / 100).toFixed(2),
      item_name: description,
      item_description: `Membership upgrade to ${plan}`,
      name_first: profile.first_name || '',
      name_last: profile.last_name || '',
      email_address: profile.email,
      custom_str1: `membership_${user.id}_${Date.now()}`,
      custom_str2: user.id,
      custom_str3: 'membership_payment',
    };

    // Generate signature for PayFast (MD5 of paramString + optional passphrase)
    const generateSignature = (data: Record<string, string>, passphrase: string) => {
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

    console.log("Membership payment data prepared with signature");

    // Create payment URL for PayFast (sandbox or live based on env)
    const PAYFAST_MODE = (Netlify.env.get("PAYFAST_MODE") || "sandbox").toLowerCase();
    const payfastBase = PAYFAST_MODE === "live"
      ? "https://www.payfast.co.za/eng/process"
      : "https://sandbox.payfast.co.za/eng/process";

    const paymentUrl = `${payfastBase}?${Object.keys(finalPaymentData)
      .map(key => `${key}=${encodeURIComponent(finalPaymentData[key])}`)
      .join('&')}`;

    console.log("Payment URL created for membership");

    // Ensure a membership row exists
    if (SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabaseService.from('memberships').upsert({
        user_id: user.id,
        membership_type: 'basic',
        is_active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: paymentUrl
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("PayFast membership payment error:", error.message);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        status: 500,
      }
    );
  }
};

export const config: Config = {
  path: "/api/create-payfast-membership"
};
