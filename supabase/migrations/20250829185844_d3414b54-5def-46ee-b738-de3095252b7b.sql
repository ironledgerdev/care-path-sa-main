-- Create enum types
CREATE TYPE public.user_role AS ENUM ('patient', 'doctor', 'admin');
CREATE TYPE public.doctor_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE public.membership_type AS ENUM ('basic', 'premium');

-- Create profiles table for all users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role public.user_role NOT NULL DEFAULT 'patient',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create doctors table for pending doctors
CREATE TABLE public.pending_doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_name TEXT NOT NULL,
    speciality TEXT NOT NULL,
    qualification TEXT NOT NULL,
    license_number TEXT NOT NULL UNIQUE,
    years_experience INTEGER,
    consultation_fee INTEGER NOT NULL, -- in cents
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    qualification_documents TEXT[], -- URLs to uploaded documents
    status public.doctor_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create approved doctors table
CREATE TABLE public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_name TEXT NOT NULL,
    speciality TEXT NOT NULL,
    qualification TEXT NOT NULL,
    license_number TEXT NOT NULL UNIQUE,
    years_experience INTEGER,
    consultation_fee INTEGER NOT NULL, -- in cents
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    approved_at TIMESTAMPTZ DEFAULT now(),
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create doctor schedules table
CREATE TABLE public.doctor_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(doctor_id, day_of_week)
);

-- Create memberships table
CREATE TABLE public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    membership_type public.membership_type NOT NULL DEFAULT 'basic',
    free_bookings_remaining INTEGER DEFAULT 0,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    consultation_fee INTEGER NOT NULL, -- in cents
    booking_fee INTEGER NOT NULL DEFAULT 1000, -- R10 in cents
    total_amount INTEGER NOT NULL,
    status public.booking_status NOT NULL DEFAULT 'pending',
    patient_notes TEXT,
    doctor_notes TEXT,
    payment_reference TEXT,
    payment_status TEXT DEFAULT 'pending',
    created_by UUID REFERENCES auth.users(id), -- for admin impersonation
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create system settings table for admin
CREATE TABLE public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default booking fee
INSERT INTO public.system_settings (setting_key, setting_value, description) 
VALUES ('default_booking_fee', '1000', 'Default booking fee in cents (R10)');

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for pending_doctors
CREATE POLICY "Doctors can view their own pending application" ON public.pending_doctors
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Doctors can insert their own application" ON public.pending_doctors
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update their pending application" ON public.pending_doctors
    FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can view all pending doctors" ON public.pending_doctors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for doctors
CREATE POLICY "Everyone can view approved doctors" ON public.doctors
    FOR SELECT USING (true);

CREATE POLICY "Doctors can update their own profile" ON public.doctors
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all doctors" ON public.doctors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for doctor_schedules
CREATE POLICY "Everyone can view doctor schedules" ON public.doctor_schedules
    FOR SELECT USING (true);

CREATE POLICY "Doctors can manage their own schedules" ON public.doctor_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.doctors 
            WHERE id = doctor_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all schedules" ON public.doctor_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for memberships
CREATE POLICY "Users can view their own membership" ON public.memberships
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own membership" ON public.memberships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all memberships" ON public.memberships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() = created_by);

CREATE POLICY "Doctors can view bookings for their practice" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.doctors 
            WHERE id = doctor_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Doctors can update bookings for their practice" ON public.bookings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.doctors 
            WHERE id = doctor_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all bookings" ON public.bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create RLS policies for system_settings
CREATE POLICY "Admins can manage system settings" ON public.system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'patient');
  
  INSERT INTO public.memberships (user_id, membership_type)
  VALUES (NEW.id, 'basic');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pending_doctors_updated_at BEFORE UPDATE ON public.pending_doctors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_doctor_schedules_updated_at BEFORE UPDATE ON public.doctor_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();