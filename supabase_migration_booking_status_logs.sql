-- Migration: Create booking_status_logs table and automatic tracking trigger
-- Tracks every driver status transition (accepted, called_customer, customer_confirmed, on_the_way, reached_pickup, started, ended, completed, etc.) with exact timestamps and mapped statuses.

CREATE TABLE IF NOT EXISTS public.booking_status_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  driver_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  status text NOT NULL,
  trip_status text NOT NULL,
  changed_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  timestamp timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_booking_status_logs_booking_id ON public.booking_status_logs(booking_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_booking_status_logs_driver_id ON public.booking_status_logs(driver_id);
CREATE INDEX IF NOT EXISTS idx_booking_status_logs_trip_status ON public.booking_status_logs(trip_status);

-- Enable RLS
ALTER TABLE public.booking_status_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone authenticated can view booking status logs." ON public.booking_status_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert booking status logs." ON public.booking_status_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update booking status logs." ON public.booking_status_logs
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete booking status logs." ON public.booking_status_logs
  FOR DELETE USING (public.is_admin());

-- Trigger function to automatically log any status transition
CREATE OR REPLACE FUNCTION public.log_booking_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_effective_trip_status text;
BEGIN
  BEGIN
    v_user_id := auth.uid();
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  IF (TG_OP = 'INSERT') THEN
    IF (NEW.status IN ('accepted', 'completed') OR (NEW.trip_status IS NOT NULL AND NEW.trip_status <> 'not_started')) THEN
      v_effective_trip_status := CASE 
        WHEN NEW.trip_status IS NOT NULL AND NEW.trip_status <> 'not_started' THEN NEW.trip_status
        ELSE NEW.status
      END;

      INSERT INTO public.booking_status_logs (
        booking_id,
        driver_id,
        status,
        trip_status,
        changed_by,
        metadata,
        created_at,
        timestamp
      ) VALUES (
        NEW.id,
        NEW.driver_id,
        NEW.status,
        v_effective_trip_status,
        COALESCE(v_user_id, NEW.driver_id),
        jsonb_build_object(
          'action', 'initial_booking',
          'source', 'insert',
          'payment_type', NEW.payment_type,
          'invoice_id', NEW.invoice_id
        ),
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
      );
    END IF;

  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.status IS DISTINCT FROM NEW.status OR 
        OLD.trip_status IS DISTINCT FROM NEW.trip_status OR 
        (OLD.driver_id IS DISTINCT FROM NEW.driver_id AND NEW.status IN ('accepted', 'completed'))) THEN
      
      IF (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'accepted' AND (NEW.trip_status IS NULL OR NEW.trip_status = 'not_started')) THEN
        v_effective_trip_status := 'accepted';
      ELSE
        v_effective_trip_status := COALESCE(NEW.trip_status, NEW.status);
      END IF;

      INSERT INTO public.booking_status_logs (
        booking_id,
        driver_id,
        status,
        trip_status,
        changed_by,
        metadata,
        created_at,
        timestamp
      ) VALUES (
        NEW.id,
        NEW.driver_id,
        NEW.status,
        v_effective_trip_status,
        COALESCE(v_user_id, NEW.driver_id),
        jsonb_build_object(
          'old_status', OLD.status,
          'old_trip_status', OLD.trip_status,
          'old_driver_id', OLD.driver_id,
          'payment_type', NEW.payment_type,
          'invoice_id', NEW.invoice_id,
          'source', 'update'
        ),
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to bookings table
CREATE TRIGGER trg_log_booking_status_change
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_booking_status_change();

-- Backfill initial log for existing accepted and completed bookings
INSERT INTO public.booking_status_logs (
  booking_id,
  driver_id,
  status,
  trip_status,
  metadata,
  created_at,
  timestamp
)
SELECT 
  id,
  driver_id,
  status,
  COALESCE(trip_status, status),
  jsonb_build_object('backfilled', true, 'payment_type', payment_type, 'invoice_id', invoice_id),
  created_at,
  created_at
FROM public.bookings
WHERE status IN ('accepted', 'completed')
  AND NOT EXISTS (
    SELECT 1 FROM public.booking_status_logs bsl WHERE bsl.booking_id = public.bookings.id
  );
