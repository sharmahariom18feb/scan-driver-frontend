-- Supabase database schema for ScanDriver

-- 1. Create users table (extends auth.users)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  username text unique, -- Added unique username for custom identifier login
  email text, -- Storing email for quick lookup
  full_name text not null,
  phone text not null,
  license_no text not null,
  current_area text not null,
  current_address text,
  rating numeric(3,2) default 5.00 not null check (rating >= 1.00 and rating <= 5.00),
  verified boolean default false not null,
  is_online boolean default false not null,
  role text not null check (role in ('ADMIN', 'DRIVER', 'CUSTOMER')) default 'DRIVER',
  is_suspended boolean default false not null,
  unique_id text unique,
  managed_by text,
  type text default 'FREE' check (type in ('FREE', 'PREMIUM')),
  amount numeric(10,2) default 0.00,
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
  trip_status text default 'not_started',
  payment_type text check (payment_type in ('CASH', 'QR')),
  invoice_id text,
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
  for insert with check (true);

create policy "Admins can update all bookings." on public.bookings
  for update using (public.is_admin());

create policy "Admins can delete bookings." on public.bookings
  for delete using (public.is_admin());

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

-- 3b. Create driver_fcm_tokens table
create table if not exists public.driver_fcm_tokens (
  driver_id uuid references public.users(id) on delete cascade,
  fcm_token text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for driver_fcm_tokens
alter table public.driver_fcm_tokens enable row level security;

-- Policies for driver_fcm_tokens
create policy "Drivers can view their own FCM tokens." on public.driver_fcm_tokens
  for select using (auth.uid() = driver_id);

create policy "Drivers can insert/upsert their own FCM tokens." on public.driver_fcm_tokens
  for insert with check (auth.uid() = driver_id);

create policy "Drivers can update FCM tokens to associate with themselves." on public.driver_fcm_tokens
  for update using (true) with check (auth.uid() = driver_id);

create policy "Drivers can delete their own FCM tokens." on public.driver_fcm_tokens
  for delete using (auth.uid() = driver_id);

create policy "Admins can view all FCM tokens." on public.driver_fcm_tokens
  for select using (public.is_admin());

create policy "Admins can delete any FCM tokens." on public.driver_fcm_tokens
  for delete using (public.is_admin());

-- 3c. Create sequence for unique IDs
create sequence if not exists public.unique_id_global_seq start with 2000;

-- 4. Create trigger to automatically insert a profile row on auth user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role text;
  v_unique_id text;
  v_num bigint;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'DRIVER');
  v_num := nextval('public.unique_id_global_seq');
  
  if v_role = 'DRIVER' then
    v_unique_id := 'SD' || v_num::text;
  elsif v_role = 'ADMIN' then
    v_unique_id := 'SA' || v_num::text;
  else
    v_unique_id := 'SU' || v_num::text;
  end if;

  insert into public.users (id, username, email, full_name, phone, license_no, current_area, current_address, rating, verified, is_online, role, unique_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', trim(coalesce(new.raw_user_meta_data->>'first_name', '') || ' ' || coalesce(new.raw_user_meta_data->>'last_name', '')), ''),
    coalesce(new.raw_user_meta_data->>'phone', new.phone, ''),
    coalesce(new.raw_user_meta_data->>'license_no', ''),
    coalesce(new.raw_user_meta_data->>'current_area', ''),
    coalesce(new.raw_user_meta_data->>'current_address', ''),
    5.00,
    false,
    false,
    v_role,
    v_unique_id
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
  -- Match by username
  select email into v_email from public.users where username = p_username;
  
  -- Fallback to match by phone number (last 10 digits)
  if v_email is null then
    select email into v_email from public.users 
    where right(regexp_replace(phone, '\D', '', 'g'), 10) = right(regexp_replace(p_username, '\D', '', 'g'), 10);
  end if;
  
  return v_email;
end;
$$ language plpgsql security definer;

-- 6. Create passed_bookings table to track driver pass choices
create table if not exists public.passed_bookings (
  driver_id uuid references public.users(id) on delete cascade,
  booking_id text references public.bookings(id) on delete cascade,
  primary key (driver_id, booking_id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for passed_bookings
alter table public.passed_bookings enable row level security;

-- Policies for passed_bookings
create policy "Drivers can view their own passed bookings." on public.passed_bookings
  for select using (auth.uid() = driver_id);

create policy "Drivers can insert their own passed bookings." on public.passed_bookings
  for insert with check (auth.uid() = driver_id);

create policy "Admins can view all passed bookings." on public.passed_bookings
  for select using (public.is_admin());

-- 7. Safe Booking Acceptance RPC function with FOR UPDATE locking
create or replace function public.accept_booking_safe(p_booking_id text, p_driver_id uuid)
returns json as $$
declare
  v_booking public.bookings%rowtype;
  v_driver_type text;
begin
  -- 0. Check driver subscription type
  select type into v_driver_type from public.users where id = p_driver_id;
  if coalesce(v_driver_type, 'FREE') = 'FREE' then
    return json_build_object('success', false, 'message', 'Please take subscription plan to accept the booking');
  end if;

  -- 1. Select the row for update to lock it
  select * into v_booking
  from public.bookings
  where id = p_booking_id
  for update;

  -- 2. Check if booking exists
  if v_booking.id is null then
    return json_build_object('success', false, 'message', 'Booking not found');
  end if;

  -- 3. Check if booking is still available
  if v_booking.status != 'available' then
    if v_booking.driver_id = p_driver_id then
      return json_build_object('success', true, 'booking', to_jsonb(v_booking));
    else
      return json_build_object('success', false, 'message', 'Booking has already been accepted by another driver');
    end if;
  end if;

  -- 4. Check if admin approved it
  if not v_booking.admin_approved then
    return json_build_object('success', false, 'message', 'Booking is not approved by admin yet');
  end if;

  -- 5. Perform the update
  update public.bookings
  set status = 'accepted',
      driver_id = p_driver_id
  where id = p_booking_id
  returning * into v_booking;

  -- 6. Insert notification for the driver
  insert into public.notifications (driver_id, title, description, time, type, read)
  values (
    p_driver_id,
    'Booking Accepted',
    'You accepted trip ' || p_booking_id || ' to ' || v_booking.drop || '. Drive safely!',
    'Just now',
    'booking',
    false
  );

  return json_build_object('success', true, 'booking', to_jsonb(v_booking));
end;
$$ language plpgsql security definer;

-- 8. Helper function to check if user exists by phone and role (security definer to bypass RLS for OTP pre-check)
drop function if exists public.check_user_exists_by_phone(text);
drop function if exists public.check_user_exists_by_phone(text, text);

create or replace function public.check_user_exists_by_phone(p_phone text, p_role text)
returns boolean as $$
begin
  return exists (
    select 1 from public.users
    where right(regexp_replace(phone, '\D', '', 'g'), 10) = right(regexp_replace(p_phone, '\D', '', 'g'), 10)
      and role = p_role
  );
end;
$$ language plpgsql security definer;

-- 9. Reset driver password directly in auth.users (security definer to bypass schema restrictions, restricted to ADMIN caller only)
create or replace function public.reset_driver_password_sql(p_driver_id uuid, p_new_password text)
returns boolean as $$
declare
  v_caller_role text;
begin
  -- Check if caller is ADMIN
  select role into v_caller_role from public.users where id = auth.uid();
  if v_caller_role != 'ADMIN' or v_caller_role is null then
    raise exception 'Unauthorized: Only admins can reset passwords.';
  end if;

  -- Update the password
  update auth.users
  set encrypted_password = crypt(p_new_password, gen_salt('bf', 10))
  where id = p_driver_id;

  return true;
end;
$$ language plpgsql security definer;

-- 10. Helper function to check if email or phone exists in public.users (security definer to bypass RLS)
create or replace function public.check_user_exists_by_email_or_phone(p_email text, p_phone text)
returns table (email_exists boolean, phone_exists boolean) as $$
begin
  return query
  select 
    case 
      when p_email is not null and p_email != '' and p_email like '%@%' then exists(select 1 from public.users where email = p_email)
      else false
    end as email_exists,
    exists(select 1 from public.users where right(regexp_replace(phone, '\D', '', 'g'), 10) = right(regexp_replace(p_phone, '\D', '', 'g'), 10)) as phone_exists;
end;
$$ language plpgsql security definer;

-- 11. Delete driver directly from auth.users (security definer to bypass schema restrictions, restricted to ADMIN caller only)
create or replace function public.delete_driver_sql(p_driver_id uuid)
returns boolean as $$
declare
  v_caller_role text;
begin
  -- Check if caller is ADMIN
  select role into v_caller_role from public.users where id = auth.uid();
  if v_caller_role != 'ADMIN' or v_caller_role is null then
    raise exception 'Unauthorized: Only admins can delete drivers.';
  end if;

  -- Delete from auth.users
  delete from auth.users
  where id = p_driver_id;

  return true;
end;
$$ language plpgsql security definer;

-- 12. Create driver_profiles table to store advanced onboarding characteristics
create table if not exists public.driver_profiles (
  id uuid references public.users(id) on delete cascade primary key,
  experience text not null,
  license_status text not null,
  documents_available text[] not null default '{}',
  availability text not null,
  service_preference text[] not null default '{}',
  vehicle_specialties text[] not null default '{}',
  previous_platforms text,
  additional_comments text,
  current_address text,
  managed_by text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for driver_profiles
alter table public.driver_profiles enable row level security;

-- Policies for driver_profiles
create policy "Allow select for owner or admin" on public.driver_profiles
  for select using (auth.uid() = id or (select role from public.users where id = auth.uid()) = 'ADMIN');

create policy "Allow insert for owner" on public.driver_profiles
  for insert with check (true);

create policy "Allow update for owner" on public.driver_profiles
  for update using (auth.uid() = id);

-- 13. Create auto-confirm trigger to bypass phone/email validation in auth.users
create or replace function public.auto_confirm_user()
returns trigger as $$
begin
  new.phone_confirmed_at = coalesce(new.phone_confirmed_at, now());
  new.email_confirmed_at = coalesce(new.email_confirmed_at, now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created_auto_confirm on auth.users;
create trigger on_auth_user_created_auto_confirm
  before insert on auth.users
  for each row execute function public.auto_confirm_user();

-- 14. Create customer_enquiries table for customer support & quotes
create table if not exists public.customer_enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text,
  status text not null check (status in ('pending', 'in_progress', 'completed')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.customer_enquiries enable row level security;

-- Policies
create policy "Anyone can submit an enquiry." on public.customer_enquiries
  for insert with check (true);

create policy "Admins can view enquiries." on public.customer_enquiries
  for select using (public.is_admin());

create policy "Admins can update enquiries." on public.customer_enquiries
  for update using (public.is_admin());

create policy "Admins can delete enquiries." on public.customer_enquiries
  for delete using (public.is_admin());

-- 15. Create system_settings table for admin configurations
create table if not exists public.system_settings (
  key text primary key,
  value text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.system_settings enable row level security;

-- Policies for system_settings
create policy "Anyone can view system settings." on public.system_settings
  for select using (true);

create policy "Admins can insert system settings." on public.system_settings
  for insert with check (public.is_admin());

create policy "Admins can update system settings." on public.system_settings
  for update using (public.is_admin());

-- Seed initial auto approval setting if not present
insert into public.system_settings (key, value)
values ('auto_approval_enabled', 'false')
on conflict (key) do nothing;

-- 16. Add current_address column to users and driver_profiles tables
alter table public.users add column if not exists current_address text;
alter table public.driver_profiles add column if not exists current_address text;

-- Update handle_new_user trigger function to populate current_address from raw_user_meta_data
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role text;
  v_unique_id text;
  v_num bigint;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'DRIVER');
  v_num := nextval('public.unique_id_global_seq');
  
  if v_role = 'DRIVER' then
    v_unique_id := 'SD' || v_num::text;
  elsif v_role = 'ADMIN' then
    v_unique_id := 'SA' || v_num::text;
  else
    v_unique_id := 'SU' || v_num::text;
  end if;

  insert into public.users (id, username, email, full_name, phone, license_no, current_area, current_address, rating, verified, is_online, role, unique_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', trim(coalesce(new.raw_user_meta_data->>'first_name', '') || ' ' || coalesce(new.raw_user_meta_data->>'last_name', '')), ''),
    coalesce(new.raw_user_meta_data->>'phone', new.phone, ''),
    coalesce(new.raw_user_meta_data->>'license_no', ''),
    coalesce(new.raw_user_meta_data->>'current_area', ''),
    coalesce(new.raw_user_meta_data->>'current_address', ''),
    5.00,
    false,
    false,
    v_role,
    v_unique_id
  );
  return new;
end;
$$ language plpgsql security definer;

-- 11. Create booking_applications table for monthly booking multi-driver applications
create table if not exists public.booking_applications (
  id uuid primary key default gen_random_uuid(),
  booking_id text references public.bookings(id) on delete cascade not null,
  driver_id uuid references public.users(id) on delete cascade not null,
  status text not null check (status in ('pending', 'accepted', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (booking_id, driver_id)
);

create index if not exists idx_booking_applications_booking_id on public.booking_applications(booking_id);
create index if not exists idx_booking_applications_driver_id on public.booking_applications(driver_id);

alter table public.booking_applications enable row level security;

create policy "Anyone authenticated can view booking applications." on public.booking_applications
  for select using (auth.role() = 'authenticated');

create policy "Drivers can insert their own booking applications." on public.booking_applications
  for insert with check (auth.uid() = driver_id);

create policy "Admins can insert booking applications." on public.booking_applications
  for insert with check (public.is_admin());

create policy "Admins can update booking applications." on public.booking_applications
  for update using (public.is_admin());

create policy "Admins can delete booking applications." on public.booking_applications
  for delete using (public.is_admin());

-- Add driving_license_back_url to driver_documents table (replaces pan_card_url)
alter table if exists public.driver_documents add column if not exists driving_license_back_url text;

-- Add amount number field to users table
alter table if exists public.users add column if not exists amount numeric(10,2) default 0.00;

-- 12. Create booking_status_logs table and tracking trigger
create table if not exists public.booking_status_logs (
  id uuid primary key default gen_random_uuid(),
  booking_id text references public.bookings(id) on delete cascade not null,
  driver_id uuid references public.users(id) on delete set null,
  status text not null,
  trip_status text not null,
  changed_by uuid references public.users(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_booking_status_logs_booking_id on public.booking_status_logs(booking_id, created_at asc);
create index if not exists idx_booking_status_logs_driver_id on public.booking_status_logs(driver_id);
create index if not exists idx_booking_status_logs_trip_status on public.booking_status_logs(trip_status);

alter table public.booking_status_logs enable row level security;

create policy "Anyone authenticated can view booking status logs." on public.booking_status_logs
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can insert booking status logs." on public.booking_status_logs
  for insert with check (auth.role() = 'authenticated');

create policy "Admins can update booking status logs." on public.booking_status_logs
  for update using (public.is_admin());

create policy "Admins can delete booking status logs." on public.booking_status_logs
  for delete using (public.is_admin());

create or replace function public.log_booking_status_change()
returns trigger as $$
declare
  v_user_id uuid;
  v_effective_trip_status text;
begin
  begin
    v_user_id := auth.uid();
  exception when others then
    v_user_id := null;
  end;

  if (tg_op = 'INSERT') then
    if (new.status in ('accepted', 'completed') or (new.trip_status is not null and new.trip_status <> 'not_started')) then
      v_effective_trip_status := case 
        when new.trip_status is not null and new.trip_status <> 'not_started' then new.trip_status
        else new.status
      end;

      insert into public.booking_status_logs (
        booking_id,
        driver_id,
        status,
        trip_status,
        changed_by,
        metadata,
        created_at,
        timestamp
      ) values (
        new.id,
        new.driver_id,
        new.status,
        v_effective_trip_status,
        coalesce(v_user_id, new.driver_id),
        jsonb_build_object(
          'action', 'initial_booking',
          'source', 'insert',
          'payment_type', new.payment_type,
          'invoice_id', new.invoice_id
        ),
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
      );
    end if;

  elsif (tg_op = 'UPDATE') then
    if (old.status is distinct from new.status or 
        old.trip_status is distinct from new.trip_status or 
        (old.driver_id is distinct from new.driver_id and new.status in ('accepted', 'completed'))) then
      
      if (old.status is distinct from new.status and new.status = 'accepted' and (new.trip_status is null or new.trip_status = 'not_started')) then
        v_effective_trip_status := 'accepted';
      else
        v_effective_trip_status := coalesce(new.trip_status, new.status);
      end if;

      insert into public.booking_status_logs (
        booking_id,
        driver_id,
        status,
        trip_status,
        changed_by,
        metadata,
        created_at,
        timestamp
      ) values (
        new.id,
        new.driver_id,
        new.status,
        v_effective_trip_status,
        coalesce(v_user_id, new.driver_id),
        jsonb_build_object(
          'old_status', old.status,
          'old_trip_status', old.trip_status,
          'old_driver_id', old.driver_id,
          'payment_type', new.payment_type,
          'invoice_id', new.invoice_id,
          'source', 'update'
        ),
        timezone('utc'::text, now()),
        timezone('utc'::text, now())
      );
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger trg_log_booking_status_change
  after insert or update on public.bookings
  for each row
  execute function public.log_booking_status_change();



