import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateBookingRequest {
  doctor_id: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM
  patient_notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const anon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await anon.auth.getUser(token);
    if (authError || !user) throw new Error('Authentication failed');

    const { doctor_id, appointment_date, appointment_time, patient_notes }: CreateBookingRequest = await req.json();
    if (!doctor_id || !appointment_date || !appointment_time) throw new Error('Missing required fields');

    const service = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch doctor fee
    const { data: doctor, error: docErr } = await service
      .from('doctors')
      .select('id, consultation_fee')
      .eq('id', doctor_id)
      .single();
    if (docErr || !doctor) throw new Error('Doctor not found');

    // Prevent double booking for same slot (non-cancelled)
    const { data: conflicts, error: confErr } = await service
      .from('bookings')
      .select('id, status')
      .eq('doctor_id', doctor_id)
      .eq('appointment_date', appointment_date)
      .eq('appointment_time', appointment_time)
      .neq('status', 'cancelled');
    if (confErr) throw confErr;
    if ((conflicts || []).length > 0) {
      return new Response(JSON.stringify({ success: false, error: 'Time slot no longer available' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 409,
      });
    }

    // Membership benefits: first 3 bookings/quarter free booking fee for premium
    const { data: membership } = await service
      .from('memberships')
      .select('membership_type, free_bookings_remaining')
      .eq('user_id', user.id)
      .single();

    const baseBookingFee = 1000; // cents
    let booking_fee = baseBookingFee;
    let shouldDecrementFree = false;

    if (membership?.membership_type === 'premium' && (membership.free_bookings_remaining ?? 0) > 0) {
      booking_fee = 0;
      shouldDecrementFree = true;
    }

    const consultation_fee = doctor.consultation_fee as number;
    const total_amount = booking_fee;

    const { data: inserted, error: insErr } = await service
      .from('bookings')
      .insert({
        user_id: user.id,
        doctor_id,
        appointment_date,
        appointment_time,
        patient_notes: patient_notes ?? '',
        consultation_fee,
        booking_fee,
        total_amount,
        status: 'pending',
        payment_status: 'pending'
      })
      .select('*')
      .single();

    if (insErr) throw insErr;

    // Decrement free bookings if applicable
    if (shouldDecrementFree) {
      await service
        .from('memberships')
        .update({
          free_bookings_remaining: (membership!.free_bookings_remaining || 0) - 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    }

    return new Response(JSON.stringify({ success: true, booking: inserted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
