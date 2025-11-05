import React, { memo, useCallback } from 'react';
import { MapPin, Clock, Star, Shield, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface DoctorCardProps {
  doctor: {
    id?: string;
    name: string;
    specialty: string;
    location: string;
    province: string;
    rating: number;
    reviews: number;
    price: string;
    availability: string;
    image?: string;
    verified: boolean;
    languages: string[];
    experience: string;
  };
  onBookClick?: (doctorId: string) => void;
  onViewProfile?: (doctorId: string) => void;
}

const OptimizedDoctorCard = memo(({ doctor, onBookClick, onViewProfile }: DoctorCardProps) => {
  const navigate = useNavigate();

  const handleBookNow = useCallback(() => {
    if (onBookClick && doctor.id) {
      onBookClick(doctor.id);
    } else if (doctor.id) {
      navigate(`/book/${doctor.id}`);
    } else {
      navigate('/search');
    }
  }, [doctor.id, onBookClick, navigate]);

  const handleViewProfile = useCallback(() => {
    if (onViewProfile && doctor.id) {
      onViewProfile(doctor.id);
    } else if (doctor.id) {
      navigate(`/doctor/${doctor.id}`);
    } else {
      navigate('/search');
    }
  }, [doctor.id, onViewProfile, navigate]);

  const doctorInitials = React.useMemo(() => {
    return doctor.name.split(' ').map(n => n[0]).join('');
  }, [doctor.name]);

  return (
    <Card className="medical-card hover:scale-[1.02] transition-all duration-300 will-change-transform">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Doctor Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-soft rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {doctorInitials}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-foreground truncate">Dr. {doctor.name}</h3>
                  {doctor.verified && (
                    <Shield className="h-4 w-4 text-success" />
                  )}
                </div>
                <p className="text-primary font-medium text-sm">{doctor.specialty}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-primary">{doctor.price}</div>
                <p className="text-xs text-muted-foreground">per consultation</p>
              </div>
            </div>

            {/* Location & Rating */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{doctor.location}, {doctor.province}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{doctor.rating}</span>
                <span className="text-xs text-muted-foreground">({doctor.reviews})</span>
              </div>
            </div>

            {/* Experience & Availability */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{doctor.experience} experience</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {doctor.availability}
              </Badge>
            </div>

            {/* Languages */}
            <div className="flex flex-wrap gap-1 mb-4">
              {doctor.languages.map((language) => (
                <Badge key={language} variant="outline" className="text-xs">
                  {language}
                </Badge>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button className="btn-medical-primary flex-1" onClick={handleBookNow}>
                <Calendar className="h-4 w-4 mr-2" />
                Book Now
              </Button>
              <Button variant="outline" className="btn-medical-secondary" onClick={handleViewProfile}>
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedDoctorCard.displayName = 'OptimizedDoctorCard';

export default OptimizedDoctorCard;