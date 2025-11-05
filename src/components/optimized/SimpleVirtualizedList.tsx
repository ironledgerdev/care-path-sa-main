import React, { memo, useMemo, useCallback } from 'react';
import OptimizedDoctorCard from './OptimizedDoctorCard';
import { Card, CardContent } from '@/components/ui/card';
import { Stethoscope } from 'lucide-react';

interface Doctor {
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
  rating: number;
  total_bookings: number;
  is_available: boolean;
  profile_image_url: string | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface SimpleVirtualizedListProps {
  doctors: Doctor[];
  onBookDoctor?: (doctorId: string) => void;
  onViewProfile?: (doctorId: string) => void;
}

const SimpleVirtualizedList = memo(({ 
  doctors, 
  onBookDoctor, 
  onViewProfile 
}: SimpleVirtualizedListProps) => {
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount / 100);
  }, []);

  // Simple chunked rendering for better performance
  const visibleDoctors = useMemo(() => {
    // Show first 20 doctors, implement pagination if needed
    return doctors.slice(0, 20);
  }, [doctors]);

  if (doctors.length === 0) {
    return (
      <Card className="medical-card">
        <CardContent className="p-12 text-center">
          <Stethoscope className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-xl font-bold mb-2">No doctors found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {visibleDoctors.map((doctor) => {
        const doctorCardData = {
          id: doctor.id,
          name: `${doctor.profiles?.first_name || ''} ${doctor.profiles?.last_name || ''}`.trim(),
          specialty: doctor.speciality,
          location: doctor.city,
          province: doctor.province,
          rating: doctor.rating,
          reviews: doctor.total_bookings,
          price: formatCurrency(doctor.consultation_fee),
          availability: 'Available Today',
          verified: true,
          languages: ['English', 'Afrikaans'], // Default languages
          experience: `${doctor.years_experience} years`
        };

        return (
          <OptimizedDoctorCard
            key={doctor.id}
            doctor={doctorCardData}
            onBookClick={onBookDoctor}
            onViewProfile={onViewProfile}
          />
        );
      })}
      
      {doctors.length > 20 && (
        <Card className="medical-card">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Showing 20 of {doctors.length} doctors. Use filters to narrow your search.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

SimpleVirtualizedList.displayName = 'SimpleVirtualizedList';

export default SimpleVirtualizedList;