-- Fix infinite recursion in profiles RLS policies by creating a security definer function

-- First, create a security definer function to check if a user is an admin
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

-- Drop the existing problematic admin policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a new admin policy using the security definer function
-- This prevents infinite recursion by using a function that bypasses RLS
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Also update other tables that might have similar issues
-- Update pending_doctors admin policy
DROP POLICY IF EXISTS "Admins can view all pending doctors" ON public.pending_doctors;
CREATE POLICY "Admins can manage all pending doctors"
ON public.pending_doctors
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Update doctors admin policy
DROP POLICY IF EXISTS "Admins can manage all doctors" ON public.doctors;
CREATE POLICY "Admins can manage all doctors"
ON public.doctors
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Update bookings admin policy
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
CREATE POLICY "Admins can manage all bookings"
ON public.bookings
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Update memberships admin policy
DROP POLICY IF EXISTS "Admins can view all memberships" ON public.memberships;
CREATE POLICY "Admins can manage all memberships"
ON public.memberships
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Update system_settings admin policy
DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
CREATE POLICY "Admins can manage system settings"
ON public.system_settings
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Update doctor_schedules admin policy
DROP POLICY IF EXISTS "Admins can manage all schedules" ON public.doctor_schedules;
CREATE POLICY "Admins can manage all schedules"
ON public.doctor_schedules
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));