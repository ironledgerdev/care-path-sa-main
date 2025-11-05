-- First, let's drop all existing admin policies and recreate them properly
-- This will fix the infinite recursion issue

-- Drop all existing admin policies
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all pending doctors" ON public.pending_doctors;
DROP POLICY IF EXISTS "Admins can view all pending doctors" ON public.pending_doctors;
DROP POLICY IF EXISTS "Admins can manage all doctors" ON public.doctors;
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
DROP POLICY IF EXISTS "Admins can manage all memberships" ON public.memberships;
DROP POLICY IF EXISTS "Admins can view all memberships" ON public.memberships;
DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can manage all schedules" ON public.doctor_schedules;

-- Create a security definer function to check if a user is an admin
-- This function bypasses RLS policies to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = user_id
      AND profiles.role = 'admin'::user_role
  )
$$;

-- Now recreate all admin policies using the security definer function
-- This prevents infinite recursion

-- Profiles table admin policy
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Pending doctors admin policy
CREATE POLICY "Admins can manage all pending doctors"
ON public.pending_doctors
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Doctors admin policy
CREATE POLICY "Admins can manage all doctors"
ON public.doctors
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Bookings admin policy
CREATE POLICY "Admins can manage all bookings"
ON public.bookings
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Memberships admin policy
CREATE POLICY "Admins can manage all memberships"
ON public.memberships
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- System settings admin policy
CREATE POLICY "Admins can manage system settings"
ON public.system_settings
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Doctor schedules admin policy
CREATE POLICY "Admins can manage all schedules"
ON public.doctor_schedules
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));