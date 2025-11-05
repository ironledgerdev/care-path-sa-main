import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import { MobileNavigation } from './MobileNavigation';
import { NotificationCenter } from './NotificationCenter';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Calendar, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function MobileHeader() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left: Mobile navigation and logo */}
        <div className="flex items-center gap-3">
          <MobileNavigation />
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg">HealthCare</span>
          </Link>
        </div>

        {/* Right: Notifications and user menu */}
        <div className="flex items-center gap-2">
          <NotificationCenter />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {profile?.first_name?.[0]}{profile?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-sm">
                      {profile?.first_name} {profile?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>

                {profile?.role === 'patient' && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/bookings')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Booking History</span>
                    </DropdownMenuItem>
                  </>
                )}
                
                {profile?.role === 'doctor' && (
                  <DropdownMenuItem onClick={() => navigate('/doctor')}>
                    <Stethoscope className="mr-2 h-4 w-4" />
                    <span>Doctor Dashboard</span>
                  </DropdownMenuItem>
                )}
                
                {profile?.role === 'admin' && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Admin Dashboard</span>
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { tab: 'signup' } }))} size="sm" variant="outline" className="btn-medical-secondary">
                Sign Up
              </Button>
              <Button onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal', { detail: { tab: 'login' } }))} size="sm" className="btn-medical-primary">
                Sign In
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
