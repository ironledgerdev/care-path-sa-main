import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Support = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold text-medical-gradient">Support</h1>
          <p className="text-muted-foreground">Get help with bookings, payments, and account issues.</p>
          <Card className="medical-card">
            <CardHeader><CardTitle>Contact Support</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm">Email: support@ironledgermedmap.co.za</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Support;
