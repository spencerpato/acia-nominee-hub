-- Update the increment_vote_on_payment_success function to use votes_expected
CREATE OR REPLACE FUNCTION public.increment_vote_on_payment_success()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only increment vote if status changed TO 'success' and was NOT already 'success'
  IF NEW.payment_status = 'success' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'success') THEN
    UPDATE public.creators
    SET vote_count = vote_count + COALESCE(NEW.votes_expected, 1)
    WHERE id = NEW.creator_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- Ensure trigger exists on payments table
DROP TRIGGER IF EXISTS trigger_increment_vote_on_payment ON public.payments;
CREATE TRIGGER trigger_increment_vote_on_payment
  AFTER UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_vote_on_payment_success();