-- Fix RLS policy for pending_doctors to allow users to insert their own records
DROP POLICY IF EXISTS "Users can insert their own pending doctor record" ON public.pending_doctors;

CREATE POLICY "Users can insert their own pending doctor record" 
ON public.pending_doctors 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Also ensure users can read their own pending doctor records
DROP POLICY IF EXISTS "Users can view their own pending doctor record" ON public.pending_doctors;

CREATE POLICY "Users can view their own pending doctor record" 
ON public.pending_doctors 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);