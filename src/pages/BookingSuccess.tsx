import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, Clock, MapPin, User, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

interface Booking {
  id: string;
  appointment_date: string;
  appointment_time: string;
  total_amount: number;
  status: string;
  payment_status: string;
  patient_notes: string;
  doctors: {
    practice_name: string;
    speciality: string;
    city: string;
    province: string;
    profiles: {
      first_name: string;
      last_name: string;
    };
  };
}

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else {
      setIsLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    let attempts = 3;
    while (attempts-- > 0) {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            doctors (
              practice_name,
              speciality,
              city,
              province,
              profiles:user_id (
                first_name,
                last_name
              )
            )
          `)
          .eq('id', bookingId)
          .single();
        if (error) throw error;
        setBooking(data as any);
        break;
      } catch (error: any) {
        if (attempts <= 0) {
          toast({
            title: "Error",
            description: "Failed to load booking details",
            variant: "destructive",
          });
        } else {
          await new Promise(r => setTimeout(r, 400));
          continue;
        }
      } finally {
        if (attempts <= 0 || booking) setIsLoading(false);
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading booking details...</h2>
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Booking not found</h2>
            <Button onClick={() => navigate('/search')} className="btn-medical-primary">
              Find Another Doctor
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <Card className="medical-hero-card text-center mb-8">
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
              <p className="text-muted-foreground">
                Your appointment has been successfully booked and payment processed.
              </p>
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card className="medical-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Doctor Information */}
              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-soft rounded-full flex items-center justify-center text-white font-bold">
                  {booking.doctors.profiles?.first_name?.[0]}{booking.doctors.profiles?.last_name?.[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    Dr. {booking.doctors.profiles?.first_name} {booking.doctors.profiles?.last_name}
                  </h3>
                  <p className="text-sm text-primary">{booking.doctors.speciality}</p>
                  <p className="text-sm text-muted-foreground">{booking.doctors.practice_name}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {booking.doctors.city}, {booking.doctors.province}
                  </div>
                </div>
              </div>

              {/* Appointment Date & Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <p className="text-sm font-semibold">{formatDate(booking.appointment_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <label className="text-sm font-medium">Time</label>
                    <p className="text-sm font-semibold">{formatTime(booking.appointment_time)}</p>
                  </div>
                </div>
              </div>

              {/* Booking Status */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="default">
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {booking.payment_status === 'paid' ? 'Paid' : 'Payment Pending'}
                  </Badge>
                </div>
              </div>

              {/* Patient Notes */}
              {booking.patient_notes && (
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium">Your Notes</label>
                  <p className="text-sm text-muted-foreground mt-1">{booking.patient_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card className="medical-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Consultation Fee</span>
                  <span>{formatCurrency(booking.total_amount - 1000)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Booking Fee</span>
                  <span>R10.00</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Paid</span>
                  <span className="text-primary">{formatCurrency(booking.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="medical-card mb-6">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Confirmation Email</p>
                    <p className="text-muted-foreground">You'll receive a confirmation email with appointment details and doctor contact information.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Prepare for Your Visit</p>
                    <p className="text-muted-foreground">Bring your ID, medical aid card (if applicable), and any relevant medical records.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Attend Your Appointment</p>
                    <p className="text-muted-foreground">Arrive 15 minutes early for registration. The doctor will see you at your scheduled time.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => navigate('/search')}
              variant="outline"
              className="flex-1 btn-medical-secondary"
            >
              Book Another Appointment
            </Button>
            <Button
              onClick={() => navigate('/dashboard')}
              className="flex-1 btn-medical-primary"
            >
              View My Bookings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
