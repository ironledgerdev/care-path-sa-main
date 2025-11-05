import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl font-bold text-medical-gradient">Contact Us</h1>
          <p className="text-muted-foreground">We'd love to hear from you. Send us a message and we'll get back to you.</p>
          <Card className="medical-card">
            <CardHeader><CardTitle>Send a Message</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Your email" />
              <Input placeholder="Subject" />
              <Textarea placeholder="Message" rows={5} />
              <Button className="btn-medical-primary">Send</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Contact;
