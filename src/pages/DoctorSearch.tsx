import React, { useState, useEffect } from 'react';
import { Search, MapPin, Stethoscope, Filter, Calendar, Clock, Star, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import RealtimeStatusBar from '@/components/RealtimeStatusBar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchFilters, { SearchFilters as SearchFiltersType } from '@/components/SearchFilters';

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

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Initialize filters from URL params
  const initialFilters: SearchFiltersType = {
    searchTerm: searchParams.get('search') || '',
    location: searchParams.get('location') || '',
    specialty: searchParams.get('specialty') || '',
    priceRange: searchParams.get('price') || '',
    zipCode: searchParams.get('zip') || ''
  };

  const specialties = [
    'General Practitioner',
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Orthopedist',
    'Pediatrician',
    'Psychiatrist',
    'Radiologist',
    'Surgeon',
    'Gynecologist',
    'Ophthalmologist',
    'ENT Specialist',
    'Urologist',
    'Endocrinologist'
  ];

  const provinces = [
    'Gauteng',
    'Western Cape',
    'KwaZulu-Natal',
    'Eastern Cape',
    'Free State',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape'
  ];

  const priceRanges = [
    { label: 'R100 - R300', min: 10000, max: 30000 },
    { label: 'R300 - R500', min: 30000, max: 50000 },
    { label: 'R500 - R800', min: 50000, max: 80000 },
    { label: 'R800 - R1200', min: 80000, max: 120000 },
    { label: 'R1200+', min: 120000, max: 999999 }
  ];

  useEffect(() => {
    fetchDoctors();

    // Subscribe to realtime changes in doctors table
    const channel = supabase
      .channel('doctors_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'doctors' },
        () => {
          // Refresh list on any insert/update/delete
          fetchDoctors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, selectedProvince, selectedSpecialty, priceRange]);

  const fetchDoctors = async () => {
    try {
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .order('rating', { ascending: false });

      if (doctorsError) throw doctorsError;

      let enriched = (doctorsData || []) as any[];

      // Try to enrich with profile names (best-effort; tolerate RLS)
      const userIds = enriched.map((d: any) => d.user_id).filter(Boolean);
      if (userIds.length) {
        try {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', userIds);
          if (!profilesError && profilesData) {
            const map = new Map(profilesData.map((p: any) => [p.id, p]));
            enriched = enriched.map((d: any) => ({ ...d, profiles: map.get(d.user_id) || null }));
          }
        } catch (_) {
          // ignore enrichment failures
        }
      }

      setDoctors(enriched as any[]);
    } catch (error: any) {
      const errMsg = (error && (error.message || error.details || error.hint || error.error)) || String(error) || 'Failed to load doctors';
      try {
        console.error('Error fetching doctors:', error);
      } catch (_) {
        console.error('Error fetching doctors (string):', String(error));
      }
      toast({ title: 'Error', description: errMsg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    // Search term filter
    if (searchTerm) {
      filtered = filtered.filter(doctor => 
        doctor.practice_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.profiles?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.profiles?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.speciality.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Province filter
    if (selectedProvince) {
      filtered = filtered.filter(doctor => 
        doctor.province.toLowerCase() === selectedProvince.toLowerCase()
      );
    }

    // Specialty filter  
    if (selectedSpecialty) {
      filtered = filtered.filter(doctor => 
        doctor.speciality.toLowerCase() === selectedSpecialty.toLowerCase()
      );
    }

    // Price range filter
    if (priceRange) {
      const range = priceRanges.find(r => r.label === priceRange);
      if (range) {
        filtered = filtered.filter(doctor => 
          doctor.consultation_fee >= range.min && doctor.consultation_fee <= range.max
        );
      }
    }

    setFilteredDoctors(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount / 100);
  };

  const handleBookAppointment = (doctorId: string) => {
    navigate(`/book/${doctorId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Loading doctors...</h2>
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-medical-gradient mb-2">Find Healthcare Providers</h1>
          <p className="text-muted-foreground mb-4">Search and book appointments with verified medical professionals across South Africa</p>
          <RealtimeStatusBar className="justify-center" />
        </div>

        {/* Search Filters */}
        <Card className="medical-hero-card mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Search Term */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Doctor or practice name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Province */}
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select value={selectedProvince || 'all'} onValueChange={(v) => setSelectedProvince(v === 'all' ? '' : v)}>
                  <SelectTrigger className="pl-10 h-12">
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Provinces</SelectItem>
                    {provinces.map((province) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Specialty */}
              <div className="relative">
                <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select value={selectedSpecialty || 'all'} onValueChange={(v) => setSelectedSpecialty(v === 'all' ? '' : v)}>
                  <SelectTrigger className="pl-10 h-12">
                    <SelectValue placeholder="Medical specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <Select value={priceRange || 'all'} onValueChange={(v) => setPriceRange(v === 'all' ? '' : v)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Price range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedProvince('');
                  setSelectedSpecialty('');
                  setPriceRange('');
                }}
                className="btn-medical-secondary"
              >
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="grid gap-6">
          {filteredDoctors.length === 0 ? (
            <Card className="medical-card">
              <CardContent className="p-12 text-center">
                <Stethoscope className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-bold mb-2">No doctors found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
              </CardContent>
            </Card>
          ) : (
            filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="medical-card hover:scale-[1.02] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    {/* Doctor Avatar */}
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary-soft rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      {doctor.profiles?.first_name?.[0]}{doctor.profiles?.last_name?.[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-foreground">
                              Dr. {doctor.profiles?.first_name} {doctor.profiles?.last_name}
                            </h3>
                            <Shield className="h-5 w-5 text-success" />
                          </div>
                          <p className="text-primary font-semibold">{doctor.speciality}</p>
                          <p className="text-sm text-muted-foreground">{doctor.practice_name}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {formatCurrency(doctor.consultation_fee)}
                          </div>
                          <p className="text-xs text-muted-foreground">per consultation</p>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{doctor.city}, {doctor.province}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{doctor.years_experience} years experience</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{doctor.rating.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">({doctor.total_bookings} bookings)</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            Available Today
                          </Badge>
                        </div>
                      </div>

                      {/* Bio */}
                      {doctor.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {doctor.bio}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Button 
                          className="btn-medical-primary"
                          onClick={() => handleBookAppointment(doctor.id)}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Appointment
                        </Button>
                        <Button 
                          variant="outline" 
                          className="btn-medical-secondary"
                          onClick={() => navigate(`/doctor/${doctor.id}`)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSearch;
