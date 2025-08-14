-- Update the handle_new_user function to extract language preference from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    role, 
    profile_completion_percentage, 
    language_preference,
    first_name,
    last_name,
    phone,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id, 
    'user', 
    0, 
    COALESCE(NEW.raw_user_meta_data ->> 'preferred_language', 'en'),
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name', 
    NEW.raw_user_meta_data ->> 'phone_number',
    now(), 
    now()
  );
  RETURN NEW;
END;
$$;