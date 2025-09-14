-- Add size field to profiles table
-- Run this in your Supabase SQL Editor

-- Add size column to profiles table
ALTER TABLE profiles 
ADD COLUMN size TEXT CHECK (size IN ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'));

-- Update the handle_new_user function to include size
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, first_name, last_name, size)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data->>'first_name', 
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'size'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
