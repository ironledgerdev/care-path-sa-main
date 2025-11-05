import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Clock, 
  Heart, 
  User, 
  Bell, 
  CreditCard, 
  MapPin,
  Star,
  Activity,
  Shield,
  Plus,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { NotificationCenter } from '@/components/NotificationCenter';

interface DashboardStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  favoriteDoctor: string | null;
  membershipType: string;
  freeBookingsRemaining: number;
}

interface RecentBooking {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  doctors?: {
    practice_name: string;
    speciality: string;
    profiles?: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  } | null;
}

const PatientDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    favoriteDoctor: null,
    membershipType: 'basic',
    freeBookingsRemaining: 0
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Realtime list of available doctors for quick booking
  const [availableDoctors, setAvailableDoctors] = useState<Array<{ id: string; consultation_fee: number; speciality: string; practice_name: string; profiles: { first_name: string | null; last_name: string | null } | null }>>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchAvailableDoctors();

      const channel = supabase
        .channel('doctors_changes_dashboard')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, () => {
          fetchAvailableDoctors();
        })
        .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch booking statistics
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user?.id);

      

      if (bookingsError) throw bookingsError;
        console.log("Error fetching bookings:", bookingsError);
      // Fetch recent bookings with doctor details
      console.log('Fetching recent bookings for user:', user?.id);
      const { data: recentBookingsData, error: recentError } = await supabase
  .from('bookings')
  .select(`
    id,
    appointment_date,
    appointment_time,
    status,
    doctors (
      speciality,
      user_id
    )
  `)
  .eq('user_id', user?.id)
  .order('created_at', { ascending: false })
  .limit(5);

if (recentError) {
  console.error('Error fetching bookings:', recentError);
  return;
}

console.log('Bookings with doctors:', recentBookingsData);

// Then get profiles separately
const doctorUserIds = recentBookingsData
  ?.map(booking => booking.doctors?.user_id)
  .filter(id => id) || [];

const { data: doctorProfiles, error: profilesError } = await supabase
  .from('profiles')
  .select('id, first_name, last_name')
  .in('id', doctorUserIds);

if (profilesError) {
  console.error('Error fetching profiles:', profilesError);
  return;
}

// Combine the data to match your UI structure
const enrichedBookings = recentBookingsData?.map(booking => {
  const doctorProfile = doctorProfiles?.find(profile => 
    profile.id === booking.doctors?.user_id
  );
  
  return {
    ...booking,
    doctors: booking.doctors ? {
      speciality: booking.doctors.speciality,
      profiles: doctorProfile
    } : null
  };
}) || [];

console.log('Final enriched bookings:', enrichedBookings);
// Use enrichedBookings in your component

