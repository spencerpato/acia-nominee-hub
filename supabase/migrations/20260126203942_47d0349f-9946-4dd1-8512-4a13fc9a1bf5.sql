-- Create payout_preferences table for storing nominee payout details
CREATE TABLE public.payout_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  payout_method text NOT NULL CHECK (payout_method IN ('mpesa', 'bank_transfer', 'card_payout', 'mailed_check')),
  
  -- M-Pesa fields
  mpesa_name text,
  mpesa_number text,
  
  -- Bank Transfer fields
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  bank_branch text,
  
  -- Card Payout fields
  cardholder_name text,
  card_type text CHECK (card_type IS NULL OR card_type IN ('visa', 'mastercard')),
  card_number text,
  card_expiry text,
  
  -- Mailed Check fields
  mailing_name text,
  mailing_address text,
  city text,
  postal_code text,
  
  -- Common fields
  country text NOT NULL DEFAULT 'Kenya',
  confirmed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payout_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own payout preferences
CREATE POLICY "Users can view their own payout preferences"
ON public.payout_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own payout preferences
CREATE POLICY "Users can insert their own payout preferences"
ON public.payout_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own payout preferences
CREATE POLICY "Users can update their own payout preferences"
ON public.payout_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can view all payout preferences (for verification)
CREATE POLICY "Admins can view all payout preferences"
ON public.payout_preferences
FOR SELECT
USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_payout_preferences_updated_at
BEFORE UPDATE ON public.payout_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();