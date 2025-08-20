-- Fix OAuth avatar handling by updating the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url, provider, provider_id)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    COALESCE(
      NEW.raw_user_meta_data ->> 'picture',      -- Google
      NEW.raw_user_meta_data ->> 'avatar_url',   -- GitHub
      NULL
    ),
    COALESCE(NEW.app_metadata ->> 'provider', 'email'),
    NEW.raw_user_meta_data ->> 'provider_id'
  );
  RETURN NEW;
END;
$$;
