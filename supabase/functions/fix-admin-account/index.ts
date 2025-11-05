import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, Authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
  "Vary": "Origin"
};

interface FixAdminRequest {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { userId, email, firstName, lastName }: FixAdminRequest = await req.json();

    if (!userId || !email || !firstName || !lastName) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing required fields: userId, email, firstName, lastName' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Create service role client (bypasses RLS)
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🔧 Fixing admin account for user:', userId);

    // Step 1: Check if profile exists
    const { data: existingProfile, error: getError } = await serviceSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    let profile;

    if (existingProfile) {
      console.log('📝 Profile exists, updating to admin role...');
      // Profile exists, update it with service role privileges
      const { data: updatedProfile, error: updateError } = await serviceSupabase
        .from('profiles')
        .update({
          role: 'admin',
          first_name: firstName,
          last_name: lastName,
          email: email,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Update error:', updateError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Failed to update profile: ${updateError.message}`,
          details: updateError
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      profile = updatedProfile;
    } else {
      console.log('🆕 Profile does not exist, creating new one...');
      // Profile doesn't exist, create it with service role privileges
      const { data: createdProfile, error: createError } = await serviceSupabase
        .from('profiles')
        .insert({
          id: userId,
          email: email,
          first_name: firstName,
          last_name: lastName,
          role: 'admin',
          email_verified: true, // Set as verified since this is admin recovery
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('Create error:', createError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Failed to create profile: ${createError.message}`,
          details: createError
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      profile = createdProfile;
    }

    // Step 2: Verify admin role was set correctly
    if (profile.role !== 'admin') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Profile updated but admin role was not set correctly',
        profile
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log('✅ Admin account fixed successfully for:', email);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Admin account fixed successfully! You can now login with admin privileges.',
      profile: {
        id: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Unexpected error: ${error.message}`,
      details: error
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
