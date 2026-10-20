-- Rename column license_no to remarks in public.users
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'license_no'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'remarks'
  ) THEN
    ALTER TABLE public.users RENAME COLUMN license_no TO remarks;
  END IF;
END $$;

ALTER TABLE public.users ALTER COLUMN remarks SET DEFAULT '';
ALTER TABLE public.users ALTER COLUMN remarks DROP NOT NULL;

-- Update handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_role text;
  v_unique_id text;
  v_num bigint;
BEGIN
  v_role := coalesce(new.raw_user_meta_data->>'role', 'DRIVER');
  v_num := nextval('public.unique_id_global_seq');
  
  IF v_role = 'DRIVER' THEN
    v_unique_id := 'SD' || v_num::text;
  ELSIF v_role = 'ADMIN' THEN
    v_unique_id := 'SA' || v_num::text;
  ELSE
    v_unique_id := 'SU' || v_num::text;
  END IF;

  INSERT INTO public.users (
    id,
    username,
    email,
    full_name,
    phone,
    remarks,
    current_area,
    current_address,
    rating,
    verified,
    is_online,
    role,
    unique_id
  ) VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', trim(coalesce(new.raw_user_meta_data->>'first_name', '') || ' ' || coalesce(new.raw_user_meta_data->>'last_name', '')), ''),
    coalesce(new.raw_user_meta_data->>'phone', new.phone, ''),
    coalesce(new.raw_user_meta_data->>'remarks', new.raw_user_meta_data->>'license_no', ''),
    coalesce(new.raw_user_meta_data->>'current_area', ''),
    coalesce(new.raw_user_meta_data->>'current_address', ''),
    5.00,
    false,
    false,
    v_role,
    v_unique_id
  );
  RETURN new;
END;
$function$;
