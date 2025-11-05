import React, { useEffect, useState } from 'react';
import { AdminRoleManager } from '@/components/AdminRoleManager';
import { AdminGuard } from '@/components/AdminGuard';
import { AdminStats } from '@/components/admin/AdminStats';
import { PendingDoctorsTab } from '@/components/admin/PendingDoctorsTab';
import { CreateUserTab } from '@/components/admin/CreateUserTab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  UserPlus,
  Stethoscope,
  Search,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PendingDoctor {
  id: string;
  user_id: string;
  practice_name: string;
  speciality: string;
  qualification: string;
  license_number: string;
  years_experience: number;
  consultation_fee: number;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  bio: string;
  status: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface DashboardStats {
  totalDoctors: number;
  pendingApplications: number;
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  premiumMembers: number;
}

interface UserMembership {
  id: string;
  user_id: string;
  membership_type: 'basic' | 'premium';
  is_active: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  free_bookings_remaining: number;
  created_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    email: string;
    role: string;
  } | null;
}

interface RecentBooking {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  doctors: {
    id: string;
    practice_name: string;
    user_id: string;
    profiles: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  } | null;
}

export const AdminDashboard: React.FC = () => {
  return (
    <AdminGuard>
      <AdminDashboardContent />
    </AdminGuard>
  );
};

