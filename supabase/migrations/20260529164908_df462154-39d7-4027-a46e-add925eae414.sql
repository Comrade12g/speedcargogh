CREATE OR REPLACE FUNCTION public.validate_quote_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF length(NEW.origin) > 200 OR length(NEW.destination) > 200 OR length(NEW.mode) > 40
     OR length(NEW.contact_name) > 200 OR length(NEW.email) > 320
     OR (NEW.phone IS NOT NULL AND length(NEW.phone) > 60)
     OR (NEW.company IS NOT NULL AND length(NEW.company) > 200)
     OR (NEW.goods IS NOT NULL AND length(NEW.goods) > 2000)
     OR (NEW.notes IS NOT NULL AND length(NEW.notes) > 2000)
  THEN
    RAISE EXCEPTION 'Field length exceeds allowed limit';
  END IF;

  IF NEW.email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Invalid email';
  END IF;

  NEW.status := 'new';
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_quote_request_trg
BEFORE INSERT ON public.quote_requests
FOR EACH ROW EXECUTE FUNCTION public.validate_quote_request();