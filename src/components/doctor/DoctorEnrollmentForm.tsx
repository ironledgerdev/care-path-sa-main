import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Upload, FileText } from 'lucide-react';

export const DoctorEnrollmentForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    practice_name: '',
    speciality: '',
    qualification: '',
    license_number: '',
    years_experience: '',
    consultation_fee: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    bio: '',
  });
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [applicant, setApplicant] = useState({ first_name: '', last_name: '', email: '' });

  const specialties = [
    'General Practitioner',
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Pediatrician',
    'Psychiatrist',
    'Orthopedic Surgeon',
    'Gynecologist',
    'Urologist',
    'Radiologist',
    'Anesthesiologist',
    'Emergency Medicine',
    'Family Medicine',
    'Internal Medicine',
    'Other'
  ];

  const southAfricanProvinces = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    try {
      // 1) Primary path: invoke via supabase-js
      const { data, error } = await supabase.functions.invoke('submit-doctor-enrollment', {
        body: {
          form: formData,
          applicant: user ? undefined : applicant
        }
      });

      let success = Boolean(data?.success && !error);
      let finalError: any = error;

      // 2) Fallback: direct fetch to functions endpoint (handles rare transport errors)
      if (!success) {
        try {
          const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = await import('@/integrations/supabase/client');
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData.session?.access_token;

          const host = new URL(SUPABASE_URL).hostname; // e.g. irvwoushpskgonjwwmap.supabase.co
          const projectRef = host.split('.')[0];
          const fnUrl = `https://${projectRef}.functions.supabase.co/submit-doctor-enrollment`;

          const resp = await fetch(fnUrl, {
            method: 'POST',
            mode: 'cors',
            credentials: 'omit',
            headers: {
              'Content-Type': 'application/json',
              'apikey': SUPABASE_PUBLISHABLE_KEY,
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ form: formData, applicant: user ? undefined : applicant })
          });

          if (resp.ok) {
            const json = await resp.json();
            success = Boolean(json?.success);
          } else {
            const text = await resp.text().catch(() => '');
            finalError = new Error(`Edge Function HTTP ${resp.status}${text ? `: ${text}` : ''}`);
          }
        } catch (fallbackErr: any) {
          finalError = fallbackErr;
        }
      }

      if (!success) {
        // 3) Last resort for logged-in users: write directly to pending_doctors
        if (user) {
          const { error: insertError } = await supabase
            .from('doctors')
            .insert({
              user_id: user.id,
              practice_name: formData.practice_name,
              speciality: formData.speciality,
              qualification: formData.qualification,
              license_number: formData.license_number,
              years_experience: parseInt(formData.years_experience || '0'),
              consultation_fee: Math.round(parseFloat(formData.consultation_fee || '0') * 100),
              address: formData.address,
              city: formData.city,
              province: formData.province,
              postal_code: formData.postal_code,
              bio: formData.bio,
              is_available: false,
              approved_at: null,
              approved_by: null,
            });
          if (insertError) throw insertError;

          toast({
            title: 'Application Submitted',
            description: "Your application has been submitted for review. We'll contact you within 2-3 business days.",
          });
        } else {
          const msg = (finalError && (finalError.message || String(finalError))) || 'Edge Function unavailable';
          throw new Error(msg.includes('Failed to fetch') ? 'Network/CORS issue calling Edge Function. Please sign in and try again, or retry later.' : msg);
        }
      } else {
        toast({
          title: 'Application Submitted',
          description: user
            ? "Your application has been submitted for review. We'll contact you within 2-3 business days."
            : "Account invitation sent. Please verify your email; after admin approval you can access the Doctor Portal.",
        });
      }

      // Reset form
      setFormData({
        practice_name: '',
        speciality: '',
        qualification: '',
        license_number: '',
        years_experience: '',
        consultation_fee: '',
        address: '',
        city: '',
        province: '',
        postal_code: '',
        bio: '',
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-medical-gradient mb-4">
              Join Our Healthcare Network
            </h1>
            <p className="text-xl text-muted-foreground">
              Apply to become a verified healthcare provider on IronLedgerMedMap
            </p>
          </div>

          <Card className="medical-hero-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <FileText className="h-6 w-6" />
                Healthcare Provider Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!user && (
                <div className="mb-4 p-4 rounded-lg bg-accent/50 border border-primary/20 text-sm space-y-3">
                  <p className="text-foreground">Create your provider account and submit in one step:</p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div>
                      <Label>First name *</Label>
                      <Input value={applicant.first_name} onChange={(e) => setApplicant({ ...applicant, first_name: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Last name *</Label>
                      <Input value={applicant.last_name} onChange={(e) => setApplicant({ ...applicant, last_name: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input type="email" value={applicant.email} onChange={(e) => setApplicant({ ...applicant, email: e.target.value })} required />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">We’ll send a verification link. After admin approval, you can log into the Doctor Portal.</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Practice Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="practice_name">Practice Name *</Label>
                    <Input
                      id="practice_name"
                      value={formData.practice_name}
                      onChange={(e) => handleInputChange('practice_name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="speciality">Specialty *</Label>
                    <select
                      id="speciality"
                      value={formData.speciality}
                      onChange={(e) => handleInputChange('speciality', e.target.value)}
                      required
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Select your specialty</option>
                      {specialties.map((specialty) => (
                        <option key={specialty} value={specialty}>{specialty}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Qualifications */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification *</Label>
                    <Input
                      id="qualification"
                      placeholder="e.g., MBChB, MD, DO"
                      value={formData.qualification}
                      onChange={(e) => handleInputChange('qualification', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license_number">HPCSA License Number *</Label>
                    <Input
                      id="license_number"
                      value={formData.license_number}
                      onChange={(e) => handleInputChange('license_number', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Experience & Fees */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="years_experience">Years of Experience</Label>
                    <Input
                      id="years_experience"
                      type="number"
                      min="0"
                      value={formData.years_experience}
                      onChange={(e) => handleInputChange('years_experience', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultation_fee">Consultation Fee (ZAR) *</Label>
                    <Input
                      id="consultation_fee"
                      type="number"
                      min="0"
                      placeholder="e.g., 500"
                      value={formData.consultation_fee}
                      onChange={(e) => handleInputChange('consultation_fee', e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Practice Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province">Province *</Label>
                      <select
                        id="province"
                        value={formData.province}
                        onChange={(e) => handleInputChange('province', e.target.value)}
                        required
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="" disabled>Select province</option>
                        {southAfricanProvinces.map((province) => (
                          <option key={province} value={province}>{province}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postal_code">Postal Code *</Label>
                      <Input
                        id="postal_code"
                        value={formData.postal_code}
                        onChange={(e) => handleInputChange('postal_code', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell patients about your experience, approach to healthcare, and what makes you unique..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                  />
                </div>

                {/* Requirements Notice */}
                <div className="bg-accent/50 p-4 rounded-lg border-l-4 border-primary">
                  <h4 className="font-semibold text-primary mb-2">Required Documents</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Valid HPCSA registration certificate</li>
                    <li>• Professional indemnity insurance certificate</li>
                    <li>• Qualification certificates</li>
                    <li>• Practice registration documents</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">
                    Our team will contact you via email to request these documents after application submission.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full btn-medical-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
