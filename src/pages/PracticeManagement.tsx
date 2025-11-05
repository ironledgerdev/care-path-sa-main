import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PracticeManagement = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold text-medical-gradient">Practice Management</h1>
          <p className="text-muted-foreground">Tools for schedule management, patient communication, and reporting.</p>
          <Card className="medical-card">
            <CardHeader><CardTitle>Coming Features</CardTitle></CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Calendar-based availability</li>
                <li>Automated reminders</li>
                <li>Patient messaging and files</li>
                <li>Analytics and payout tracking</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PracticeManagement;
