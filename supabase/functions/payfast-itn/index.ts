import { serve } from "https://deno.land/std/http/server.ts";
import md5 from "https://esm.sh/blueimp-md5@2.19.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const form = await req.formData();
  const data: Record<string, string> = {};
  form.forEach((value, key) => (data[key] = value.toString()));

  console.log("ITN Received:", data);

  // REQUIRED: Validate signature
  const passphrase = Deno.env.get("PAYFAST_PASSPHRASE") ?? "";
  const signature = data["signature"];
  delete data["signature"];

  const sorted = Object.keys(data)
    .sort()
    .map(k => `${k}=${encodeURIComponent(data[k]).replace(/%20/g, "+")}`)
    .join("&");

  const calculated = md5(sorted + (passphrase ? `&passphrase=${passphrase}` : ""));

  if (calculated !== signature) {
    return new Response("Invalid signature", { status: 400 });
  }

  // Mark booking paid
  await supabase
    .from("bookings")
    .update({ status: "paid", payment_status: "completed" })
    .eq("pf_payment_reference", data["m_payment_id"]);

  return new Response("OK"); // Very important
});
