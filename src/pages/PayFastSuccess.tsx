import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, CreditCard, Package } from 'lucide-react';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

const PayFastSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // PayFast returns these parameters
  const paymentId = searchParams.get('m_payment_id');
  const itemName = searchParams.get('item_name');
  const amountGross = searchParams.get('amount_gross');
  const paymentStatus = searchParams.get('payment_status');
  const pnReference = searchParams.get('pnReference');
  const nameFirst = searchParams.get('name_first');
  const nameLast = searchParams.get('name_last');
  const emailAddress = searchParams.get('email_address');
  const customStr1 = searchParams.get('custom_str1');

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const formatCurrency = (amount: string | null) => {
    if (!amount) return 'R0.00';
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(parseFloat(amount));
  };

  const handleViewBookings = () => {
    navigate('/booking-history');
  };

  const handleBookAnother = () => {
    navigate('/search');
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
          {/* Success Header */}
          <Card className="medical-hero-card text-center mb-8 border-green-200">
            <CardContent className="pt-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
              <p className="text-muted-foreground">
                Your payment has been processed successfully. Your appointment has been confirmed.
              </p>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="medical-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Item Information */}
              <div className="p-4 bg-muted/30 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Payment Item
                </h3>
                <div className="space-y-2 text-sm">
                  {itemName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Description</span>
                      <span className="font-medium">{itemName}</span>
                    </div>
                  )}
                  {amountGross && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-medium text-primary">{formatCurrency(amountGross)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Status */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-2">
                    <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                      {paymentStatus === 'COMPLETE' ? 'Completed' : paymentStatus || 'Processed'}
                    </Badge>
                  </div>
                </div>
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground">Reference</label>
                  <p className="text-sm font-mono mt-2 break-all">{pnReference || paymentId || 'N/A'}</p>
                </div>
              </div>

              {/* Payer Information */}
              {(nameFirst || nameLast || emailAddress) && (
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground">Payer Information</label>
                  <div className="space-y-1 mt-2 text-sm">
                    {(nameFirst || nameLast) && (
                      <p>
                        <span className="font-medium">Name:</span> {nameFirst} {nameLast}
                      </p>
                    )}
                    {emailAddress && (
                      <p>
                        <span className="font-medium">Email:</span> {emailAddress}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {customStr1 && (
                <div className="p-3 border rounded-lg">
                  <label className="text-sm font-medium text-muted-foreground">Booking ID</label>
                  <p className="text-sm font-mono mt-1 break-all">{customStr1}</p>
                </div>
              )}
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
                    <p className="text-muted-foreground">You'll receive a confirmation email with appointment details and doctor contact information at {emailAddress || 'your registered email'}.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Check Your Bookings</p>
                    <p className="text-muted-foreground">View all your confirmed appointments in your booking history.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Prepare for Your Visit</p>
                    <p className="text-muted-foreground">Arrive 15 minutes early and bring your ID, medical aid card (if applicable), and any relevant medical records.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleBookAnother}
              variant="outline"
              className="flex-1 btn-medical-secondary"
            >
              Book Another Appointment
            </Button>
            <Button
              onClick={handleViewBookings}
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

export default PayFastSuccess;
