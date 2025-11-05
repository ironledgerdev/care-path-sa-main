import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Star, 
  Check, 
  Clock, 
  Calendar, 
  CreditCard,
  Gift,
  Zap,
  Shield,
  Users,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface Membership {
  id: string;
  user_id: string;
  membership_type: 'basic' | 'premium';
  is_active: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  free_bookings_remaining: number;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

const MembershipManagement = () => {
  const [membership, setMembership] = useState<Membership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchMembership();
    }
  }, [user]);

  const fetchMembership = async () => {
    try {
      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setMembership(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load membership information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeToPremium = async () => {
    if (!user) return;

    setIsUpgrading(true);
    try {
      // Create PayFast payment for quarterly membership
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-payfast-payment', {
        body: {
          booking_id: `membership_${user.id}_${Date.now()}`,
          amount: 3900, // R39 in cents
          description: 'IronLedgerMedMap Premium Membership - Quarterly',
          doctor_name: 'Premium Membership',
          appointment_date: new Date().toISOString().split('T')[0],
          appointment_time: '00:00',
          membership_type: 'premium'
        }
      });

      if (paymentError) throw paymentError;

      // Redirect to PayFast
      if (paymentData.payment_url) {
        window.location.href = paymentData.payment_url;
      }

    } catch (error: any) {
      toast({
        title: "Upgrade Failed",
        description: error.message || "Failed to process membership upgrade",
        variant: "destructive",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-ZA');
  };

  const getRemainingDays = (endDate: string | null) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading membership...</h2>
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-medical-gradient mb-2">Membership Management</h1>
          <p className="text-muted-foreground">Manage your IronLedgerMedMap membership and benefits</p>
        </div>

        {/* Current Membership Status */}
        <Card className="medical-hero-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {membership?.membership_type === 'premium' ? (
                <>
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Premium Membership
                </>
              ) : (
                <>
                  <Star className="h-5 w-5" />
                  Basic Membership
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={membership?.is_active ? "default" : "secondary"}>
                    {membership?.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  {membership?.membership_type === 'premium' && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      Premium
                    </Badge>
                  )}
                </div>
              </div>

              {membership?.membership_type === 'premium' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Period</label>
                    <p className="font-semibold">
                      {formatDate(membership.current_period_start)} - {formatDate(membership.current_period_end)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Days Remaining</label>
                    <p className="font-semibold text-primary">
                      {getRemainingDays(membership.current_period_end)} days
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Free Bookings Remaining</label>
                <p className="font-semibold text-green-600">
                  {membership?.free_bookings_remaining || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membership Plans Comparison */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Basic Plan */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Basic Membership
              </CardTitle>
              <div className="text-3xl font-bold">Free</div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Search and browse doctors</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Basic appointment booking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Standard booking fees apply</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Email support</span>
                </div>
              </div>
              
              {membership?.membership_type === 'basic' && (
                <Badge variant="default" className="w-full justify-center py-2">
                  Current Plan
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="medical-hero-card border-2 border-yellow-500 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-yellow-500 text-white px-4 py-1">
                Most Popular
              </Badge>
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Premium Membership
              </CardTitle>
              <div className="text-3xl font-bold">
                R39
                <span className="text-lg font-normal text-muted-foreground">/quarter</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">All Basic features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Priority booking (skip the queue)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Waived booking fees on first 3 appointments/quarter</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Extended appointment protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Family member bookings (up to 4)</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Health tracking and analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Same-day appointment availability</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">24/7 priority support</span>
                </div>
              </div>
              
              {membership?.membership_type === 'premium' ? (
                <Badge variant="default" className="w-full justify-center py-2 bg-yellow-500">
                  Current Plan
                </Badge>
              ) : (
                <Button 
                  onClick={handleUpgradeToPremium}
                  disabled={isUpgrading}
                  className="w-full btn-medical-primary"
                >
                  {isUpgrading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Upgrade to Premium
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Benefits Breakdown */}
        <Tabs defaultValue="savings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="savings">Cost Savings</TabsTrigger>
            <TabsTrigger value="features">Premium Features</TabsTrigger>
            <TabsTrigger value="billing">Billing History</TabsTrigger>
          </TabsList>

          <TabsContent value="savings">
            <Card className="medical-hero-card">
              <CardHeader>
                <CardTitle>How Premium Saves You Money</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold mb-4">With Basic Membership (per quarter):</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>3 appointments × R10 booking fee</span>
                        <span>R30</span>
                      </div>
                      <div className="flex justify-between">
                        <span>No priority booking</span>
                        <span className="text-red-600">Longer wait times</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Limited support</span>
                        <span className="text-red-600">Email only</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total quarterly cost</span>
                        <span>R30+</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-4 text-green-600">With Premium Membership (per quarter):</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Premium membership</span>
                        <span>R39</span>
                      </div>
                      <div className="flex justify-between">
                        <span>3 free booking fees saved</span>
                        <span className="text-green-600">-R30</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Priority booking + 24/7 support</span>
                        <span className="text-green-600">Included</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold text-green-600">
                        <span>Total quarterly cost</span>
                        <span>R39 (saves R21+ value)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card className="medical-hero-card">
              <CardHeader>
                <CardTitle>Premium Features Explained</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Priority Booking</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Skip the queue and get priority access to appointment slots. Premium members see available slots 24 hours before basic members.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Family Member Bookings</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Book appointments for up to 4 family members under your premium account. Perfect for managing your family's healthcare needs.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">Extended Protection</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Free rescheduling up to 2 hours before appointment time (basic members: 24 hours) and full refund protection for cancelled appointments.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card className="medical-hero-card">
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No billing history available</p>
                  <p className="text-sm">Billing information will appear here after your first payment</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MembershipManagement;