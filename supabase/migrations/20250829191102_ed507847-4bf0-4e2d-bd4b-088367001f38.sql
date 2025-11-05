-- Fix security warnings: Set search_path for functions to prevent search path attacks

-- Drop and recreate the handle_new_user function with proper security settings
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'patient');
  
  INSERT INTO public.memberships (user_id, membership_type)
  VALUES (NEW.id, 'basic');
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Drop and recreate the update_updated_at_column function with proper security settings
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Recreate all the update triggers
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pending_doctors_updated_at 
    BEFORE UPDATE ON public.pending_doctors 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at 
    BEFORE UPDATE ON public.doctors 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctor_schedules_updated_at 
    BEFORE UPDATE ON public.doctor_schedules 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at 
    BEFORE UPDATE ON public.memberships 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at 
    BEFORE UPDATE ON public.bookings 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security for all new tables
ALTER TABLE public.pending_doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

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

CREATE POLICY "Users can update their own membership" ON public.memberships
    FOR UPDATE USING (auth.uid() = user_id);

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