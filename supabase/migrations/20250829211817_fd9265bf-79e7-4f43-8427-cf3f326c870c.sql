-- Security improvements and database optimizations

-- 1. Add proper indexing for search performance
CREATE INDEX IF NOT EXISTS idx_doctors_search_text ON public.doctors USING gin((practice_name || ' ' || speciality) gin_trgm_ops);
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

-- 4. Update user_id columns to be NOT NULL where they should be (for proper RLS)
-- Note: We'll do this carefully to avoid breaking existing data

-- Check if there are any null user_ids in critical tables
-- If found, these would need to be cleaned up before making NOT NULL

-- 5. Add proper constraints and validation
ALTER TABLE public.bookings 
ADD CONSTRAINT check_appointment_date_future 
CHECK (appointment_date >= CURRENT_DATE);

-- 6. Improve RLS policies with better performance
-- Update profiles policy to be more efficient
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- 7. Add proper membership validation
ALTER TABLE public.memberships 
ADD CONSTRAINT check_membership_type 
CHECK (membership_type IN ('basic', 'premium'));

-- 8. Add email verification status tracking (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN email_verified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Update function to set email verification status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, role, email_verified)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')::user_role,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, false);
  
  INSERT INTO public.memberships (user_id, membership_type)
  VALUES (NEW.id, 'basic')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for email verification updates
CREATE OR REPLACE FUNCTION public.handle_user_email_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update profile when email is verified
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.profiles 
    SET email_verified = true 
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_email_verified') THEN
        CREATE TRIGGER on_auth_user_email_verified
            AFTER UPDATE ON auth.users
            FOR EACH ROW 
            EXECUTE FUNCTION public.handle_user_email_verified();
    END IF;
END $$;