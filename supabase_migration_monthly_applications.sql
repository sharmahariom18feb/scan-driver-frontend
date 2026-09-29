-- Migration: Monthly Booking Applications
-- Allows drivers to apply for monthly bookings and admins to view all applications and assign one driver.

CREATE TABLE IF NOT EXISTS public.booking_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  driver_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (booking_id, driver_id)
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_booking_applications_booking_id ON public.booking_applications(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_applications_driver_id ON public.booking_applications(driver_id);

-- Enable RLS
ALTER TABLE public.booking_applications ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone authenticated can view booking applications." ON public.booking_applications;
CREATE POLICY "Anyone authenticated can view booking applications." ON public.booking_applications
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Drivers can insert their own booking applications." ON public.booking_applications;
CREATE POLICY "Drivers can insert their own booking applications." ON public.booking_applications
  FOR INSERT WITH CHECK (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Admins can update booking applications." ON public.booking_applications;
CREATE POLICY "Admins can update booking applications." ON public.booking_applications
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete booking applications." ON public.booking_applications;
CREATE POLICY "Admins can delete booking applications." ON public.booking_applications
  FOR DELETE USING (public.is_admin());