console.log('recentBookingsData:', recentBookingsData);
console.log('recentError:', recentError);
console.log('user?.id:', user?.id);
console.log('bookings[0]?.doctor_id:', bookings[0]?.doctor_id);

      console.log("user id  -?",user?.id, "Doctor id ->",bookings['0'].doctor_id)
      console.log("Bookings are ->",bookings['0'].doctor_id)
      // doctor_id
      // console.log("Recent Bookings are ->",recentBookingsData)
      if (recentError) throw recentError;

      // Fetch membership info
      const { data: membership, error: membershipError } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (membershipError && membershipError.code !== 'PGRST116') {
        throw membershipError;
      }

      // console.log( `recentBookingsData`,recentBookingsData)

      // Calculate stats
      const now = new Date();
      const upcomingBookings = bookings?.filter(b => 
        new Date(b.appointment_date) >= now && b.status !== 'cancelled'
      ).length || 0;
      
      const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0;
      const cancelledBookings = bookings?.filter(b => b.status === 'cancelled').length || 0;

      setStats({
        totalBookings: bookings?.length || 0,
        upcomingBookings,
        completedBookings,
        cancelledBookings,
        favoriteDoctor: null, // TODO: Implement favorite doctor logic
        membershipType: membership?.membership_type || 'basic',
        freeBookingsRemaining: membership?.free_bookings_remaining || 0
      });
      // console.log("Dashboard data->",recentBookingsData)
      setRecentBookings((recentBookingsData as any) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatTime = (timeString: string) => {
    return format(new Date(`2000-01-01T${timeString}`), 'h:mm a');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-success text-success-foreground">Confirmed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-primary text-primary-foreground">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const fetchAvailableDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('id, consultation_fee, speciality, practice_name, user_id')
        .eq('is_available', true)
        .order('rating', { ascending: false })
        .limit(6);
      if (error) throw error;
      let enriched = (data || []) as any[];
      const ids = enriched.map((d: any) => d.user_id).filter(Boolean);
      if (ids.length) {
        try {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', ids);
          const map = new Map((profiles || []).map((p: any) => [p.id, p]));
          enriched = enriched.map((d: any) => ({ ...d, profiles: map.get(d.user_id) || null }));
        } catch (_) {}
      }
      setAvailableDoctors(enriched as any);
      console.log("fetched available doctors:", enriched);
    } catch (e) {
      // silent; dashboard still loads
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-medical-gradient">
                Welcome back, {profile?.first_name || 'Patient'}!
              </h1>
              <p className="text-muted-foreground">Manage your health appointments and profile</p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <Button 
                className="btn-medical-primary"
                onClick={() => navigate('/search')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold text-success">{stats.upcomingBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-warning">{stats.completedBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-glow/20 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Membership</p>
                  <p className="text-lg font-bold text-primary capitalize">{stats.membershipType}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="medical-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-medical-gradient">Recent Bookings</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/bookings')}
                  className="text-primary hover:bg-primary/10"
                >
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Book your first appointment to get started
                    </p>
                    <Button
                      className="btn-medical-primary"
                      onClick={() => navigate('/search')}
                    >
                      Find Doctors
                    </Button>
                  </div>
                ) : (
                  recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">
                            Dr. {booking.doctors?.profiles?.first_name || 'Unknown'} {booking.doctors?.profiles?.last_name || 'Doctor'}
                          </h4>
                          <p className="text-sm text-muted-foreground">{booking.doctors?.speciality}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(booking.appointment_date)} at {formatTime(booking.appointment_time)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Available Doctors (Realtime) */}
            <Card className="medical-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-medical-gradient">Available Doctors</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/search')} className="text-primary hover:bg-primary/10">
                  View All
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                {availableDoctors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No doctors available right now.</p>
                ) : (
                  availableDoctors.map((d) => (
                    <div key={d.id} className="p-4 bg-muted/30 rounded-lg flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Dr. {d.profiles?.first_name} {d.profiles?.last_name}</h4>
                        <p className="text-xs text-muted-foreground">{d.speciality} • {d.practice_name}</p>
                      </div>
                      <Button size="sm" className="btn-medical-primary" onClick={() => navigate(`/book/${d.id}`)}>
                        Book
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Membership */}
          <div className="space-y-6">
            {/* Membership Card */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg text-medical-gradient flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Membership Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge 
                    className={`text-lg px-4 py-2 ${
                      stats.membershipType === 'premium' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {stats.membershipType.toUpperCase()}
                  </Badge>
                </div>
                
                {stats.membershipType === 'basic' && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Free Bookings</span>
                        <span>{stats.freeBookingsRemaining}/3</span>
                      </div>
                      <Progress 
                        value={(stats.freeBookingsRemaining / 3) * 100} 
                        className="h-2"
                      />
                    </div>
                    <Button 
                      className="btn-medical-primary w-full"
                      onClick={() => navigate('/memberships')}
                    >
                      Upgrade to Premium
                    </Button>
                  </div>
                )}

                {stats.membershipType === 'premium' && (
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-success">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">Premium Member</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Unlimited bookings • Priority support • Special offers
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg text-medical-gradient">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="btn-medical-secondary w-full justify-start"
                  onClick={() => navigate('/search')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Find Doctors Near Me
                </Button>
                
                <Button 
                  variant="outline" 
                  className="btn-medical-secondary w-full justify-start"
                  onClick={() => navigate('/bookings')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  View All Bookings
                </Button>
                
                <Button 
                  variant="outline" 
                  className="btn-medical-secondary w-full justify-start"
                  onClick={() => navigate('/memberships')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Membership
                </Button>
              </CardContent>
            </Card>

            {/* Health Tip */}
            <Card className="medical-card bg-gradient-to-br from-primary/5 to-primary-glow/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="h-6 w-6 text-primary" />
                  <h3 className="font-semibold text-primary">Health Tip</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Regular check-ups are important for maintaining good health. 
                  Schedule your annual health screening today!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
