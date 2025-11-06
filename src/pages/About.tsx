import React from 'react';
import { Heart, Shield, Users, Zap, MapPin, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';

const About = () => {
  const solutions = [
    {
      title: 'For Patients',
      icon: <Heart className="h-8 w-8" />,
      benefits: [
        'Find verified doctors across all 9 provinces',
        'Compare prices and read genuine reviews',
        'Book appointments instantly 24/7',
        'Secure payment processing with PayFast',
        'Telemedicine options available',
        'Health records management'
      ]
    },
    {
      title: 'For Doctors',
      icon: <Shield className="h-8 w-8" />,
      benefits: [
        'Reach more patients across South Africa',
        'Manage appointments and schedules',
        'Secure payment collection',
        'Professional profile showcase',
        'Patient communication tools',
        'Analytics and reporting dashboard'
      ]
    }
  ];

  const values = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: 'Local Focus',
      description: '100% South African owned, built for South African healthcare needs'
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Trust & Security',
      description: 'All doctors are verified and payments are secured through PayFast'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Accessibility',
      description: 'Making quality healthcare accessible to everyone, everywhere'
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Innovation',
      description: 'Leveraging technology to improve healthcare delivery'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-slide-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">About MedMap</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-medical-gradient mb-6">
            Revolutionizing Healthcare Access in South Africa
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            MedMap is South Africa's premier digital healthcare platform, connecting patients 
            with verified medical professionals across all nine provinces. We're bridging the gap 
            between patients and quality healthcare with technology, trust, and transparency.
          </p>
        </div>

        {/* Mission Statement */}
        <Card className="medical-hero-card mb-16 max-w-4xl mx-auto animate-fade-in-scale">
          <CardContent className="p-8 text-center">
            <Award className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-medical-gradient mb-4">Our Mission</h2>
            <p className="text-lg text-foreground leading-relaxed">
              To democratize access to quality healthcare across South Africa by creating a seamless, 
              transparent, and trustworthy platform that connects patients with the right medical 
              professionals at the right time, regardless of their location or background.
            </p>
          </CardContent>
        </Card>

        {/* Solutions Section */}
        <div className="mb-16 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="text-3xl font-bold text-center text-medical-gradient mb-12">
            Solutions We Provide
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {solutions.map((solution) => (
              <Card key={solution.title} className="medical-hero-card animate-fade-in-scale">
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary glow-medical">
                      {solution.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-medical-gradient">
                      {solution.title}
                    </h3>
                  </div>
                  
                  <ul className="space-y-3">
                    {solution.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                        <span className="text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16 animate-slide-in-up" style={{ animationDelay: '0.15s' }}>
          <h2 className="text-3xl font-bold text-center text-medical-gradient mb-12">
            Our Core Values
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="medical-card text-center hover:scale-105 transition-transform duration-300">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto mb-4">
                    {value.icon}
                  </div>
                  <h3 className="font-bold text-lg text-primary mb-3">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* South African Focus */}
        <Card className="medical-hero-card max-w-4xl mx-auto animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full mx-auto mb-6 flex items-center justify-center pulse-medical">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-medical-gradient mb-4">
                Proudly 100% South African Owned
              </h2>
              
              <p className="text-lg text-foreground mb-6 leading-relaxed">
                As a proudly South African company, we understand the unique challenges facing 
                our healthcare system. From the bustling streets of Johannesburg to the rural 
                communities of Limpopo, we're committed to ensuring every South African has 
                access to quality medical care.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">11+</div>
                  <div className="text-sm text-muted-foreground">Official Languages Supported</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">9</div>
                  <div className="text-sm text-muted-foreground">Provinces Covered</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">1000+</div>
                  <div className="text-sm text-muted-foreground">Verified Doctors</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default About;
