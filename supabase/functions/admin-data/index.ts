import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE');

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Supabase service role not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    // Fetch pending applications from pending_doctors table
    const pendingResp = await supabaseAdmin
      .from('pending_doctors')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch profiles for pending (to enrich)
    let pending = pendingResp.data || [];
    const userIds = pending.map((d: any) => d.user_id).filter(Boolean);
    let profilesData = [];
    if (userIds.length) {
      const profilesResp = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);
      profilesData = profilesResp.data || [];
      pending = pending.map((doc: any) => ({
        ...doc,
        profiles: profilesData.find((p: any) => p.id === doc.user_id) || { first_name: '', last_name: '', email: '' }
      }));
    }

    // Memberships (fetch directly and enrich with profiles)
    const membershipsResp = await supabaseAdmin
      .from('memberships')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    let memberships = membershipsResp.data || [];
    const membershipUserIds = memberships.map((m: any) => m.user_id).filter(Boolean);
    if (membershipUserIds.length) {
      const profilesResp = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, email, role')
        .in('id', membershipUserIds);
      const profilesData = profilesResp.data || [];
      memberships = memberships.map((m: any) => ({
        ...m,
        profiles: profilesData.find((p: any) => p.id === m.user_id) || null
      }));
    }

    // Recent bookings with doctor info
    const recentBookingsResp = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        appointment_date,
        appointment_time,
        status,
        doctors (
          id,
          practice_name,
          user_id,
          profiles!doctors_user_id_fkey (
            first_name,
            last_name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(50);

    const recentBookings = recentBookingsResp.data || [];

    // Stats: counts and revenue
    const [doctorsResult, pendingResult, bookingsResult, usersResult, premiumResult] = await Promise.all([
      supabaseAdmin.from('doctors').select('id', { count: 'exact' }),
      supabaseAdmin.from('pending_doctors').select('id', { count: 'exact' }),
      supabaseAdmin.from('bookings').select('total_amount', { count: 'exact' }),
      supabaseAdmin.from('profiles').select('id', { count: 'exact' }),
      supabaseAdmin.from('memberships').select('id', { count: 'exact' }).eq('membership_type', 'premium').eq('is_active', true)
    ]);

    const totalRevenue = (bookingsResult.data || []).reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);

    const stats = {
      totalDoctors: doctorsResult.count || 0,
      pendingApplications: pendingResult.count || 0,
      totalBookings: bookingsResult.count || 0,
      totalRevenue: totalRevenue / 100,
      totalUsers: usersResult.count || 0,
      premiumMembers: premiumResult.count || 0
    };

    return new Response(JSON.stringify({ success: true, pending, memberships, recentBookings, stats }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('admin-data function error', error);
    return new Response(JSON.stringify({ error: (error && error.message) || String(error) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
