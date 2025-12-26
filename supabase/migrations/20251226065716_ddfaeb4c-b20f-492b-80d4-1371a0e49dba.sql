-- Create payments table for tracking Lipana M-Pesa payments
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES public.creators(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 10,
  checkout_id TEXT,
  reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'success', 'failed', 'cancelled')),
  lipana_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_payments_checkout_id ON public.payments(checkout_id);
CREATE INDEX idx_payments_creator_id ON public.payments(creator_id);
CREATE INDEX idx_payments_status ON public.payments(payment_status);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments are publicly insertable (for initiating payments)
CREATE POLICY "Payments are publicly insertable"
ON public.payments
FOR INSERT
WITH CHECK (true);

-- Payments are publicly readable (for polling status)
CREATE POLICY "Payments are publicly readable"
ON public.payments
FOR SELECT
USING (true);

-- Only service role can update payments (for webhook)
CREATE POLICY "Service role can update payments"
ON public.payments
FOR UPDATE
USING (true);

-- Admins can manage all payments
CREATE POLICY "Admins can manage payments"
ON public.payments
FOR ALL
USING (has_role(auth.uid(), 'superadmin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to increment vote count only on successful payment
CREATE OR REPLACE FUNCTION public.increment_vote_on_payment_success()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment vote if status changed TO 'success' and was NOT already 'success'
  IF NEW.payment_status = 'success' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'success') THEN
    UPDATE public.creators
    SET vote_count = vote_count + 1
    WHERE id = NEW.creator_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to call the function on payment update
CREATE TRIGGER trigger_increment_vote_on_payment
AFTER UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.increment_vote_on_payment_success();