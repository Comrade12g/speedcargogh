ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'staff';

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role::text IN ('admin','staff'))
$$;

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.containers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text NOT NULL UNIQUE,
  vessel text, voyage text,
  etd date, eta date, atd date, ata date,
  status text NOT NULL DEFAULT 'loading',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE SEQUENCE public.shipment_seq START 1001;
CREATE TABLE public.shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id text NOT NULL UNIQUE DEFAULT ('SPC-' || nextval('public.shipment_seq')::text),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  container_id uuid REFERENCES public.containers(id) ON DELETE SET NULL,
  platform_tracking_no text,
  description text,
  weight_kg numeric, volume_cbm numeric, pieces integer,
  sender_name text, sender_phone text, sender_address text,
  stage text NOT NULL DEFAULT 'intake' CHECK (stage IN ('intake','received_yiwu','loaded','sailed','arrived_tema','cleared','ready_pickup','out_for_delivery','delivered')),
  delivery_address text, driver text, delivered_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.shipment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  stage text NOT NULL,
  note text,
  photo_path text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL UNIQUE REFERENCES public.shipments(id) ON DELETE CASCADE,
  freight_fee numeric NOT NULL DEFAULT 0,
  clearing_fee numeric NOT NULL DEFAULT 0,
  delivery_fee numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'GHS',
  paid boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.notification_templates (
  stage text PRIMARY KEY,
  body text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES public.shipments(id) ON DELETE CASCADE,
  stage text NOT NULL,
  phone text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  provider_message_id text,
  error text,
  attempts integer NOT NULL DEFAULT 0,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers, public.containers, public.shipments, public.shipment_events, public.invoices, public.notification_templates, public.notifications TO authenticated;
GRANT ALL ON public.customers, public.containers, public.shipments, public.shipment_events, public.invoices, public.notification_templates, public.notifications TO service_role;
GRANT USAGE ON SEQUENCE public.shipment_seq TO authenticated, service_role;

DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['customers','containers','shipments','shipment_events','invoices','notification_templates','notifications'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "Staff manage %s" ON public.%I FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()))', t, t);
  END LOOP;
  FOREACH t IN ARRAY ARRAY['customers','containers','shipments','invoices','notifications'] LOOP
    EXECUTE format('CREATE TRIGGER touch_%s BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t, t);
  END LOOP;
END $$;

-- Auto invoice + first event at intake
CREATE OR REPLACE FUNCTION public.shipment_after_insert() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.invoices (shipment_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.shipment_events (shipment_id, stage, created_by) VALUES (NEW.id, NEW.stage, NEW.created_by);
  PERFORM public.enqueue_notification(NEW.id, NEW.stage);
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.enqueue_notification(_shipment uuid, _stage text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s record; tpl record; msg text;
BEGIN
  SELECT sh.*, c.name AS cname, c.phone AS cphone, ct.number AS cnum, ct.eta AS ceta
    INTO s FROM public.shipments sh JOIN public.customers c ON c.id = sh.customer_id
    LEFT JOIN public.containers ct ON ct.id = sh.container_id WHERE sh.id = _shipment;
  SELECT * INTO tpl FROM public.notification_templates WHERE stage = _stage AND enabled;
  IF s IS NULL OR tpl IS NULL OR coalesce(s.cphone,'') = '' THEN RETURN; END IF;
  msg := replace(replace(replace(replace(tpl.body, '{name}', coalesce(s.cname,'')), '{tracking_id}', s.tracking_id), '{container}', coalesce(s.cnum,'')), '{eta}', coalesce(s.ceta::text,''));
  INSERT INTO public.notifications (shipment_id, stage, phone, body) VALUES (_shipment, _stage, s.cphone, msg);
END $$;

CREATE TRIGGER shipment_after_insert AFTER INSERT ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.shipment_after_insert();

CREATE OR REPLACE FUNCTION public.shipment_stage_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.stage IS DISTINCT FROM OLD.stage THEN
    INSERT INTO public.shipment_events (shipment_id, stage, created_by) VALUES (NEW.id, NEW.stage, auth.uid());
    PERFORM public.enqueue_notification(NEW.id, NEW.stage);
    IF NEW.stage = 'delivered' AND NEW.delivered_at IS NULL THEN NEW.delivered_at := now(); END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER shipment_stage_change BEFORE UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.shipment_stage_change();

REVOKE EXECUTE ON FUNCTION public.enqueue_notification(uuid, text) FROM PUBLIC, anon;

INSERT INTO public.notification_templates (stage, body) VALUES
('intake','Hello {name}, Speed Cargo has registered your shipment. Tracking ID: {tracking_id}. Track at speedcargogh.com/tracking'),
('received_yiwu','Hello {name}, your goods ({tracking_id}) have arrived at our China warehouse.'),
('loaded','Hello {name}, your goods ({tracking_id}) are loaded into container {container}.'),
('sailed','Hello {name}, container {container} with your goods ({tracking_id}) has sailed. ETA Tema: {eta}.'),
('arrived_tema','Hello {name}, your goods ({tracking_id}) have arrived at Tema port and are going through clearing.'),
('cleared','Hello {name}, your goods ({tracking_id}) have cleared customs.'),
('ready_pickup','Hello {name}, your goods ({tracking_id}) are ready for pickup at our Derby Avenue office, Accra.'),
('out_for_delivery','Hello {name}, your goods ({tracking_id}) are out for delivery.'),
('delivered','Hello {name}, your goods ({tracking_id}) have been delivered. Thank you for choosing Speed Cargo!');