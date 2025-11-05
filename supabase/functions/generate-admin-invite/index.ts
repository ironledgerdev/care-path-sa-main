import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function base64url(input: Uint8Array) {
  // base64url encode
  const base64 = btoa(String.fromCharCode(...input));
  return base64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function utf8ToUint8Array(str: string) {
  return new TextEncoder().encode(str);
}

async function sign(message: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', utf8ToUint8Array(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, utf8ToUint8Array(message));
  return new Uint8Array(sig);
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { email, ttl = 3600 } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: 'email required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const secret = Deno.env.get('ADMIN_INVITE_SECRET');
    if (!secret) {
      return new Response(JSON.stringify({ error: 'invite secret not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const payload = {
      email,
      iat: nowSeconds(),
      exp: nowSeconds() + Number(ttl),
    };

    const header = { alg: 'HS256', typ: 'JWT' };

    const encodedHeader = base64url(utf8ToUint8Array(JSON.stringify(header)));
    const encodedPayload = base64url(utf8ToUint8Array(JSON.stringify(payload)));
    const message = `${encodedHeader}.${encodedPayload}`;
    const signature = await sign(message, secret);
    const encodedSig = base64url(signature);

    const token = `${message}.${encodedSig}`;

    return new Response(JSON.stringify({ token }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('generate-admin-invite error', error);
    return new Response(JSON.stringify({ error: (error && error.message) || String(error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
