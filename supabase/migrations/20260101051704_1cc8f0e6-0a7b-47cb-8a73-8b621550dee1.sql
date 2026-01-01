-- Add votes_expected column to payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS votes_expected integer DEFAULT 1;