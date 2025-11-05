-- Security improvements and database optimizations (fixed version)

-- 1. Add proper indexing for search performance (without gin_trgm_ops)
CREATE INDEX IF NOT EXISTS idx_doctors_practice_name ON public.doctors (practice_name);
CREATE INDEX IF NOT EXISTS idx_doctors_location ON public.doctors (province, city);
CREATE INDEX IF NOT EXISTS idx_doctors_speciality ON public.doctors (speciality);
CREATE INDEX IF NOT EXISTS idx_doctors_consultation_fee ON public.doctors (consultation_fee);
CREATE INDEX IF NOT EXISTS idx_doctors_available ON public.doctors (is_available) WHERE is_available = true;

-- 2. Add booking search indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_date ON public.bookings (user_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_doctor_date ON public.bookings (doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);

-- 3. Add profiles search index
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- 4. Add proper constraints and validation
-- Add constraint to ensure appointments are in the future (allow same day)
ALTER TABLE public.bookings 
ADD CONSTRAINT IF NOT EXISTS check_appointment_date_future 
CHECK (appointment_date >= CURRENT_DATE);

-- 5. Add proper membership validation
ALTER TABLE public.memberships 
ADD CONSTRAINT IF NOT EXISTS check_membership_type 
CHECK (membership_type IN ('basic', 'premium'));

-- 6. Add email verification status tracking (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 7. Update handle_new_user function to handle role and email verification properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, role, email_verified, first_name, last_name, phone)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')::user_role,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE SET
    email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, false),
    first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', profiles.first_name),
    last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', profiles.last_name),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', profiles.phone);
  
  INSERT INTO public.memberships (user_id, membership_type)
  VALUES (NEW.id, 'basic')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;