export const AdminDashboardContent: React.FC<{ overrideProfile?: any; bypassAuth?: boolean }> = ({ overrideProfile, bypassAuth = false }) => {
  const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([]);
  const [userMemberships, setUserMemberships] = useState<UserMembership[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalDoctors: 0,
    pendingApplications: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    premiumMembers: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'patient' as 'patient' | 'doctor' | 'admin'
  });
  const [impersonateEmail, setImpersonateEmail] = useState('');
  const auth = useAuth();
  const profile = overrideProfile ?? auth.profile;
  const isLocalAdmin = profile?.id === 'local-admin';
  const { toast } = useToast();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const showDebug = params.get('debug') === '1';

  const [debugInfo, setDebugInfo] = useState<{ pending?: any; memberships?: any; recentBookings?: any; stats?: any; errors: string[] }>({ errors: [] });

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-data');
      if (error) throw error;
      const payload = data as any;
      if (payload?.pending) setPendingDoctors(payload.pending);
      if (payload?.memberships) setUserMemberships(payload.memberships);
      if (payload?.recentBookings) setRecentBookings(payload.recentBookings);
      if (payload?.stats) setStats(payload.stats);

      setDebugInfo(prev => ({ ...prev, pending: payload.pending, memberships: payload.memberships, recentBookings: payload.recentBookings, stats: payload.stats }));
    } catch (error: any) {
      setDebugInfo(prev => ({ ...prev, errors: [...prev.errors, (error && error.message) || String(error)] }));
      // If running under local admin session, avoid direct DB calls that will fail under RLS
      if (!isLocalAdmin) {
        await Promise.allSettled([
          fetchPendingDoctors(),
          fetchUserMemberships(),
          fetchRecentBookings(),
          fetchDashboardStats(),
        ]);
      } else {
        setPendingDoctors([]);
        setUserMemberships([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only allow actual admin users, unless bypassAuth is true
    if (bypassAuth) {
      fetchAdminData();
      setupRealtimeSubscriptions();
      return () => supabase.removeAllChannels();
    }

    if (profile?.role === 'admin') {
      fetchAdminData();
      setupRealtimeSubscriptions();
    } else if (profile && (profile.role === 'patient' || profile.role === 'doctor')) {
      // User is logged in but not admin - redirect
      toast({
        title: "Access Denied",
        description: "Admin privileges required to access this page.",
        variant: "destructive",
      });
      // Redirect to home after showing error
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    }

    return () => {
      // Cleanup subscriptions when component unmounts
      supabase.removeAllChannels();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, toast, bypassAuth]);

  const setupRealtimeSubscriptions = () => {
    // Listen for new doctor entries/updates
    const pendingDoctorsChannel = supabase
      .channel('pending_doctors_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pending_doctors'
        },
        () => {
          fetchPendingDoctors();
          fetchDashboardStats();
          toast({
            title: "New Application",
            description: "A new doctor application has been submitted.",
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'pending_doctors'
        },
        () => {
          fetchPendingDoctors();
          fetchDashboardStats();
        }
      )
      .subscribe();

    // Listen for new bookings
    const bookingsChannel = supabase
      .channel('bookings_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchDashboardStats();
          toast({
            title: "New Booking",
            description: "A new appointment has been booked.",
          });
        }
      )
      .subscribe();

    // Listen for new user registrations
    const profilesChannel = supabase
      .channel('profiles_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles'
        },
        () => {
          fetchDashboardStats();
          fetchUserMemberships();
          toast({
            title: "New User",
            description: "A new user has registered.",
          });
        }
      )
      .subscribe();

    // Listen for membership changes
    const membershipsChannel = supabase
      .channel('memberships_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'memberships'
        },
        () => {
          fetchDashboardStats();
          fetchUserMemberships();
        }
      )
      .subscribe();

    // Listen for doctor approvals/changes
    const doctorsChannel = supabase
      .channel('doctors_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'doctors'
        },
        () => {
          fetchDashboardStats();
          toast({
            title: "Doctor Approved",
            description: "A doctor has been approved and added to the platform.",
          });
        }
      )
      .subscribe();
  };

  const fetchPendingDoctors = async () => {
    try {
      const { data: pendingData, error: pendingError } = await supabase
        .from('pending_doctors')
        .select('*')
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;

      const userIds = pendingData?.map(d => d.user_id) || [];
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const enrichedData = pendingData?.map(doctor => {
        const profile = profilesData?.find(p => p.id === doctor.user_id);
        return {
          ...doctor,
          profiles: profile || { first_name: '', last_name: '', email: '' }
        };
      }) || [];

      setPendingDoctors(enrichedData);
      setDebugInfo(prev => ({
        ...prev,
        pending: { pendingData, profilesData, enrichedData }
      }));
    } catch (error: any) {
      setDebugInfo(prev => ({ ...prev, errors: [...prev.errors, (error && error.message) || String(error)] }));
      if (!isLocalAdmin) {
        toast({
          title: "Error",
          description: "Failed to fetch pending applications",
          variant: "destructive",
        });
      }
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const [doctorsResult, pendingResult, bookingsResult, usersResult, premiumResult] = await Promise.all([
        supabase.from('doctors').select('id', { count: 'exact' }),
        supabase.from('pending_doctors').select('id', { count: 'exact' }),
        supabase.from('bookings').select('total_amount', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('memberships').select('id', { count: 'exact' }).eq('membership_type', 'premium').eq('is_active', true)
      ]);

      const totalRevenue = bookingsResult.data?.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) || 0;

      setStats({
        totalDoctors: doctorsResult.count || 0,
        pendingApplications: pendingResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        totalRevenue: totalRevenue / 100, // Convert from cents
        totalUsers: usersResult.count || 0,
        premiumMembers: premiumResult.count || 0
      });

      // Save raw debug info
      setDebugInfo(prev => ({
        ...prev,
        stats: { doctorsResult, pendingResult, bookingsResult, usersResult, premiumResult }
      }));
    } catch (error: any) {
      setDebugInfo(prev => ({ ...prev, errors: [...prev.errors, (error && error.message) || String(error)] }));
      console.error('Failed to fetch dashboard stats:', error);
    }
  };

  const fetchUserMemberships = async () => {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select(`
          *,
          profiles!memberships_user_id_fkey (
            first_name,
            last_name,
            email,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setUserMemberships((data as any) || []);
      // Save raw debug info
      setDebugInfo(prev => ({ ...prev, memberships: data }));
    } catch (error: any) {
      setDebugInfo(prev => ({ ...prev, errors: [...prev.errors, (error && error.message) || String(error)] }));
      toast({
        title: "Error",
        description: "Failed to fetch user memberships",
        variant: "destructive",
      });
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Use signUp instead of admin.createUser to trigger email verification
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: newUser.firstName,
            last_name: newUser.lastName,
            phone: newUser.phone,
            role: newUser.role,
          }
        }
      });

      if (error) throw error;

      // Send custom verification email
      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'user_verification',
            data: {
              user_name: `${newUser.firstName} ${newUser.lastName}`,
              user_email: newUser.email,
              verification_link: `${window.location.origin}/verify-email`
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
      }

      toast({
        title: "Success",
        description: `${newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)} account created! Verification email sent to ${newUser.email}.`,
      });

      // Reset form
      setNewUser({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'patient'
      });

      // Refresh data
      fetchDashboardStats();
      fetchUserMemberships();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveDoctor = async (pendingId: string) => {
    setIsLoading(true);
    try {
      const { data: pendingDoctor, error: fetchError } = await supabase
        .from('pending_doctors')
        .select('*')
        .eq('id', pendingId)
        .single();
      if (fetchError) throw fetchError;

      const { data: doctorProfile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, email')
        .eq('id', pendingDoctor.user_id)
        .single();
      if (profileError) throw profileError;

      const { data: approvedDoctorId, error: approveError } = await supabase.rpc('approve_pending_doctor', {
        p_pending_id: pendingId,
        p_approved_by: profile?.id || null,
      });
      if (approveError) throw approveError;

      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'doctor', updated_at: new Date().toISOString() })
        .eq('id', pendingDoctor.user_id);
      if (roleError) throw roleError;

      try {
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'doctor_approved',
            data: {
              doctor_name: `${doctorProfile?.first_name || ''} ${doctorProfile?.last_name || ''}`.trim() || pendingDoctor.practice_name,
              doctor_email: doctorProfile?.email,
              practice_name: pendingDoctor.practice_name,
              speciality: pendingDoctor.speciality,
            }
          }
        });
      } catch (_e) {}

      toast({
        title: 'Success',
        description: 'Doctor approved successfully!',
      });

      fetchPendingDoctors();
      fetchDashboardStats();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectDoctor = async (pendingId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('pending_doctors')
        .delete()
        .eq('id', pendingId);

      if (error) throw error;

      toast({
        title: "Doctor Rejected",
        description: "The doctor application has been rejected.",
      });

      fetchPendingDoctors();
      fetchDashboardStats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDoctor = (doctor: PendingDoctor) => {
    // Implementation for viewing doctor details
    toast({
      title: "Doctor Details",
      description: `${doctor.profiles.first_name} ${doctor.profiles.last_name} - ${doctor.speciality}`,
    });
  };

  const handleImpersonate = async () => {
    // Implementation for user impersonation
    toast({
      title: "Impersonation",
      description: "Feature coming soon",
    });
  };

  // Show loading state while profile is being fetched
  if (!profile && !bypassAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (!bypassAuth && profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="medical-hero-card max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Admin privileges are required to access this page.
            </p>
            <Button onClick={() => window.location.href = '/'} className="btn-medical-primary">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-medical-gradient mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage healthcare providers and platform operations</p>
        </div>

        {/* Stats Cards */}
        <AdminStats stats={stats} />

        {/* Main Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="pending">Pending ({stats.pendingApplications})</TabsTrigger>
            <TabsTrigger value="memberships">Memberships</TabsTrigger>
            <TabsTrigger value="create-user">Create User</TabsTrigger>
            <TabsTrigger value="impersonate">Impersonate</TabsTrigger>
            <TabsTrigger value="role-management">Roles</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <PendingDoctorsTab
              pendingDoctors={pendingDoctors}
              onApprove={handleApproveDoctor}
              onReject={handleRejectDoctor}
              onView={handleViewDoctor}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="memberships">
            <Card className="medical-hero-card">
              <CardHeader>
                <CardTitle>User Memberships</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Membership Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Free Bookings</TableHead>
                      <TableHead>Period</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userMemberships.map((membership) => (
                      <TableRow key={membership.id}>
                        <TableCell className="font-medium">
                          {membership.profiles?.first_name} {membership.profiles?.last_name}
                        </TableCell>
                        <TableCell>{membership.profiles?.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {membership.profiles?.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={membership.membership_type === 'premium' ? 'default' : 'secondary'}
                            className="capitalize"
                          >
                            {membership.membership_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={membership.is_active ? 'default' : 'destructive'}
                          >
                            {membership.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>{membership.free_bookings_remaining}</TableCell>
                        <TableCell>
                          {membership.current_period_start && membership.current_period_end 
                            ? `${new Date(membership.current_period_start).toLocaleDateString()} - ${new Date(membership.current_period_end).toLocaleDateString()}`
                            : 'N/A'
                          }
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create-user">
            <CreateUserTab
              newUser={newUser}
              setNewUser={setNewUser}
              onCreateUser={handleCreateUser}
              isLoading={isLoading}
            />
          </TabsContent>

          <TabsContent value="impersonate">
            <Card className="medical-hero-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  User Impersonation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-md space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-amber-600" />
                      <h4 className="font-semibold text-amber-800">Admin Impersonation</h4>
                    </div>
                    <p className="text-sm text-amber-700">
                      This will generate a secure login link to access any user's account. 
                      Use responsibly for support and testing purposes only.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="impersonate-email">User Email</Label>
                    <Input
                      id="impersonate-email"
                      type="email"
                      placeholder="user@example.com"
                      value={impersonateEmail}
                      onChange={(e) => setImpersonateEmail(e.target.value)}
                    />
                  </div>

                  <Button 
                    onClick={handleImpersonate}
                    className="w-full btn-medical-primary"
                    disabled={isLoading || !impersonateEmail}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Generating Link...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Impersonate User
                      </>
                    )}
                  </Button>

                  <div className="text-xs text-muted-foreground">
                    <p>• The impersonation link will open in a new tab</p>
                    <p>• You will be logged in as the specified user</p>
                    <p>• Close the tab to end the impersonation session</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="role-management">
            <AdminRoleManager />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="medical-hero-card">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Configure platform settings and booking fees.</p>
                {/* Add settings form here */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {showDebug && (
          <div className="mt-8">
            <Card className="medical-hero-card">
              <CardHeader>
                <CardTitle>Debug / Raw Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Errors</h4>
                    <pre className="text-xs bg-gray-50 p-2 rounded max-h-40 overflow-auto">{JSON.stringify(debugInfo.errors, null, 2)}</pre>
                  </div>
                  <div>
                    <h4 className="font-semibold">Pending Doctors Raw</h4>
                    <pre className="text-xs bg-gray-50 p-2 rounded max-h-40 overflow-auto">{JSON.stringify(debugInfo.pending, null, 2)}</pre>
                  </div>
                  <div>
                    <h4 className="font-semibold">Memberships Raw</h4>
                    <pre className="text-xs bg-gray-50 p-2 rounded max-h-40 overflow-auto">{JSON.stringify(debugInfo.memberships, null, 2)}</pre>
                  </div>
                  <div>
                    <h4 className="font-semibold">Stats Raw</h4>
                    <pre className="text-xs bg-gray-50 p-2 rounded max-h-40 overflow-auto">{JSON.stringify(debugInfo.stats, null, 2)}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
