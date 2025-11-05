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

interface EnrollmentForm {
  practice_name: string;
  speciality: string;
  qualification: string;
  license_number: string;
  years_experience: string;
  consultation_fee: string; // rands
  address: string;
  city: string;
  province: string;
  postal_code: string;
  bio: string;
}

interface ApplicantInfo {
  first_name?: string;
  last_name?: string;
  email?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { form, applicant }: { form: EnrollmentForm; applicant?: ApplicantInfo } = await req.json();

    const anon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const service = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Determine user: try auth header first
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    let emailForNotifications: string | null = null;
    let firstName: string | null = null;
    let lastName: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await anon.auth.getUser(token);
      if (user) {
        userId = user.id;
        emailForNotifications = user.email ?? null;
        firstName = (user.user_metadata as any)?.first_name ?? null;
        lastName = (user.user_metadata as any)?.last_name ?? null;
      }
    }

    // If no logged-in user, create invited account
    if (!userId) {
      if (!applicant?.email || !applicant.first_name || !applicant.last_name) {
        return new Response(JSON.stringify({ success: false, error: 'Missing applicant details' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const { data: created, error: createErr } = await service.auth.admin.inviteUserByEmail(applicant.email, {
        data: { first_name: applicant.first_name, last_name: applicant.last_name, role: 'doctor' }
      });
      if (createErr) throw createErr;

      userId = created?.user?.id ?? null;
      emailForNotifications = applicant.email;
      firstName = applicant.first_name;
      lastName = applicant.last_name;

      if (!userId) throw new Error('Failed to create applicant user');

      // Upsert profile with temporary patient role until approval
      await service.from('profiles').upsert({
        id: userId,
        email: applicant.email,
        first_name: applicant.first_name,
        last_name: applicant.last_name,
        role: 'patient',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    }

    // Insert pending doctor application
    const years = parseInt(form.years_experience || '0', 10) || 0;
    const feeCents = Math.round(parseFloat(form.consultation_fee || '0') * 100) || 0;

    const { error: insertErr } = await service.from('pending_doctors').insert({
      user_id: userId,
      practice_name: form.practice_name,
      speciality: form.speciality,
      qualification: form.qualification,
      license_number: form.license_number,
      years_experience: years,
      consultation_fee: feeCents,
      address: form.address,
      city: form.city,
      province: form.province,
      postal_code: form.postal_code,
      bio: form.bio,
      status: 'pending'
    });

    if (insertErr) throw insertErr;

    // Notify via email (custom template)
    try {
      await anon.functions.invoke('send-email', {
        body: {
          type: 'doctor_pending',
          data: {
            doctor_name: `${firstName ?? ''} ${lastName ?? ''}`.trim() || 'Doctor',
            doctor_email: emailForNotifications,
            practice_name: form.practice_name,
            speciality: form.speciality,
            license_number: form.license_number
          }
        }
      });
    } catch (_e) {}

    return new Response(JSON.stringify({ success: true, user_id: userId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: e?.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
