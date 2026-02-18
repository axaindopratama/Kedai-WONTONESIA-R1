-- Migration: Add automatic user profile creation trigger
-- This migration adds a trigger to automatically create user records in the 'users' table
-- when new users sign up via Google OAuth.

-- Drop trigger if it exists (to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop function if exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (uid, name, email, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN NEW.email = 'kedaiwontonesia@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a user profile in the users table when a new auth user is created. Assigns admin role to kedaiwontonesia@gmail.com, user role to others.';

COMMIT;