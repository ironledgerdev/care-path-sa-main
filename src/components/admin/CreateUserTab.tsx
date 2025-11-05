import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus } from 'lucide-react';

interface NewUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'patient' | 'doctor' | 'admin';
}

interface CreateUserTabProps {
  newUser: NewUser;
  setNewUser: React.Dispatch<React.SetStateAction<NewUser>>;
  onCreateUser: () => void;
  isLoading: boolean;
}

export const CreateUserTab = ({ 
  newUser, 
  setNewUser, 
  onCreateUser, 
  isLoading 
}: CreateUserTabProps) => {
  return (
    <Card className="medical-hero-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Create New User Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-md space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={newUser.firstName}
                onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={newUser.lastName}
                onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
              placeholder="john.doe@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Secure password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={newUser.phone}
              onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+27 XX XXX XXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">User Role *</Label>
            <Select value={newUser.role} onValueChange={(value: 'patient' | 'doctor' | 'admin') => setNewUser(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select user role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="doctor">Doctor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={onCreateUser}
            className="w-full btn-medical-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Creating User...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Create User Account
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};