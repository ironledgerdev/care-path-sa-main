-- Fix RLS policies for proper doctor enrollment workflow

-- Drop the problematic UPDATE policy that allows users to modify their applications
DROP POLICY IF EXISTS "Users can update their own pending doctor record" ON public.pending_doctors;

-- Ensure the SELECT policy allows users to view their own applications and admins to view all
DROP POLICY IF EXISTS "Users can view their own pending doctor record" ON public.pending_doctors;

CREATE POLICY "Users can view their own applications, admins can view all" 
ON public.pending_doctors 
FOR SELECT 
TO authenticated 
USING (
  (auth.uid() = user_id) OR -- Users can view their own applications
  is_admin(auth.uid())       -- Admins can view all applications
);

-- Ensure admin management policy covers all operations for admins
DROP POLICY IF EXISTS "Admins can manage all pending doctors" ON public.pending_doctors;

CREATE POLICY "Admins can manage all pending doctors" 
ON public.pending_doctors 
FOR ALL 
TO authenticated 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));