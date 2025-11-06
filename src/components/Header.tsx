import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MapPin, Menu, X, User, LogOut, Settings, Calendar } from 'lucide-react';
import { AuthModal } from './auth/AuthModal';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  // Listen for auth modal events from other components
  useEffect(() => {
    const handleOpenAuthModal = (e: any) => {
      const requestedTab = e?.detail?.tab as 'login' | 'signup' | undefined;
      setAuthTab(requestedTab || 'login');
      setAuthModalOpen(true);
    };

    window.addEventListener('openAuthModal', handleOpenAuthModal as EventListener);
    return () => window.removeEventListener('openAuthModal', handleOpenAuthModal as EventListener);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { name: 'Home', path: '/' },
    { name: 'Find Doctors', path: '/search' },
    { name: 'Memberships', path: '/memberships' },
    { name: 'About Us', path: '/about' },
    { name: 'Meet the Team', path: '/team' },
    { name: 'Legal', path: '/legal' },
    // Direct admin access link for trusted administrators
    { name: 'Admin Panel', path: '/admin-mashau-permits' },
  ];

  const getUserDashboardLink = () => {
    if (!profile) return '/';
    
    switch (profile.role) {
      case 'admin':
        return '/admin';
      case 'doctor':
        return '/doctor';
      default:
        return '/dashboard';
    }
  };

  return (
    <header className="bg-card/95 backdrop-blur-sm border-b border-primary/20 sticky top-0 z-50 shadow-[var(--shadow-medical)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo Section - Full Width */}
        <div className="flex items-center justify-center py-4 border-b border-primary/10">
          <Link 
            to="/" 
            className="flex items-center space-x-4 hover:scale-105 transition-all duration-500 group"
          >
            <div className="flex items-center space-x-4">
              <div className="medical-icon h-14 w-14 md:h-16 md:w-16 bg-white rounded-2xl transition-all duration-300 group-hover:rotate-6 flex items-center justify-center overflow-hidden shadow-sm">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets%2Faf68e484decf46379ccbfc0f4be45e74%2F35b00f08674a45308869d5f3a08c0ee7?format=webp&width=200"
                  alt="MedMap logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col text-center">
                <span className="text-3xl md:text-4xl font-bold text-medical-gradient tracking-wide">
                  MedMap
                </span>
                <span className="text-sm text-muted-foreground font-medium tracking-wider">
                  Find. Book. Heal.
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="flex items-center justify-between py-3">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-1 bg-muted/30 rounded-full p-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    isActive(item.path)
                      ? 'text-primary-foreground bg-primary shadow-lg shadow-primary/25'
                      : 'text-foreground hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 hover:bg-primary/10">
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={getUserDashboardLink()} className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {profile.role === 'patient' && (
                    <DropdownMenuItem asChild>
                      <Link to="/bookings" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Booking History
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="flex items-center gap-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="btn-medical-secondary hover:scale-105 transition-transform duration-200"
                  onClick={() => { setAuthTab('signup'); setAuthModalOpen(true); }}
                >
                  Sign Up
                </Button>
                <Button
                  className="btn-medical-primary hover:scale-105 transition-transform duration-200"
                  onClick={() => { setAuthTab('login'); setAuthModalOpen(true); }}
                >
                  Log In
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-primary hover:bg-primary/10"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary/20 animate-slide-in-up">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-primary bg-primary/10'
                      : 'text-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col space-y-2 pt-4 border-t border-primary/20">
                {user && profile ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="btn-medical-secondary w-full"
                      asChild
                    >
                      <Link to={getUserDashboardLink()}>Dashboard</Link>
                    </Button>
                    <Button 
                      onClick={signOut}
                      variant="destructive"
                      className="w-full"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="btn-medical-secondary w-full"
                      onClick={() => { setAuthTab('signup'); setAuthModalOpen(true); }}
                    >
                      Sign Up
                    </Button>
                    <Button
                      className="btn-medical-primary w-full"
                      onClick={() => { setAuthTab('login'); setAuthModalOpen(true); }}
                    >
                      Log In
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
      
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialTab={authTab} />
    </header>
  );
};

export default Header;
