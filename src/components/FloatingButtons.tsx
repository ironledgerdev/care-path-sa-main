import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const FloatingButtons = () => {
  const [sosOpen, setSosOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const emergencyContacts = [
    { name: 'Emergency Medical Services', number: '10177', description: '24/7 Emergency Medical Response' },
    { name: 'Police Emergency', number: '10111', description: '24/7 Police Emergency Service' },
    { name: 'ER24', number: '084 124', description: 'Private Emergency Medical Service' },
    { name: 'Netcare 911', number: '082 911', description: 'Private Emergency Response' },
  ];

  return (
    <>
      {/* SOS Emergency Button */}
      <Dialog open={sosOpen} onOpenChange={setSosOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-20 right-6 h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 z-50 pulse"
            size="icon"
          >
            <AlertTriangle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Emergency Services
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              In case of emergency, contact these 24/7 services immediately:
            </p>
            {emergencyContacts.map((contact, index) => (
              <Card key={index} className="border border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{contact.name}</h4>
                      <p className="text-xs text-muted-foreground">{contact.description}</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => window.open(`tel:${contact.number}`, '_self')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {contact.number}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-red-700">
                <strong>Disclaimer:</strong> IronLedgerMedMap is a booking platform only. 
                For medical emergencies, always contact professional emergency services directly.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Support Button */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full btn-medical-primary shadow-lg hover:shadow-xl transition-all duration-300 z-50"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Contact Support
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle className="text-lg">How can we help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open('mailto:support@ironledgermedmap.co.za?subject=Booking Assistance', '_blank')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Booking Assistance
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open('mailto:technical@ironledgermedmap.co.za?subject=Technical Support', '_blank')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Technical Support
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => window.open('mailto:billing@ironledgermedmap.co.za?subject=Billing Inquiry', '_blank')}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Billing Support
                  </Button>
                </div>
                
                <div className="mt-6 space-y-2">
                  <h4 className="font-semibold text-sm">Business Hours</h4>
                  <p className="text-xs text-muted-foreground">
                    Monday - Friday: 8:00 AM - 6:00 PM (SAST)<br />
                    Saturday: 9:00 AM - 2:00 PM (SAST)<br />
                    Sunday: Closed
                  </p>
                </div>

                <div className="mt-4 p-3 bg-accent/50 rounded-lg border-l-4 border-primary">
                  <p className="text-xs text-muted-foreground">
                    We typically respond within 2-4 hours during business hours.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};