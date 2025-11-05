-- Clean up duplicate and conflicting policies on pending_doctors table
DROP POLICY IF EXISTS "Doctors can insert their own application" ON public.pending_doctors;
DROP POLICY IF EXISTS "Doctors can view their own pending application" ON public.pending_doctors;
DROP POLICY IF EXISTS "Doctors can update their pending application" ON public.pending_doctors;

-- Keep only the correctly configured policies for authenticated users
-- The "Users can insert their own pending doctor record" and "Users can view their own pending doctor record" policies I created earlier are correct

-- Recreate the update policy with correct role
CREATE POLICY "Users can update their own pending doctor record" 
ON public.pending_doctors 
FOR UPDATE 
TO authenticated 
USING ((auth.uid() = user_id) AND (status = 'pending'::doctor_status));