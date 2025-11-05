import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function base64urlDecode(str: string) {
  // add padding
  str = str.replaceAll('-', '+').replaceAll('_', '/');
  const pad = str.length % 4;
  if (pad === 2) str += '==';
  else if (pad === 3) str += '=';
  else if (pad !== 0) { /* invalid */ }
  const binary = atob(str);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr;
}

function utf8ToUint8Array(str: string) {
  return new TextEncoder().encode(str);
}

async function verifyHMAC(message: string, signature: Uint8Array, secret: string) {
  const key = await crypto.subtle.importKey('raw', utf8ToUint8Array(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  try {
    const isValid = await crypto.subtle.verify('HMAC', key, signature, utf8ToUint8Array(message));
    return isValid;
  } catch (e) {
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const { token } = body;
    if (!token) return new Response(JSON.stringify({ valid: false, error: 'token required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const parts = token.split('.');
    if (parts.length !== 3) return new Response(JSON.stringify({ valid: false, error: 'invalid token format' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const [encodedHeader, encodedPayload, encodedSig] = parts;
    const message = `${encodedHeader}.${encodedPayload}`;
    const sigBytes = base64urlDecode(encodedSig);
    const secret = Deno.env.get('ADMIN_INVITE_SECRET');
    if (!secret) return new Response(JSON.stringify({ valid: false, error: 'invite secret not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const valid = await verifyHMAC(message, sigBytes, secret);
    if (!valid) return new Response(JSON.stringify({ valid: false, error: 'signature mismatch' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // parse payload
    const payloadJson = new TextDecoder().decode(base64urlDecode(encodedPayload));
    let payload;
    try { payload = JSON.parse(payloadJson); } catch (e) { payload = null; }
    if (!payload) return new Response(JSON.stringify({ valid: false, error: 'invalid payload' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) return new Response(JSON.stringify({ valid: false, error: 'token expired' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    return new Response(JSON.stringify({ valid: true, payload }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('verify-admin-invite error', error);
    return new Response(JSON.stringify({ valid: false, error: (error && error.message) || String(error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
