-- Migration: Fix booking appointment_date constraint to avoid blocking updates on past bookings

BEGIN;

-- Remove existing constraint if present
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS check_appointment_date_future;

-- Add a revised constraint that only requires appointment_date to be in the future
-- for active bookings (pending or confirmed). Past appointments that are completed
-- or cancelled are allowed to have appointment_date < CURRENT_DATE so status updates
-- and other maintenance operations don't fail.
ALTER TABLE public.bookings
  ADD CONSTRAINT check_appointment_date_future CHECK (
    appointment_date >= CURRENT_DATE
    OR status IN ('completed', 'cancelled')
  );

COMMIT;
