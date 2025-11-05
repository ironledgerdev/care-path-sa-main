import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const { signIn } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Signup form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setSignupEmail('');
      setSignupPassword('');
      setLoading(false);
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password) {
      toast({ title: 'Missing details', description: 'Please enter both email and password.', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: 'Sign in failed', description: error.message || 'Invalid email or password.', variant: 'destructive' });
        return;
      }

      toast({ title: 'Welcome back', description: 'Signed in successfully.' });
      onClose();
    } catch (err: any) {
      toast({ title: 'Unexpected error', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!signupEmail || !signupPassword) {
      toast({ title: 'Missing details', description: 'Please enter email and password.', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: { emailRedirectTo: redirectUrl },
      });

      if (error) {
        toast({ title: 'Sign up failed', description: error.message, variant: 'destructive' });
        return;
      }

      // Do NOT insert into profiles here; user isn't authenticated yet (RLS blocks anon inserts).
      // We'll create the profile on first login in useAuth.

      toast({ title: 'Check your email', description: 'We sent a verification link to complete your registration.' });
      onClose();
    } catch (err: any) {
      toast({ title: 'Unexpected error', description: err?.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{activeTab === 'login' ? 'Sign in' : 'Create an account'}</DialogTitle>
          <DialogDescription>
            {activeTab === 'login' ? 'Enter your credentials to access your account.' : 'Sign up to book appointments and manage your profile.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" disabled={loading} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading} className="btn-medical-primary">{loading ? 'Signing in…' : 'Sign in'}</Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" disabled={loading} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signupEmail">Email</Label>
                <Input id="signupEmail" type="email" autoComplete="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signupPassword">Password</Label>
                <Input id="signupPassword" type="password" autoComplete="new-password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="••••••••" disabled={loading} />
              </div>
              <DialogFooter className="flex items-center justify-between gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                <div className="flex items-center gap-2">
                  <Button asChild variant="secondary" disabled={loading}>
                    <Link to="/doctor-enrollment">Join as Doctor</Link>
                  </Button>
                  <Button type="submit" disabled={loading} className="btn-medical-primary">{loading ? 'Creating…' : 'Create account'}</Button>
                </div>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
