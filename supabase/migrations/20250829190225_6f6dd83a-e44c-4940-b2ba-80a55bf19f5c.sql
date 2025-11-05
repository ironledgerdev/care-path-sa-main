-- First check what already exists
DO $$
DECLARE
    rec RECORD;
BEGIN
    -- Add missing columns to profiles if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        -- Create the enum type if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
            CREATE TYPE public.user_role AS ENUM ('patient', 'doctor', 'admin');
        END IF;
        ALTER TABLE public.profiles ADD COLUMN role public.user_role NOT NULL DEFAULT 'patient';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;
END $$;

-- Create doctor status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'doctor_status') THEN
        CREATE TYPE public.doctor_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_type') THEN
        CREATE TYPE public.membership_type AS ENUM ('basic', 'premium');
    END IF;
END $$;

-- Create pending_doctors table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.pending_doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_name TEXT NOT NULL,
    speciality TEXT NOT NULL,
    qualification TEXT NOT NULL,
    license_number TEXT NOT NULL,
    years_experience INTEGER,
    consultation_fee INTEGER NOT NULL, -- in cents
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    qualification_documents TEXT[], -- URLs to uploaded documents
    status public.doctor_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pending_doctors_license_number_key') THEN
        ALTER TABLE public.pending_doctors ADD CONSTRAINT pending_doctors_license_number_key UNIQUE (license_number);
    END IF;
END $$;

-- Create approved doctors table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    practice_name TEXT NOT NULL,
    speciality TEXT NOT NULL,
    qualification TEXT NOT NULL,
    license_number TEXT NOT NULL,
    years_experience INTEGER,
    consultation_fee INTEGER NOT NULL, -- in cents
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    bio TEXT,
    profile_image_url TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    approved_at TIMESTAMPTZ DEFAULT now(),
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctors_license_number_key') THEN
        ALTER TABLE public.doctors ADD CONSTRAINT doctors_license_number_key UNIQUE (license_number);
    END IF;
END $$;

-- Create other necessary tables
CREATE TABLE IF NOT EXISTS public.doctor_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'doctor_schedules_doctor_day_key') THEN
        ALTER TABLE public.doctor_schedules ADD CONSTRAINT doctor_schedules_doctor_day_key UNIQUE(doctor_id, day_of_week);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    membership_type public.membership_type NOT NULL DEFAULT 'basic',
    free_bookings_remaining INTEGER DEFAULT 0,
    stripe_subscription_id TEXT,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'memberships_user_id_key') THEN
        ALTER TABLE public.memberships ADD CONSTRAINT memberships_user_id_key UNIQUE (user_id);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    consultation_fee INTEGER NOT NULL, -- in cents
    booking_fee INTEGER NOT NULL DEFAULT 1000, -- R10 in cents
    total_amount INTEGER NOT NULL,
    status public.booking_status NOT NULL DEFAULT 'pending',
    patient_notes TEXT,
    doctor_notes TEXT,
    payment_reference TEXT,
    payment_status TEXT DEFAULT 'pending',
    created_by UUID REFERENCES auth.users(id), -- for admin impersonation
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key TEXT NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'system_settings_setting_key_key') THEN
        ALTER TABLE public.system_settings ADD CONSTRAINT system_settings_setting_key_key UNIQUE (setting_key);
    END IF;
END $$;

-- Insert default booking fee if not exists
INSERT INTO public.system_settings (setting_key, setting_value, description) 
VALUES ('default_booking_fee', '1000', 'Default booking fee in cents (R10)')
ON CONFLICT (setting_key) DO NOTHING;