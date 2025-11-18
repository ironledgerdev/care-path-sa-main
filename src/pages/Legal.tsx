import React from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, FileText, AlertTriangle, Scale, Lock, UserCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const Legal = () => {
  const legalSections = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Platform Disclaimer',
      content: `IronLedgerMedMap is a booking platform that facilitates connections between patients and healthcare providers. We are NOT a medical practice and do NOT provide medical services, diagnoses, treatments, or medical advice. All medical services are provided solely by independent healthcare professionals listed on our platform.`
    },
    {
      icon: <AlertTriangle className="h-6 w-6" />,
      title: 'Medical Emergency Notice',
      content: `In case of medical emergencies, DO NOT use this platform. Immediately contact emergency services at 10177 (Emergency Medical Services) or 10111 (Police). Our platform is for scheduling routine appointments only and is not suitable for urgent or emergency medical situations.`
    },
    {
      icon: <UserCheck className="h-6 w-6" />,
      title: 'Healthcare Provider Verification',
      content: `All healthcare providers undergo our verification process which includes checking credentials, licenses, and qualifications. However, patients are encouraged to independently verify provider credentials with the Health Professions Council of South Africa (HPCSA) before booking appointments.`
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: 'Terms of Service',
      content: `By using IronLedgerMedMap, you agree to our terms of service. You must be 18 years or older, or have parental consent. You are responsible for providing accurate information and maintaining the confidentiality of your account. We reserve the right to suspend or terminate accounts for misuse.`
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: 'Privacy & Data Protection',
      content: `We comply with South Africa's Protection of Personal Information Act (POPIA). Your personal and health information is encrypted, stored securely, and never shared without your consent except as required by law. Healthcare providers only receive information necessary for appointment management.`
    },
    {
      icon: <Scale className="h-6 w-6" />,
      title: 'Limitation of Liability',
      content: `IronLedgerMedMap's liability is limited to the booking fee paid. We are not liable for medical outcomes, provider-patient interactions, treatment results, or any direct or indirect damages arising from platform use. Healthcare providers are independent contractors responsible for their own professional conduct and malpractice insurance.`
    }
  ];

  const regulations = [
    'Health Professions Council of South Africa (HPCSA) Guidelines',
    'Protection of Personal Information Act (POPIA) Compliance',
    'Electronic Communications and Transactions Act (ECTA)',
    'National Health Act Regulations',
    'Consumer Protection Act (CPA) Compliance',
    'Medicines and Related Substances Control Act'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Scale className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Legal Information</span>
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-bold text-medical-gradient mb-4">
            Legal & Compliance
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Understanding your rights, our responsibilities, and regulatory compliance 
            for safe healthcare booking in South Africa.
          </p>
        </div>

        {/* Legal Sections */}
        <div className="grid gap-8 max-w-6xl mx-auto mb-16">
          {legalSections.map((section, index) => (
            <Card key={index} className="medical-hero-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-primary">
                  {section.icon}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{section.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Regulatory Compliance */}
        <Card className="medical-hero-card max-w-4xl mx-auto mb-16">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-primary">
              <Shield className="h-6 w-6" />
              Regulatory Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground mb-6">
              IronLedgerMedMap operates in full compliance with South African healthcare and data protection regulations:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {regulations.map((regulation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                  <Shield className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                  <span className="text-sm text-foreground">{regulation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Documents */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-medical-gradient mb-8 text-center">
            Compliance Documents
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* POPIA Privacy Policy */}
            <Card className="medical-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-medical-primary" />
                  POPIA Privacy Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Protection of Personal Information Act, 2013 (Act No. 4 of 2013)
                </p>
                <p className="text-sm">
                  Our comprehensive privacy policy outlining how we collect, use, and protect your personal information in compliance with POPIA.
                </p>
                <div className="flex flex-col gap-2 pt-4">
                  <Button asChild className="w-full btn-medical-primary">
                    <Link to="/privacy-policy" className="inline-flex items-center justify-center gap-2">
                      View Full Policy
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/documents/POPIA-Privacy-Policy.md" download className="inline-flex items-center justify-center gap-2">
                      <FileText className="h-4 w-4" />
                      Download Document
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PAIA Manual */}
            <Card className="medical-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-medical-primary" />
                  PAIA Manual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Promotion of Access to Information Act, 2000 (Act No. 2 of 2000)
                </p>
                <p className="text-sm">
                  Instructions for requesting access to records held by MedMap, including procedures, fees, and appeal mechanisms.
                </p>
                <div className="flex flex-col gap-2 pt-4">
                  <Button asChild className="w-full btn-medical-primary">
                    <Link to="/paia-manual" className="inline-flex items-center justify-center gap-2">
                      View Manual
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href="/documents/PAIA-Manual.md" download className="inline-flex items-center justify-center gap-2">
                      <FileText className="h-4 w-4" />
                      Download Manual
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Legal */}
        <Card className="medical-card max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-primary">Legal Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              For legal inquiries, compliance questions, or to report concerns:
            </p>
            <div className="space-y-2">
              <p className="font-medium">Email: legal@ironledgermedmap.co.za</p>
              <p className="font-medium">Phone: +27 11 123 4567</p>
              <p className="text-sm text-muted-foreground">
                Business Hours: Monday - Friday, 9:00 AM - 5:00 PM (SAST)
              </p>
            </div>
            <div className="mt-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                <strong>Privacy & Data Protection:</strong> privacy@ironledgermedmap.co.za
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>PAIA Requests:</strong> paia@ironledgermedmap.co.za
              </p>
            </div>
            <div className="mt-6 p-4 bg-accent/50 rounded-lg border-l-4 border-primary">
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString('en-ZA', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Legal;
