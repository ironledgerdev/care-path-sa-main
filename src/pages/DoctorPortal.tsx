import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DoctorPortal = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold text-medical-gradient">Doctor Portal</h1>
          <p className="text-muted-foreground">Manage your profile, schedule, and bookings. Join our verified network.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="medical-card">
              <CardHeader><CardTitle>New to the platform?</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p>Create a profile and submit your credentials for verification.</p>
                <Button className="btn-medical-primary" onClick={() => navigate('/doctor-enrollment')}>Join the Network</Button>
              </CardContent>
            </Card>
            <Card className="medical-card">
              <CardHeader><CardTitle>Already a doctor?</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <p>Access your dashboard to manage bookings and availability.</p>
                <Button variant="outline" onClick={() => navigate('/doctor')}>Go to Dashboard</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorPortal;
