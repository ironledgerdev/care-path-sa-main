import React from 'react';
import { ArrowRight, MapPin, Clock, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import heroImage from '@/assets/medical-hero.jpg';
import SearchFilters from './SearchFilters';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { icon: <MapPin className="h-5 w-5" />, label: 'Provinces Covered', value: '9' },
    { icon: <Shield className="h-5 w-5" />, label: 'Verified Doctors', value: '1,000+' },
    { icon: <Clock className="h-5 w-5" />, label: 'Avg. Booking Time', value: '< 2 min' },
    { icon: <Star className="h-5 w-5" />, label: 'Patient Rating', value: '4.9/5' }
  ];

  const handleStartBooking = () => {
    if (user && profile) {
      // User is logged in, go to search doctors
      navigate('/search');
    } else {
      // User not logged in, show auth modal to log in first
      // We'll trigger the auth modal from the parent component
      const authEvent = new CustomEvent('openAuthModal');
      window.dispatchEvent(authEvent);
    }
  };

  const handleJoinAsDoctor = () => {
    navigate('/doctor-enrollment');
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent"></div>
      </div>

      {/* Floating Medical Elements */}
      <div className="absolute top-20 right-10 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-float"></div>
      <div className="absolute top-1/3 right-1/4 w-8 h-8 bg-primary-glow/30 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/3 right-20 w-12 h-12 bg-primary/30 rounded-full blur-lg animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center min-h-screen py-20 gap-8">
          {/* Top Info */}
          <div className="text-center animate-slide-in-up max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <MapPin className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">South Africa's Leading Medical Platform</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Find & Book
              <span className="block text-primary-glow">Doctors</span>
              <span className="block">Instantly</span>
            </h1>

            <p className="text-xl lg:text-2xl text-white/90 leading-relaxed">
              Connect with verified medical professionals across all 9 provinces of South Africa.
              Book appointments in minutes, not hours.
            </p>
          </div>

          {/* Search across */}
          <div className="w-full animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
            <SearchFilters />
          </div>

          {/* CTAs under search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="btn-medical-primary text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300 group"
              onClick={handleStartBooking}
            >
              {user && profile ? 'Start Booking Now' : 'Log In to Book'}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="btn-medical-secondary text-lg px-8 py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300 group border-2 border-white/30 text-white hover:bg-white/10"
              onClick={handleJoinAsDoctor}
            >
              Join as Doctor
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-colors duration-300">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center text-primary-glow mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-white/70">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
