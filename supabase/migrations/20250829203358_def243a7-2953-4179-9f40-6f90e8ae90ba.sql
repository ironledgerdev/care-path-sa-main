-- Fix security warnings for function search paths

-- Update the is_admin function to have a secure search path
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = user_id
      AND profiles.role = 'admin'::user_role
  )
$$;

-- Update the handle_new_user function to have a secure search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
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

-- Update the update_updated_at_column function to have a secure search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;