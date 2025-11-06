import React from 'react';
import { Heart, Users, Clock, Shield, MapPin, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import DoctorCard from '@/components/DoctorCard';
import { useNavigate, Link } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  // Sample doctor data for demo
  const sampleDoctors = [
    {
      name: 'Thabo Mthembu',
      specialty: 'Cardiologist',
      location: 'Sandton',
      province: 'Gauteng',
      rating: 4.9,
      reviews: 127,
      price: 'R450',
      availability: 'Available Today',
      verified: true,
      languages: ['English', 'Zulu', 'Afrikaans'],
      experience: '15 years'
    },
    {
      name: 'Sarah Williams',
      specialty: 'General Practitioner',
      location: 'Cape Town',
      province: 'Western Cape',
      rating: 4.8,
      reviews: 89,
      price: 'R350',
      availability: 'Next Available: Tomorrow',
      verified: true,
      languages: ['English', 'Afrikaans'],
      experience: '12 years'
    },
    {
      name: 'Nomsa Dlamini',
      specialty: 'Pediatrician',
      location: 'Durban',
      province: 'KwaZulu-Natal',
      rating: 4.9,
      reviews: 156,
      price: 'R400',
      availability: 'Available Today',
      verified: true,
      languages: ['English', 'Zulu', 'Sotho'],
      experience: '18 years'
    }
  ];

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Verified Doctors',
      description: 'All medical professionals are thoroughly vetted and verified for your safety and peace of mind.'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Instant Booking',
      description: 'Book appointments 24/7 with real-time availability and instant confirmation.'
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: 'Nationwide Coverage',
      description: 'Access healthcare professionals across all 9 provinces of South Africa.'
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Patient-Centered',
      description: 'Designed with patients in mind - transparent pricing, genuine reviews, and quality care.'
    }
  ];

  const testimonials = [
    {
      name: 'Lerato Motsumi',
      location: 'Johannesburg',
      text: 'MedMap made it so easy to find a specialist near me. Booked and saw a cardiologist the same day!',
      rating: 5
    },
    {
      name: 'David van der Merwe',
      location: 'Cape Town',
      text: 'Transparent pricing and genuine reviews helped me choose the right doctor. Excellent platform!',
      rating: 5
    },
    {
      name: 'Nomfundo Mbeki',
      location: 'Durban',
      text: 'The Premium membership is worth every rand. Priority booking saved me so much time.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Doctors */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-medical-gradient mb-4">
              Featured Doctors
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Connect with top-rated medical professionals across South Africa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sampleDoctors.map((doctor, index) => (
              <DoctorCard key={index} doctor={doctor} />
            ))}
          </div>

          <div className="text-center">
              <Button className="btn-medical-primary" onClick={() => navigate('/search')}>
                View All Doctors
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-medical-gradient mb-4">
              Why Choose MedMap?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're revolutionizing healthcare access across South Africa with innovation, trust, and transparency
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="medical-card text-center hover:scale-105 transition-transform duration-300">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-medical-gradient mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-medical-gradient mb-4">
              What Our Patients Say
            </h2>
            <p className="text-xl text-muted-foreground">
              Real experiences from real South Africans
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="medical-hero-card">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <div className="font-semibold text-primary">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-soft">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-primary-glow mb-8 max-w-3xl mx-auto">
            Join thousands of South Africans who have already discovered a better way to access healthcare
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4 h-auto">
              Start Booking Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white/10 text-lg px-8 py-4 h-auto"
              onClick={() => navigate('/doctor-enrollment')}
            >
              Join as a Doctor
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="h-8 w-8 text-primary-glow" />
                <span className="text-xl font-bold">MedMap</span>
              </div>
              <p className="text-muted-foreground mb-4">
                South Africa's leading medical booking platform. Find. Book. Heal.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Patients</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/search" className="hover:text-primary">Find Doctors</Link></li>
                <li><Link to="/book-appointments" className="hover:text-primary">Book Appointments</Link></li>
                <li><Link to="/memberships" className="hover:text-primary">Memberships</Link></li>
                <li><Link to="/telemedicine" className="hover:text-primary">Telemedicine</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Doctors</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/doctor-portal" className="hover:text-primary">Doctor Portal</Link></li>
                <li><Link to="/doctor-enrollment" className="hover:text-primary">Join Network</Link></li>
                <li><Link to="/practice-management" className="hover:text-primary">Practice Management</Link></li>
                <li><Link to="/support" className="hover:text-primary">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
                <li><Link to="/team" className="hover:text-primary">Meet the Team</Link></li>
                <li><Link to="/careers" className="hover:text-primary">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-muted-foreground/20 mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 MedMap. Proudly South African. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
