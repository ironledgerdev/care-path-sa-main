import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Telemedicine = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold text-medical-gradient">Telemedicine</h1>
          <p className="text-muted-foreground">Consult with doctors online. Book virtual appointments and receive care from home.</p>
          <Card className="medical-card">
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc pl-5 text-sm text-foreground space-y-1">
                <li>Search for doctors offering telemedicine</li>
                <li>Choose a time and complete secure payment</li>
                <li>Join the video consultation from your dashboard</li>
              </ul>
              <Button className="btn-medical-primary" onClick={() => navigate('/search')}>Find Telemedicine Doctors</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Telemedicine;
