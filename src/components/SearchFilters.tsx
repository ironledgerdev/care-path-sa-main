import React, { useState } from 'react';
import { Search, MapPin, Stethoscope, DollarSign, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface SearchFiltersProps {
  onSearch?: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export interface SearchFilters {
  searchTerm: string;
  location: string;
  specialty: string;
  priceRange: string;
  zipCode: string;
}

const SearchFilters = ({ onSearch, initialFilters }: SearchFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm || '');
  const [location, setLocation] = useState(initialFilters?.location || '');
  const [specialty, setSpecialty] = useState(initialFilters?.specialty || '');
  const [priceRange, setPriceRange] = useState(initialFilters?.priceRange || '');
  const [zipCode, setZipCode] = useState(initialFilters?.zipCode || '');
  const navigate = useNavigate();

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
    'Gynecologist'
  ];

  const priceRanges = [
    'R100 - R300',
    'R300 - R500',
    'R500 - R800',
    'R800 - R1200',
    'R1200+'
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

  const handleSearch = () => {
    const filters: SearchFilters = {
      searchTerm,
      location,
      specialty,
      priceRange,
      zipCode
    };

    // If onSearch prop is provided, call it (for embedded use)
    if (onSearch) {
      onSearch(filters);
    } else {
      // Navigate to search page with filters as URL params
      const searchParams = new URLSearchParams();
      if (searchTerm) searchParams.set('search', searchTerm);
      if (location) searchParams.set('location', location);
      if (specialty) searchParams.set('specialty', specialty);
      if (priceRange) searchParams.set('price', priceRange);
      if (zipCode) searchParams.set('zip', zipCode);
      
      navigate(`/search?${searchParams.toString()}`);
    }
  };

  const handleQuickFilter = (filter: string) => {
    const filters: SearchFilters = {
      searchTerm: filter,
      location: '',
      specialty: '',
      priceRange: '',
      zipCode: ''
    };

    if (onSearch) {
      onSearch(filters);
    } else {
      navigate(`/search?search=${encodeURIComponent(filter)}`);
    }
  };

  return (
    <Card className="medical-search w-full mx-auto">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Doctor/Clinic Name Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Doctor or clinic name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-background/50 border-primary/20 focus:border-primary"
            />
          </div>

          {/* Location Filter */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="pl-10 h-12 bg-background/50 border-primary/20 focus:border-primary">
                <SelectValue placeholder="Select province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province.toLowerCase()}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Specialty Filter */}
          <div className="relative">
            <Stethoscope className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger className="pl-10 h-12 bg-background/50 border-primary/20 focus:border-primary">
                <SelectValue placeholder="Medical specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((spec) => (
                  <SelectItem key={spec} value={spec.toLowerCase()}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range Filter */}
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="pl-10 h-12 bg-background/50 border-primary/20 focus:border-primary">
                <SelectValue placeholder="Price range" />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range} value={range.toLowerCase()}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Zip Code and Search Button Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Zip code (optional)"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              className="h-12 bg-background/50 border-primary/20 focus:border-primary"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              className="btn-medical-secondary flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
            
            <Button
              size="lg" 
              className="btn-medical-primary flex items-center gap-2 px-8"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" />
              Find Doctors
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="mt-4 pt-4 border-t border-primary/20">
          <p className="text-sm text-muted-foreground mb-3">Popular searches:</p>
          <div className="flex flex-wrap gap-2">
            {['Emergency Care', 'Same Day Booking', 'Telemedicine', 'Pediatric Care', 'Women\'s Health'].map((filter) => (
              <Button
                key={filter}
                variant="outline"
                size="sm"
                className="text-xs border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => handleQuickFilter(filter)}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
