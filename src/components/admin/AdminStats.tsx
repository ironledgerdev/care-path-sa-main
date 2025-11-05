import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, Stethoscope } from 'lucide-react';

interface DashboardStats {
  totalDoctors: number;
  pendingApplications: number;
  totalBookings: number;
  totalRevenue: number;
  totalUsers: number;
  premiumMembers: number;
}

interface AdminStatsProps {
  stats: DashboardStats;
}

export const AdminStats = ({ stats }: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
      <Card className="medical-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card className="medical-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Premium Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">{stats.premiumMembers}</div>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card className="medical-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Active Doctors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">{stats.totalDoctors}</div>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card className="medical-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-amber-600">{stats.pendingApplications}</div>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card className="medical-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-primary">{stats.totalBookings}</div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card className="medical-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-green-600">R{stats.totalRevenue.toFixed(2)}</div>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};