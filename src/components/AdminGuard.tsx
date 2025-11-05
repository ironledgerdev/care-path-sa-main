import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user has admin role - NO sessionStorage bypass
  if (!profile || profile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md medical-card">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-bold text-medical-gradient mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              Administrator privileges are required to access this page.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {!profile ? 'Please sign in first.' : 'Your account does not have admin permissions.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => navigate('/')} className="btn-medical-primary">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
              {!profile && (
                <Button onClick={() => window.dispatchEvent(new Event('openAuthModal'))} variant="outline" className="btn-medical-secondary">
                  Sign In
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is admin - render children
  return <>{children}</>;
};
