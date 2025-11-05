-- Update the INSERT policy to allow admins to add doctors for any user
DROP POLICY IF EXISTS "Users can insert their own pending doctor record" ON public.pending_doctors;

CREATE POLICY "Users and admins can insert doctor applications" 
ON public.pending_doctors 
FOR INSERT 
TO authenticated 
WITH CHECK (
  (auth.uid() = user_id) OR -- Users can insert their own applications
  is_admin(auth.uid())       -- Admins can insert for any user
);