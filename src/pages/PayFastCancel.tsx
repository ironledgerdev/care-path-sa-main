import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, AlertCircle, HelpCircle } from 'lucide-react';
import Header from '@/components/Header';

const PayFastCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // PayFast parameters (if provided)
  const itemName = searchParams.get('item_name');
  const customStr1 = searchParams.get('custom_str1');

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleRetryBooking = () => {
    if (customStr1) {
      navigate(`/booking-history?booking_id=${customStr1}`);
    } else {
      navigate('/search');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewBookings = () => {
    navigate('/booking-history');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
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
        <div className="max-w-2xl mx-auto">
          {/* Cancel Header */}
          <Card className="medical-hero-card text-center mb-8 border-orange-200">
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="h-8 w-8 text-orange-600" />
              </div>
              <h1 className="text-3xl font-bold text-orange-600 mb-2">Payment Cancelled</h1>
              <p className="text-muted-foreground">
                Your payment has been cancelled. Your appointment is not yet confirmed.
              </p>
            </CardContent>
          </Card>

          {/* Information Cards */}
          <Card className="medical-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                What This Means
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-900">
                  You cancelled the payment on PayFast. Your appointment request has been saved, but it is <strong>not confirmed</strong> until payment is completed.
                </p>
              </div>

              {itemName && (
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground">Payment Item</label>
                  <p className="text-sm font-medium mt-1">{itemName}</p>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <p className="font-medium">Your appointment has NOT been confirmed because:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Payment was cancelled before completion</li>
                  <li>No funds were charged to your account</li>
                  <li>The booking slot may no longer be reserved</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Why Payment Cancelled */}
          <Card className="medical-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Common Reasons for Cancellation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>You clicked the back button or closed the payment window</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>You selected "Cancel" on the PayFast payment page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>Connection was lost during payment processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">•</span>
                  <span>You decided not to proceed with the booking</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="medical-card mb-6">
            <CardHeader>
              <CardTitle>What You Can Do Now</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Retry Payment</p>
                    <p className="text-muted-foreground">Complete the payment to confirm your appointment booking.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Check Your Booking</p>
                    <p className="text-muted-foreground">View your pending bookings in the booking history to retry payment.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Book a Different Doctor</p>
                    <p className="text-muted-foreground">Search for another doctor and start the booking process again.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Info */}
          <Card className="medical-card mb-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                </div>
                <div className="text-sm">
                  <p className="font-medium text-blue-900 mb-1">Need Help?</p>
                  <p className="text-blue-800">
                    If you continue to experience payment issues, please contact our support team at <a href="mailto:support@medmap.co.za" className="font-medium underline hover:text-blue-700">support@medmap.co.za</a> or call <a href="tel:+27001234567" className="font-medium underline hover:text-blue-700">+27 (0) 00 123 4567</a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleGoHome}
              variant="outline"
              className="flex-1 btn-medical-secondary"
            >
              Return Home
            </Button>
            <Button
              onClick={handleViewBookings}
              variant="outline"
              className="flex-1 btn-medical-secondary"
            >
              View Bookings
            </Button>
            <Button
              onClick={handleRetryBooking}
              className="flex-1 btn-medical-primary"
            >
              Retry Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayFastCancel;
