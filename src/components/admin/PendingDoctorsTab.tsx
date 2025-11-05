import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

interface PendingDoctor {
  id: string;
  user_id: string;
  practice_name: string;
  speciality: string;
  qualification: string;
  license_number: string;
  years_experience: number;
  consultation_fee: number;
  address: string;
  city: string;
  province: string;
  postal_code: string;
  bio: string;
  status: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface PendingDoctorsTabProps {
  pendingDoctors: PendingDoctor[];
  onApprove: (doctorId: string) => void;
  onReject: (doctorId: string) => void;
  onView: (doctor: PendingDoctor) => void;
  isLoading: boolean;
}

export const PendingDoctorsTab = ({ 
  pendingDoctors, 
  onApprove, 
  onReject, 
  onView, 
  isLoading 
}: PendingDoctorsTabProps) => {
  return (
    <Card className="medical-hero-card">
      <CardHeader>
        <CardTitle>Pending Doctor Applications</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingDoctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No pending applications</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Practice</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>License</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingDoctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">
                    {doctor.profiles.first_name} {doctor.profiles.last_name}
                  </TableCell>
                  <TableCell>{doctor.profiles.email}</TableCell>
                  <TableCell>{doctor.practice_name}</TableCell>
                  <TableCell>{doctor.speciality}</TableCell>
                  <TableCell>{doctor.license_number}</TableCell>
                  <TableCell>{doctor.years_experience} years</TableCell>
                  <TableCell>R{(doctor.consultation_fee / 100).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {doctor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onView(doctor)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onApprove(doctor.id)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onReject(doctor.id)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};