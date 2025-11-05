import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Search, MapPin, Stethoscope, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import RealtimeStatusBar from '@/components/RealtimeStatusBar';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SimpleVirtualizedList from './SimpleVirtualizedList';
import useDebounce from '@/hooks/useDebounce';

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

// Memoized search filters component
const SearchFilters = memo(({ 
  searchTerm, 
  selectedProvince, 
  selectedSpecialty, 
  priceRange, 
  onSearchChange, 
  onProvinceChange, 
  onSpecialtyChange, 
  onPriceRangeChange, 
  onClearFilters,
  resultCount 
}: any) => (
  <Card className="medical-hero-card mb-8">
    <CardContent className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Search Term */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Doctor or practice name"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12"
          />
        </div>

        {/* Province */}
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
          <Select value={selectedProvince} onValueChange={onProvinceChange}>
            <SelectTrigger className="pl-10 h-12">
              <SelectValue placeholder="Select province" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Provinces</SelectItem>
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
          <Select value={selectedSpecialty} onValueChange={onSpecialtyChange}>
            <SelectTrigger className="pl-10 h-12">
              <SelectValue placeholder="Medical specialty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Specialties</SelectItem>
              {specialties.map((specialty) => (
                <SelectItem key={specialty} value={specialty}>
                  {specialty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <Select value={priceRange} onValueChange={onPriceRangeChange}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Price range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Prices</SelectItem>
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
          {resultCount} doctor{resultCount !== 1 ? 's' : ''} found
        </p>
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="btn-medical-secondary"
        >
          <Filter className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </div>
    </CardContent>
  </Card>
));

SearchFilters.displayName = 'SearchFilters';

const OptimizedDoctorSearch = memo(() => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchDoctors();

    const channel = supabase
      .channel('doctors_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'doctors' }, () => {
        fetchDoctors();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initialize filters from URL params
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const specialty = searchParams.get('specialty') || '';
    const price = searchParams.get('price') || '';
    
    setSearchTerm(search);
    setSelectedProvince(location);
    setSelectedSpecialty(specialty);
    setPriceRange(price);
  }, [searchParams]);

  const fetchDoctors = useCallback(async () => {
    try {
      const { data: doctorsData, error: doctorsError } = await supabase
        .from('doctors')
        .select('*')
        .order('rating', { ascending: false });

      if (doctorsError) throw doctorsError;

      let enriched = (doctorsData || []) as any[];
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
        } catch (_) {}
      }

      setDoctors(enriched as any[]);
    } catch (error: any) {
      const errMsg = (error && (error.message || error.details || error.hint || error.error)) || String(error) || 'Failed to load doctors';
      try {
        console.error('Error fetching doctors (optimized):', error);
      } catch (_) {
        console.error('Error fetching doctors (optimized, string):', String(error));
      }
      toast({ title: 'Error', description: errMsg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Memoized filtered doctors with optimized filtering
  const filteredDoctors = useMemo(() => {
    let filtered = doctors;

    // Search term filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(doctor => 
        doctor.practice_name.toLowerCase().includes(searchLower) ||
        doctor.profiles?.first_name?.toLowerCase().includes(searchLower) ||
        doctor.profiles?.last_name?.toLowerCase().includes(searchLower) ||
        doctor.speciality.toLowerCase().includes(searchLower)
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

    return filtered;
  }, [doctors, debouncedSearchTerm, selectedProvince, selectedSpecialty, priceRange]);

  const handleBookAppointment = useCallback((doctorId: string) => {
    navigate(`/book/${doctorId}`);
  }, [navigate]);

  const handleViewProfile = useCallback((doctorId: string) => {
    navigate(`/doctor/${doctorId}`);
  }, [navigate]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedProvince('');
    setSelectedSpecialty('');
    setPriceRange('');
  }, []);

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

        <SearchFilters
          searchTerm={searchTerm}
          selectedProvince={selectedProvince}
          selectedSpecialty={selectedSpecialty}
          priceRange={priceRange}
          onSearchChange={setSearchTerm}
          onProvinceChange={setSelectedProvince}
          onSpecialtyChange={setSelectedSpecialty}
          onPriceRangeChange={setPriceRange}
          onClearFilters={handleClearFilters}
          resultCount={filteredDoctors.length}
        />

        {/* Simple Virtualized Doctor List */}
        <SimpleVirtualizedList
          doctors={filteredDoctors}
          onBookDoctor={handleBookAppointment}
          onViewProfile={handleViewProfile}
        />
      </div>
    </div>
  );
});

OptimizedDoctorSearch.displayName = 'OptimizedDoctorSearch';

export default OptimizedDoctorSearch;
