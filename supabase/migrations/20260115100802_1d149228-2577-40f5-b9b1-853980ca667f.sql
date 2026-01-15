-- Add country column to creators table with Kenya as default
ALTER TABLE public.creators ADD COLUMN IF NOT EXISTS country TEXT NOT NULL DEFAULT 'Kenya';

-- Add payment_gateway column to payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_gateway TEXT NOT NULL DEFAULT 'lipana';

-- Add currency column to payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'KES';

-- Add paystack_reference column for Paystack transactions
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS paystack_reference TEXT;