-- Fix signup trigger issues
-- Run this in your Supabase SQL Editor to fix the "Invalid login credentials" error during signup

-- First, drop any existing triggers and functions to start clean
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a robust function to handle new user signup with proper error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert into profiles table
  INSERT INTO public.profiles (id, email, first_name, last_name, size)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'size', '')
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    
    -- Try a simpler insert without size if the first one fails
    BEGIN
      INSERT INTO public.profiles (id, email, first_name, last_name)
      VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
      );
    EXCEPTION
      WHEN OTHERS THEN
        -- Even if profile creation fails, don't block user creation
        RAISE LOG 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure the size column exists in profiles table (in case it wasn't added)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'size'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.profiles 
    ADD COLUMN size TEXT CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'));
  END IF;
END $$;

-- Also ensure RLS policies allow the trigger to insert profiles
-- The trigger runs with SECURITY DEFINER so it should work, but let's be sure
DO $$
BEGIN
  -- Check if the service role policy exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Service role can insert profiles'
  ) THEN
    CREATE POLICY "Service role can insert profiles" ON profiles
    FOR INSERT WITH CHECK (true);
  END IF;
END $$;
