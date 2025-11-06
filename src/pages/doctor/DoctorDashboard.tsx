import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Settings,
  TrendingUp,
  Eye,
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface DoctorStats {
  totalBookings: number;
  pendingBookings: number;
  monthlyRevenue: number;
  rating: number;
}

const DoctorDashboard = () => {
  const [stats, setStats] = useState<DoctorStats>({
    totalBookings: 0,
    pendingBookings: 0,
    monthlyRevenue: 0,
    rating: 0
  });
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  // Tee-time style slots per day
  type DayState = { open: string; close: string; selected: Set<string> };
  const [dayStates, setDayStates] = useState<Record<number, DayState>>(() => {
    const base: Record<number, DayState> = {} as any;
    for (let i = 0; i < 7; i++) base[i] = { open: '08:00', close: '17:00', selected: new Set() };
    return base;
  });
  const [activeDay, setActiveDay] = useState<number>(1); // default Monday
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Edit profile state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({
    practice_name: '',
    speciality: '',
    consultation_fee: '',
    years_experience: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    bio: '',
    accepted_insurances: '',
    profile_image_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (doctorInfo) {
      setEditForm({
        practice_name: doctorInfo.practice_name || '',
        speciality: doctorInfo.speciality || '',
        consultation_fee: doctorInfo.consultation_fee ? String(Math.round((doctorInfo.consultation_fee || 0) / 100)) : '',
        years_experience: doctorInfo.years_experience ? String(doctorInfo.years_experience) : '',
        address: doctorInfo.address || '',
        city: doctorInfo.city || '',
        province: doctorInfo.province || '',
        postal_code: doctorInfo.postal_code || '',
        bio: doctorInfo.bio || '',
        accepted_insurances: (doctorInfo.accepted_insurances || []).join ? (doctorInfo.accepted_insurances || []).join(', ') : (doctorInfo.accepted_insurances || ''),
        profile_image_url: doctorInfo.profile_image_url || ''
      });
    }
  }, [doctorInfo]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const path = `doctors/${user.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage.from('profile-images').upload(path, file, { upsert: true });
      if (error) throw error;
      // For private buckets we store the storage path and generate signed URLs when rendering.
      setEditForm(prev => ({ ...prev, profile_image_url: path }));
    } catch (err: any) {
      console.error('Upload failed', err?.message || err);
      toast({ title: 'Upload failed', description: err?.message || 'Unable to upload image', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleEditSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!doctorInfo?.id) {
      toast({ title: 'No doctor profile', description: 'Create your practice profile first.', variant: 'destructive' });
      return;
    }
    setSavingEdit(true);
    try {
      const payload: any = {
        practice_name: editForm.practice_name,
        speciality: editForm.speciality,
        consultation_fee: Math.round((parseFloat(editForm.consultation_fee || '0') || 0) * 100),
        years_experience: editForm.years_experience ? parseInt(editForm.years_experience, 10) : null,
        address: editForm.address,
        city: editForm.city,
        province: editForm.province,
        postal_code: editForm.postal_code,
        bio: editForm.bio,
        profile_image_url: editForm.profile_image_url || null,
      };

      // accepted_insurances stored as text[] in DB
      if (editForm.accepted_insurances) {
        const arr = editForm.accepted_insurances.split(',').map((s: string) => s.trim()).filter(Boolean);
        payload.accepted_insurances = arr;
      } else {
        payload.accepted_insurances = [];
      }

      const { error } = await supabase.from('doctors').update(payload).eq('id', doctorInfo.id);
      if (error) throw error;

      toast({ title: 'Profile updated', description: 'Your practice profile has been updated.' });
      const { data: refreshed, error: refErr } = await supabase.from('doctors').select('*').eq('id', doctorInfo.id).maybeSingle();
      if (!refErr && refreshed) setDoctorInfo(refreshed);
      setEditOpen(false);
    } catch (err: any) {
      console.error('Save failed', err?.message || err);
      toast({ title: 'Save failed', description: err?.message || 'Unable to save profile', variant: 'destructive' });
    } finally {
      setSavingEdit(false);
    }
  };

  useEffect(() => {
    if (user && profile?.role === 'doctor') {
      fetchDoctorInfo();
      fetchDoctorStats();
    }
  }, [user, profile]);

  // Simple retry helper for transient network hiccups
  const retry = async <T,>(fn: () => Promise<T>, attempts = 2): Promise<T> => {
    let lastErr: any;
    for (let i = 0; i < attempts; i++) {
      try { return await fn(); } catch (e: any) {
        lastErr = e;
        if (!(e?.message || '').includes('Failed to fetch')) break;
        await new Promise(r => setTimeout(r, 400));
      }
    }
    throw lastErr;
  };

  // Ensure we have a doctor profile for this user (no restricted-table lookups)
  const ensureDoctorProfile = async () => {
    if (!user) return null;
    try {
      const { data: existing, error: readErr } = await retry(() =>
        supabase.from('doctors').select('*').eq('user_id', user.id).maybeSingle()
      );
      if (readErr) throw readErr;
      if (existing) return existing as any;
      return null;
    } catch (e: any) {
      console.error('ensureDoctorProfile failed:', e?.message || e);
      return null;
    }
  };

  const fetchDoctorInfo = async () => {
    try {
      if (!user) return;
      const ensured = await ensureDoctorProfile();
      setDoctorInfo(ensured);
      if (!ensured) {
        console.warn('No doctor record found for current user.');
      }
    } catch (error: any) {
      console.error('Error fetching doctor info:', error?.message || error);
    }
  };

  const fetchDoctorStats = async () => {
    if (!doctorInfo?.id) return;

    try {
      const [bookingsResult, revenueResult] = await Promise.all([
        retry(() =>
          supabase
            .from('bookings')
            .select('status, total_amount, created_at')
            .eq('doctor_id', doctorInfo.id)
        ),
        retry(() =>
          supabase
            .from('bookings')
            .select('total_amount')
            .eq('doctor_id', doctorInfo.id)
            .eq('status', 'completed')
            .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
        )
      ]);

      const bookings = bookingsResult.data || [];
      const monthlyBookings = revenueResult.data || [];

      setStats({
        totalBookings: bookings.length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        monthlyRevenue: monthlyBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0) / 100,
        rating: doctorInfo?.rating || 0
      });
    } catch (error) {
      console.error('Error fetching doctor stats:', error);
    }
  };

  const toMinutes = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60+m; };
  const toHHMM = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const loadSchedule = async () => {
    if (!doctorInfo?.id) return;
    try {
      const { data, error } = await retry(() =>
        supabase
          .from('doctor_schedules')
          .select('day_of_week, start_time, end_time, is_available')
          .eq('doctor_id', doctorInfo.id)
      );
      if (error) throw error;

      const next: Record<number, DayState> = {} as any;
      for (let i = 0; i < 7; i++) next[i] = { open: '08:00', close: '17:00', selected: new Set() };

      (data || []).forEach((row: any) => {
        if (row.is_available === false) return;
        const d = row.day_of_week as number;
        const start = (row.start_time as string).slice(0,5);
        const end = (row.end_time as string).slice(0,5);
        if (!next[d]) next[d] = { open: '08:00', close: '17:00', selected: new Set() };
        // ensure open/close encompass existing rows
        if (toMinutes(start) < toMinutes(next[d].open)) next[d].open = start;
        if (toMinutes(end) > toMinutes(next[d].close)) next[d].close = end;
        for (let m = toMinutes(start); m < toMinutes(end); m += 30) {
          next[d].selected.add(toHHMM(m));
        }
      });
      setDayStates(next);
    } catch (e: any) {
      console.error('Failed to load schedule', e?.message || e);
    }
  };

  const saveSchedule = async () => {
    let doctorId = doctorInfo?.id as string | undefined;
    if (!doctorId) {
      const ensured = await ensureDoctorProfile();
      if (ensured?.id) {
        setDoctorInfo(ensured);
        doctorId = ensured.id;
      }
    }
    if (!doctorId) {
      toast({ title: 'No doctor profile found', description: 'Complete enrollment or wait for approval to manage your schedule.', variant: 'destructive' });
      return;
    }
    setSavingSchedule(true);
    try {
      await supabase.from('doctor_schedules').delete().eq('doctor_id', doctorId);

      const rows: any[] = [];
      for (let d = 0; d < 7; d++) {
        const state = dayStates[d];
        if (!state) continue;
        const selectedTimes = Array.from(state.selected.values()).sort();
        if (selectedTimes.length === 0) {
          // No availability for this day → skip (no row with is_available=false needed)
          continue;
        }
        const start = selectedTimes[0];
        const endLast = selectedTimes[selectedTimes.length - 1];
        const end = toHHMM(toMinutes(endLast) + 30);
        if (toMinutes(end) > toMinutes(start)) {
          rows.push({
            doctor_id: doctorId!,
            day_of_week: d,
            start_time: start,
            end_time: end,
            is_available: true,
          });
        }
      }
      if (rows.length) {
        const { error } = await supabase
          .from('doctor_schedules')
          .upsert(rows, { onConflict: 'doctor_id,day_of_week' });
        if (error) throw error;
      }
      toast({ title: 'Schedule is live', description: 'Patients can now book the selected times in real time.' });
      await loadSchedule();
    } catch (e: any) {
      console.error('Failed to save schedule', e?.message || e);
      toast({ title: 'Failed to save schedule', description: e?.message || String(e), variant: 'destructive' });
    } finally {
      setSavingSchedule(false);
    }
  };

  const fetchPendingAppointments = async () => {
    if (!doctorInfo?.id) return;
    setLoadingBookings(true);
    try {
      const { data, error } = await retry(() =>
        supabase
          .from('bookings')
          .select('id, user_id, appointment_date, appointment_time, status')
          .eq('doctor_id', doctorInfo.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: true })
      );
      if (error) throw error;
      setPendingBookings(data || []);
    } catch (e: any) {
      console.error('Failed to fetch pending appointments', e?.message || e);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchUpcomingAppointments = async () => {
    if (!doctorInfo?.id) return;
    setLoadingUpcoming(true);
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const { data, error } = await retry(() =>
        supabase
          .from('bookings')
          .select('id, appointment_date, appointment_time, status, payment_status')
          .eq('doctor_id', doctorInfo.id)
          .gte('appointment_date', todayStr)
          .neq('status', 'cancelled')
          .order('appointment_date', { ascending: true })
          .order('appointment_time', { ascending: true })
      );
      if (error) throw error;
      setUpcomingBookings(data || []);
    } catch (e: any) {
      console.error('Failed to fetch upcoming appointments', e?.message || e);
    } finally {
      setLoadingUpcoming(false);
    }
  };

  const approveBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .eq('doctor_id', doctorInfo.id)
        .eq('status', 'pending');
      if (error) throw error;
      fetchPendingAppointments();
      fetchDoctorStats();
    } catch (e: any) {
      console.error('Failed to approve booking', e?.message || e);
    }
  };

  const rejectBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', bookingId)
        .eq('doctor_id', doctorInfo.id)
        .eq('status', 'pending');
      if (error) throw error;
      fetchPendingAppointments();
      fetchDoctorStats();
    } catch (e: any) {
      console.error('Failed to reject booking', e?.message || e);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount);
  };

  useEffect(() => {
    if (doctorInfo?.id) {
      loadSchedule();
      fetchPendingAppointments();
      fetchUpcomingAppointments();
      fetchDoctorStats();
      const bookingsChannel = supabase
        .channel(`doctor-${doctorInfo.id}-bookings`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `doctor_id=eq.${doctorInfo.id}` }, () => {
          fetchPendingAppointments();
          fetchUpcomingAppointments();
          fetchDoctorStats();
        })
        .subscribe();
      const schedulesChannel = supabase
        .channel(`doctor-${doctorInfo.id}-schedules`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'doctor_schedules', filter: `doctor_id=eq.${doctorInfo.id}` }, () => {
          loadSchedule();
        })
        .subscribe();
      return () => {
        supabase.removeChannel(bookingsChannel);
        supabase.removeChannel(schedulesChannel);
      };
    }
  }, [doctorInfo]);

  if (profile?.role !== 'doctor') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Doctor Dashboard</h2>
            <p className="text-muted-foreground">Only approved healthcare providers can access this dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-medical-gradient mb-2">
              Welcome back, Dr. {profile?.first_name} {profile?.last_name}
            </h1>
            <p className="text-muted-foreground">Manage your practice and patient appointments</p>
          </div>
          <div>
            <Link to="/" className="inline-flex">
              <Button variant="outline" className="btn-medical-secondary">Home</Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="medical-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-primary">{stats.totalBookings}</div>
                <Calendar className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-amber-600">{stats.pendingBookings}</div>
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats.monthlyRevenue)}
                </div>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-blue-600">{stats.rating.toFixed(1)}</div>
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Appointments
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="medical-hero-card">
                <CardHeader>
                  <CardTitle>Pending Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingBookings ? (
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                  ) : pendingBookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No pending appointments</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingBookings.map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{b.appointment_date} at {b.appointment_time}</div>
                            {b.patient_notes && (<div className="text-sm text-muted-foreground">{b.patient_notes}</div>)}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approveBooking(b.id)}>Approve</Button>
                            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => rejectBooking(b.id)}>Reject</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="medical-hero-card">
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingUpcoming ? (
                    <div className="text-center py-8 text-muted-foreground">Loading...</div>
                  ) : upcomingBookings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No upcoming appointments</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingBookings.map((b) => (
                        <div key={b.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{b.appointment_date} at {b.appointment_time}</div>
                            <div className="text-xs text-muted-foreground">Status: {b.status}</div>
                          </div>
                          <Badge variant={b.status === 'confirmed' ? 'default' : 'secondary'}>
                            {b.status === 'confirmed' ? 'Booked' : b.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schedule">
            <Card className="medical-hero-card">
              <CardHeader>
                <CardTitle>Manage Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Day selector */}
                  <div className="flex gap-2 flex-wrap">
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                      <Button key={d} variant={activeDay===i?'default':'outline'} className={activeDay===i?'btn-medical-primary':'btn-medical-secondary'} onClick={() => setActiveDay(i)}>
                        {d}
                      </Button>
                    ))}
                  </div>

                  {/* Open/Close for active day */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="text-sm text-muted-foreground">Open</label>
                      <input type="time" className="border rounded px-2 py-2 w-full" value={dayStates[activeDay]?.open}
                        onChange={(e) => setDayStates((prev) => ({ ...prev, [activeDay]: { ...prev[activeDay], open: e.target.value } }))} />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Close</label>
                      <input type="time" className="border rounded px-2 py-2 w-full" value={dayStates[activeDay]?.close}
                        onChange={(e) => setDayStates((prev) => ({ ...prev, [activeDay]: { ...prev[activeDay], close: e.target.value } }))} />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => {
                        const state = dayStates[activeDay];
                        const next = new Set<string>();
                        for (let m = toMinutes(state.open); m < toMinutes(state.close); m += 30) next.add(toHHMM(m));
                        setDayStates((prev) => ({ ...prev, [activeDay]: { ...prev[activeDay], selected: next } }));
                      }}>Select All</Button>
                      <Button variant="outline" onClick={() => setDayStates((prev) => ({ ...prev, [activeDay]: { ...prev[activeDay], selected: new Set() } }))}>Clear</Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => {
                        const copy = dayStates[activeDay];
                        setDayStates((prev) => {
                          const next = { ...prev } as Record<number, DayState>;
                          for (let i = 0; i < 7; i++) next[i] = i===activeDay ? prev[i] : { open: copy.open, close: copy.close, selected: new Set(copy.selected) };
                          return next;
                        });
                      }}>Copy to all days</Button>
                    </div>
                  </div>

                  {/* Slot grid for active day */}
                  <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {(() => {
                      const state = dayStates[activeDay];
                      const items: JSX.Element[] = [];
                      for (let m = toMinutes(state.open); m < toMinutes(state.close); m += 30) {
                        const t = toHHMM(m);
                        const selected = state.selected.has(t);
                        items.push(
                          <Button key={t} variant={selected?'default':'outline'} onClick={() => {
                            setDayStates((prev) => {
                              const next = new Set(prev[activeDay].selected);
                              if (next.has(t)) next.delete(t); else next.add(t);
                              return { ...prev, [activeDay]: { ...prev[activeDay], selected: next } };
                            });
                          }} className={`h-10 ${selected?'btn-medical-primary':'btn-medical-secondary'}`}>{t}</Button>
                        );
                      }
                      return items;
                    })()}
                  </div>

                  <div className="pt-2">
                    <Button onClick={saveSchedule} disabled={savingSchedule} className="btn-medical-primary">
                      {savingSchedule ? 'Saving...' : 'Save Schedule'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="medical-hero-card">
              <CardHeader>
                <CardTitle>Practice Profile</CardTitle>
              </CardHeader>
              <CardContent>
                {doctorInfo ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Practice Name</label>
                        <p className="text-lg font-semibold">{doctorInfo.practice_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Specialty</label>
                        <div className="text-lg font-semibold">
                          <Badge variant="outline" className="text-base">{doctorInfo.speciality}</Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Consultation Fee</label>
                        <p className="text-lg font-semibold">{formatCurrency(doctorInfo.consultation_fee / 100)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                        <p className="text-lg font-semibold">{doctorInfo.city}, {doctorInfo.province}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Bio</label>
                      <p className="mt-1">{doctorInfo.bio || 'No bio provided'}</p>
                    </div>

                    <Button className="btn-medical-primary" onClick={() => setEditOpen(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>

                    {/* Edit Profile Dialog */}
                    <Dialog open={editOpen} onOpenChange={(open) => { if (!open) setEditOpen(false); }}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Practice Profile</DialogTitle>
                          <DialogDescription>Update your public profile information shown to patients.</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Practice Name</Label>
                              <Input value={editForm.practice_name} onChange={(e) => setEditForm({ ...editForm, practice_name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label>Speciality</Label>
                              <Input value={editForm.speciality} onChange={(e) => setEditForm({ ...editForm, speciality: e.target.value })} />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Consultation Fee (ZAR)</Label>
                              <Input type="number" value={editForm.consultation_fee} onChange={(e) => setEditForm({ ...editForm, consultation_fee: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label>Years of Experience</Label>
                              <Input type="number" value={editForm.years_experience} onChange={(e) => setEditForm({ ...editForm, years_experience: e.target.value })} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Practice Address</Label>
                            <Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>City</Label>
                              <Input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label>Province</Label>
                              <Input value={editForm.province} onChange={(e) => setEditForm({ ...editForm, province: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                              <Label>Postal Code</Label>
                              <Input value={editForm.postal_code} onChange={(e) => setEditForm({ ...editForm, postal_code: e.target.value })} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Accepted Medical Aids / Insurances (comma-separated)</Label>
                            <Input value={editForm.accepted_insurances} onChange={(e) => setEditForm({ ...editForm, accepted_insurances: e.target.value })} />
                          </div>

                          <div className="space-y-2">
                            <Label>Professional Bio</Label>
                            <Textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={4} />
                          </div>

                          <div className="space-y-2">
                            <Label>Profile Image</Label>
                            <input type="file" accept="image/*" onChange={handleFileChange} />
                            {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
                            {editForm.profile_image_url && (
                              <img src={editForm.profile_image_url} alt="profile preview" className="w-24 h-24 object-cover rounded-md mt-2" />
                            )}
                          </div>

                          <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                            <Button type="submit" className="btn-medical-primary" disabled={savingEdit}>{savingEdit ? 'Saving…' : 'Save Changes'}</Button>
                          </DialogFooter>
                        </form>

                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Loading profile information...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="medical-hero-card">
              <CardHeader>
                <CardTitle>Practice Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics coming soon</p>
                  <p className="text-sm">Track your practice performance and patient metrics</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DoctorDashboard;
