import React from 'react';
import { Check, Star, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Memberships = () => {
  const plans = [
    {
      name: 'Basic',
      subtitle: 'Free Plan',
      price: 'R0',
      billing: 'Forever Free',
      description: 'Perfect for occasional medical needs',
      features: [
        'Search and browse all doctors',
        'View doctor profiles and ratings',
        'Basic appointment booking',
        'R10 per booking fee',
        'Email support',
        'Basic search filters'
      ],
      bookingFee: 'R10 per booking',
      icon: <Star className="h-6 w-6" />,
      popular: false,
      ctaText: 'Get Started Free',
      gradient: 'from-secondary to-accent'
    },
    {
      name: 'Premium',
      subtitle: 'Most Popular',
      price: 'R39',
      billing: 'Billed quarterly',
      description: 'Best value for regular healthcare users',
      features: [
        'Everything in Basic plan',
        'First 5 bookings FREE each quarter',
        'Priority booking slots',
        'Advanced search filters',
        'Telemedicine consultations',
        'Priority customer support',
        'Appointment reminders',
        'Health records management',
        'Family account linking'
      ],
      bookingFee: 'First 5 bookings free, then R8 per booking',
      icon: <Crown className="h-6 w-6" />,
      popular: true,
      ctaText: 'Start Premium',
      gradient: 'from-primary to-primary-soft'
    }
  ];

  const { toast } = useToast();
  const { user } = useAuth();

  const startPremiumCheckout = async () => {
    try {
      if (!user) {
        window.dispatchEvent(new Event('openAuthModal'));
        return;
      }
      const amountCents = 3900; // R39 quarterly
      const { data, error } = await supabase.functions.invoke('create-payfast-membership', {
        body: {
          amount: amountCents,
          description: 'Premium membership (quarterly)',
          plan: 'premium'
        }
      });
      if (error) throw error;
      if (data?.payment_url) {
        window.location.href = data.payment_url;
      } else {
        throw new Error('Payment URL not returned');
      }
    } catch (err: any) {
      toast({ title: 'Checkout Failed', description: err.message || 'Unable to start checkout', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Choose Your Plan</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-medical-gradient mb-4">
            Membership Plans
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your healthcare needs. All plans include access to South Africa's 
            largest network of verified medical professionals.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative medical-hero-card hover:scale-105 transition-all duration-500 ${
                plan.popular ? 'ring-2 ring-primary shadow-[var(--shadow-glow)]' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center text-white mb-4`}>
                  {plan.icon}
                </div>
                
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                
                <div className="mt-4">
                  <div className="text-4xl font-bold text-medical-gradient">{plan.price}</div>
                  <p className="text-sm text-muted-foreground">{plan.billing}</p>
                </div>
                
                <p className="text-sm text-foreground mt-2">{plan.description}</p>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="bg-accent/50 p-3 rounded-lg border-l-4 border-primary">
                    <p className="text-sm font-medium text-primary">Booking Fee:</p>
                    <p className="text-sm text-foreground">{plan.bookingFee}</p>
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    className={`w-full mt-6 ${plan.popular ? 'btn-medical-primary' : 'btn-medical-secondary'}`}
                    size="lg"
                    onClick={plan.name === 'Premium' ? startPremiumCheckout : undefined}
                  >
                    {plan.ctaText}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-medical-gradient mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="medical-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-primary">How does quarterly billing work?</h3>
                <p className="text-muted-foreground">Premium memberships are billed every 3 months. Your free bookings reset each quarter.</p>
              </CardContent>
            </Card>
            
            <Card className="medical-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-primary">Can I cancel anytime?</h3>
                <p className="text-muted-foreground">Yes, you can cancel your Premium membership at any time. No hidden fees or contracts.</p>
              </CardContent>
            </Card>
            
            <Card className="medical-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-primary">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">We accept all major credit cards and PayFast for secure South African payments.</p>
              </CardContent>
            </Card>
            
            <Card className="medical-card">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2 text-primary">Do doctors set their own prices?</h3>
                <p className="text-muted-foreground">Yes, doctors set their consultation fees. Our booking fees are separate and clearly displayed.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Memberships;
