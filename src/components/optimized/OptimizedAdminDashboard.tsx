import React, { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  UserPlus,
  Stethoscope,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Split into smaller components for better performance
const StatsCard = memo(({ title, value, icon: Icon, trend, color = "primary" }: any) => (
  <Card className="medical-card hover:shadow-lg transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`text-3xl font-bold text-${color}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 bg-${color}/10 rounded-full`}>
          <Icon className={`h-6 w-6 text-${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
));

StatsCard.displayName = 'StatsCard';

const PendingDoctorRow = memo(({ doctor, onApprove, onReject, isLoading }: any) => (
  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
    <div className="flex-1">
      <h4 className="font-medium">
        Dr. {doctor.profiles?.first_name} {doctor.profiles?.last_name}
      </h4>
      <p className="text-sm text-muted-foreground">{doctor.speciality}</p>
      <p className="text-xs text-muted-foreground">{doctor.practice_name}</p>
    </div>
    <div className="text-right mr-4">
      <p className="text-sm font-medium">{doctor.years_experience} years exp.</p>
      <p className="text-xs text-muted-foreground">
        R{(doctor.consultation_fee / 100).toFixed(2)}
      </p>
    </div>
    <div className="flex gap-2">
      <Button
        size="sm"
        onClick={() => onApprove(doctor.id)}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700"
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Approve
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onReject(doctor.id)}
        disabled={isLoading}
        className="text-red-600 border-red-200 hover:bg-red-50"
      >
        <XCircle className="h-4 w-4 mr-1" />
        Reject
      </Button>
    </div>
  </div>
));

PendingDoctorRow.displayName = 'PendingDoctorRow';

// Main dashboard content component
const OptimizedAdminDashboardContent = memo(() => {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    pendingApplications: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    premiumMembers: 0
  });
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useAuth();
  const isLocalAdmin = profile?.id === 'local-admin';
  const { toast } = useToast();

  // Memoized stats cards configuration
  const statsCards = useMemo(() => [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      trend: "+12% from last month",
      color: "primary"
    },
    {
      title: "Approved Doctors", 
      value: stats.totalDoctors,
      icon: UserCheck,
      trend: "+5% from last month",
      color: "green"
    },
    {
      title: "Pending Applications",
      value: stats.pendingApplications,
      icon: Clock,
      color: "orange"
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      icon: Calendar,
      trend: "+18% from last month",
      color: "blue"
    },
    {
      title: "Revenue",
      value: `R${(stats.totalRevenue).toFixed(2)}`,
      icon: DollarSign,
      trend: "+23% from last month",
      color: "green"
    },
    {
      title: "Premium Members",
      value: stats.premiumMembers,
      icon: Shield,
      trend: "+8% from last month",
      color: "purple"
    }
  ], [stats]);

  const fetchData = useCallback(async () => {
    if (isLocalAdmin) return; // avoid RLS-restricted queries under local admin session
    try {
      const [doctorsResult, pendingResult, bookingsResult, usersResult, premiumResult] = await Promise.all([
        supabase.from('doctors').select('id', { count: 'exact' }),
        supabase.from('pending_doctors').select('id', { count: 'exact' }),
        supabase.from('bookings').select('total_amount', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('memberships').select('id', { count: 'exact' }).eq('membership_type', 'premium').eq('is_active', true)
      ]);

      const totalRevenue = bookingsResult.data?.reduce((sum: number, booking: any) => sum + (booking.total_amount || 0), 0) || 0;

      setStats({
        totalDoctors: doctorsResult.count || 0,
        pendingApplications: pendingResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        totalRevenue: totalRevenue / 100,
        totalUsers: usersResult.count || 0,
        premiumMembers: premiumResult.count || 0
      });
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error);
    }
  }, [isLocalAdmin]);

  const fetchPendingDoctors = useCallback(async () => {
    if (isLocalAdmin) return; // avoid RLS-restricted queries under local admin session
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
          status: 'pending',
          profiles: profile || { first_name: '', last_name: '', email: '' }
        };
      }) || [];

      setPendingDoctors(enrichedData);
    } catch (error: any) {
      if (!isLocalAdmin) {
        toast({
          title: "Error",
          description: "Failed to fetch pending applications",
          variant: "destructive",
        });
      }
    }
  }, [toast, isLocalAdmin]);

  const handleApproveDoctor = useCallback(async (pendingId: string) => {
    setIsLoading(true);
    try {
      const { data: pendingDoctor, error: fetchError } = await supabase
        .from('pending_doctors')
        .select('*')
        .eq('id', pendingId)
        .single();

      if (fetchError) throw fetchError;

      const { error: approveError } = await supabase.rpc('approve_pending_doctor', {
        p_pending_id: pendingId,
        p_approved_by: profile?.id || null,
      });
      if (approveError) throw approveError;

      toast({
        title: "Success",
        description: "Doctor approved successfully!",
      });

      fetchPendingDoctors();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, fetchPendingDoctors, toast]);

  const handleRejectDoctor = useCallback(async (pendingId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('pending_doctors')
        .delete()
        .eq('id', pendingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Doctor application rejected",
      });

      fetchPendingDoctors();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, fetchPendingDoctors, toast]);

  useEffect(() => {
    if (profile?.role === 'admin' && profile?.id !== 'local-admin') {
      fetchData();
      fetchPendingDoctors();
    }
  }, [profile, fetchData, fetchPendingDoctors]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-medical-gradient">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage doctors, users, and monitor platform activity</p>
          </div>
          <Badge variant="secondary" className="text-sm">
            <Shield className="h-4 w-4 mr-2" />
            Admin Access
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="doctors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="doctors">
              <Stethoscope className="h-4 w-4 mr-2" />
              Doctor Applications
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              User Management  
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="space-y-6">
            <Card className="medical-hero-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Pending Doctor Applications ({pendingDoctors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingDoctors.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No pending applications</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingDoctors.map((doctor: any) => (
                      <PendingDoctorRow
                        key={doctor.id}
                        doctor={doctor}
                        onApprove={handleApproveDoctor}
                        onReject={handleRejectDoctor}
                        isLoading={isLoading}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="medical-hero-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  User Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">User management features coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="medical-hero-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Platform Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
});

OptimizedAdminDashboardContent.displayName = 'OptimizedAdminDashboardContent';

const OptimizedAdminDashboard = memo(() => {
  return (
    <AdminGuard>
      <OptimizedAdminDashboardContent />
    </AdminGuard>
  );
});

OptimizedAdminDashboard.displayName = 'OptimizedAdminDashboard';

export default OptimizedAdminDashboard;
