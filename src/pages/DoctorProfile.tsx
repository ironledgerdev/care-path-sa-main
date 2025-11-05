import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  Shield, 
  Stethoscope, 
  Award, 
  GraduationCap,
  Phone,
  Mail,
  User,
  MessageCircle,
  Heart,
  ArrowLeft,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

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
    email: string | null;
    phone: string | null;
  } | null;
}

interface DoctorSchedule {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const DoctorProfile = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [schedule, setSchedule] = useState<DoctorSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (doctorId) {
      fetchDoctorProfile();
      fetchDoctorSchedule();
    }
  }, [doctorId]);

  const fetchDoctorProfile = async () => {
    try {
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', doctorId)
        .single();

      if (doctorError) throw doctorError;

      let enriched: any = doctorData;
      if (doctorData?.user_id) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, phone')
            .eq('id', doctorData.user_id)
            .single();
          enriched = { ...doctorData, profiles: profileData || null };
        } catch (_) {
          enriched = { ...doctorData, profiles: null };
        }
      }

      setDoctor(enriched as any);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load doctor profile',
        variant: 'destructive',
      });
      navigate('/search');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDoctorSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('doctor_schedules')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('day_of_week');

      if (error) throw error;
      setSchedule(data || []);
    } catch (error: any) {
      console.error('Failed to fetch schedule:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount / 100);
  };

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleBookAppointment = () => {
    navigate(`/book/${doctorId}`);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
      description: isBookmarked 
        ? "Doctor removed from your bookmarks" 
        : "Doctor added to your bookmarks",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">Loading doctor profile...</h2>
            <p className="text-muted-foreground">Please wait while we fetch the information</p>
          </div>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Doctor not found</h2>
            <p className="text-muted-foreground mb-6">The doctor profile you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/search')} className="btn-medical-primary">
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)} 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Doctor Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="medical-hero-card sticky top-4">
              <CardContent className="p-6">
                {/* Profile Header */}
                <div className="text-center mb-6">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage 
                      src={doctor.profile_image_url || ''} 
                      alt={`Dr. ${doctor.profiles?.first_name} ${doctor.profiles?.last_name}`}
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-primary-soft text-white">
                      {doctor.profiles?.first_name?.[0]}{doctor.profiles?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">
                      Dr. {doctor.profiles?.first_name} {doctor.profiles?.last_name}
                    </h1>
                    <Shield className="h-5 w-5 text-success" />
                  </div>
                  
                  <p className="text-primary font-semibold text-lg mb-1">{doctor.speciality}</p>
                  <p className="text-muted-foreground">{doctor.practice_name}</p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold text-lg">{doctor.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <div className="font-bold text-lg text-primary mb-1">{doctor.total_bookings}</div>
                    <p className="text-xs text-muted-foreground">Consultations</p>
                  </div>
                </div>

                {/* Key Information */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{doctor.years_experience} years experience</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{doctor.city}, {doctor.province}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-primary">
                      {formatCurrency(doctor.consultation_fee)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={handleBookAppointment}
                    className="w-full btn-medical-primary h-12"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Appointment
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handleBookmark}
                      className={`btn-medical-secondary ${isBookmarked ? 'bg-red-50 border-red-200' : ''}`}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-red-500 text-red-500' : ''}`} />
                      {isBookmarked ? 'Saved' : 'Save'}
                    </Button>
                    <Button variant="outline" className="btn-medical-secondary">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </div>

                {/* Availability Status */}
                <div className="mt-6 p-3 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">Available Today</span>
                  </div>
                  <p className="text-xs text-green-600">Next available: Tomorrow 9:00 AM</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-6">
                {/* Bio */}
                <Card className="medical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      About Dr. {doctor.profiles?.first_name} {doctor.profiles?.last_name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {doctor.bio || "No biography available for this doctor."}
                    </p>
                  </CardContent>
                </Card>

                {/* Qualifications & License */}
                <Card className="medical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="h-5 w-5" />
                      Qualifications & Credentials
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        Medical Qualifications
                      </h4>
                      <p className="text-muted-foreground">{doctor.qualification}</p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-success" />
                        License Information
                      </h4>
                      <p className="text-muted-foreground">License #: {doctor.license_number}</p>
                      <Badge variant="secondary" className="mt-2">
                        Verified & Active
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Practice Information */}
                <Card className="medical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5" />
                      Practice Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-1">Practice Name</h4>
                        <p className="text-muted-foreground">{doctor.practice_name}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Specialty</h4>
                        <Badge variant="outline">{doctor.speciality}</Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Experience</h4>
                        <p className="text-muted-foreground">{doctor.years_experience} years</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Consultation Fee</h4>
                        <p className="text-primary font-semibold">{formatCurrency(doctor.consultation_fee)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="space-y-6">
                <Card className="medical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Weekly Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {schedule.length > 0 ? (
                      <div className="space-y-3">
                        {schedule.map((slot) => (
                          <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3">
                              <div className="font-medium">{daysOfWeek[slot.day_of_week]}</div>
                              {slot.is_available ? (
                                <Badge variant="secondary">Available</Badge>
                              ) : (
                                <Badge variant="outline">Unavailable</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {slot.is_available 
                                ? `${formatTime(slot.start_time)} - ${formatTime(slot.end_time)}`
                                : 'Closed'
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">Schedule information not available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6">
                <Card className="medical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Patient Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">Reviews feature coming soon</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Current rating: {doctor.rating.toFixed(1)}/5 based on {doctor.total_bookings} consultations
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contact Tab */}
              <TabsContent value="contact" className="space-y-6">
                <Card className="medical-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Practice Address
                          </h4>
                          <p className="text-muted-foreground leading-relaxed">
                            {doctor.address}<br />
                            {doctor.city}, {doctor.province}<br />
                            {doctor.postal_code}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {doctor.profiles?.phone && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Phone
                            </h4>
                            <p className="text-muted-foreground">{doctor.profiles.phone}</p>
                          </div>
                        )}
                        
                        {doctor.profiles?.email && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              Email
                            </h4>
                            <p className="text-muted-foreground">{doctor.profiles.email}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator className="my-6" />

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-4">
                        Ready to schedule your consultation?
                      </p>
                      <Button 
                        onClick={handleBookAppointment}
                        className="btn-medical-primary"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Appointment Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
