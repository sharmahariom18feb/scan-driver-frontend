-- Supabase database schema for ScanDriver

-- 1. Create users table (extends auth.users)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  username text unique, -- Added unique username for custom identifier login
  email text, -- Storing email for quick lookup
  first_name text not null,
  last_name text not null,
  phone text not null,
  license_no text not null,
  current_area text not null,
  rating numeric(3,2) default 5.00 not null check (rating >= 1.00 and rating <= 5.00),
  verified boolean default false not null,
  is_online boolean default false not null,
  role text not null check (role in ('ADMIN', 'DRIVER', 'CUSTOMER')) default 'DRIVER',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for users
alter table public.users enable row level security;

-- Helper function to check if current user is ADMIN (security definer to prevent RLS recursion)
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.users
    where id = auth.uid() and role = 'ADMIN'
  );
end;
$$ language plpgsql security definer;

-- Policies for users
create policy "Drivers can view their own profile." on public.users
  for select using (auth.uid() = id);

create policy "Drivers can update their own profile." on public.users
  for update using (auth.uid() = id);

create policy "Admins can view all profiles." on public.users
  for select using (public.is_admin());

create policy "Admins can update all profiles." on public.users
  for update using (public.is_admin());

-- 2. Create bookings table
create table if not exists public.bookings (
  id text primary key, -- e.g. SD-2841
  customer_name text not null,
  phone text not null,
  pickup text not null,
  drop text not null,
  date_time text not null,
  duration text not null,
  distance text not null,
  fare numeric not null,
  vehicle text not null,
  special_instructions text,
  status text not null check (status in ('available', 'accepted', 'passed', 'completed')) default 'available',
  type text not null check (type in ('HOURLY', 'WEEKLY', 'MONTHLY', 'OUTSTATION', 'CORPORATE', 'AIRPORT DROP', 'EVENT')),
  driver_id uuid references public.users(id) on delete set null,
  admin_approved boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for bookings
alter table public.bookings enable row level security;

-- Policies for bookings
create policy "Anyone authenticated can view bookings." on public.bookings
  for select using (auth.role() = 'authenticated');

create policy "Drivers can update bookings assigned to them or available ones." on public.bookings
  for update using (
    auth.role() = 'authenticated' and 
    (driver_id is null or driver_id = auth.uid())
  );

create policy "Admins can insert bookings." on public.bookings
  for insert with check (public.is_admin());

create policy "Anyone can insert booking requests." on public.bookings
  for insert with check (admin_approved = false);

create policy "Admins can update all bookings." on public.bookings
  for update using (public.is_admin());

-- 3. Create notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid references public.users(id) on delete cascade not null,
  title text not null,
  description text not null,
  time text not null,
  type text not null check (type in ('booking', 'system', 'rating', 'payout')),
  read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for notifications
alter table public.notifications enable row level security;

-- Policies for notifications
create policy "Drivers can view their own notifications." on public.notifications
  for select using (auth.uid() = driver_id);

create policy "Drivers can update their own notifications." on public.notifications
  for update using (auth.uid() = driver_id);

create policy "Drivers can insert their own notifications." on public.notifications
  for insert with check (auth.uid() = driver_id);

create policy "Admins can insert notifications for any driver." on public.notifications
  for insert with check (public.is_admin());

-- 4. Create trigger to automatically insert a profile row on auth user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, username, email, first_name, last_name, phone, license_no, current_area, rating, verified, is_online, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'license_no', ''),
    coalesce(new.raw_user_meta_data->>'current_area', ''),
    5.00,
    false,
    false,
    coalesce(new.raw_user_meta_data->>'role', 'DRIVER')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger if exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Helper function to resolve email by username (security definer to bypass RLS)
create or replace function public.get_email_by_username(p_username text)
returns text as $$
declare
  v_email text;
begin
  select email into v_email from public.users where username = p_username;
  return v_email;
end;
$$ language plpgsql security definer;
