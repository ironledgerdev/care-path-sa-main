-- Migration: Add accepted_insurances column to doctors

BEGIN;

ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS accepted_insurances TEXT[] DEFAULT ARRAY[]::text[];

COMMIT;
