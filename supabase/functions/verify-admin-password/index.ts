import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { password } = body;
    if (!password) return new Response(JSON.stringify({ valid: false, error: 'password required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const secret = Deno.env.get('ADMIN_PASSWORD');
    if (!secret) return new Response(JSON.stringify({ valid: false, error: 'server password not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const valid = password === secret;
    return new Response(JSON.stringify({ valid }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('verify-admin-password error', error);
    return new Response(JSON.stringify({ valid: false, error: (error && error.message) || String(error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
