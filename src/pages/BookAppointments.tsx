import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const BookAppointments = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold text-medical-gradient">Book Appointments</h1>
          <p className="text-muted-foreground">Search and book verified doctors by specialty, location, and price. Secure PayFast checkout.</p>
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>Use our advanced search to find the right doctor, then select a time and pay online.</p>
              <Button className="btn-medical-primary" onClick={() => navigate('/search')}>Find Doctors</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BookAppointments;
