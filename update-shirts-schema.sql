-- Update shirts table to support t-shirt designs
-- Run this in your Supabase SQL Editor

-- First, let's update the shirts table to include the new fields we need
ALTER TABLE shirts 
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS designs JSONB DEFAULT '{"front": [], "back": []}',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived'));

-- Ensure price column exists and has proper constraints
-- The price column should already exist from the original schema, but let's make sure it has proper defaults
ALTER TABLE shirts 
ALTER COLUMN price SET DEFAULT 19.99;

-- Update the existing title column to be called label (to match our form)
-- We'll keep title for backward compatibility but add label
ALTER TABLE shirts 
ADD COLUMN IF NOT EXISTS label TEXT;

-- Drop existing function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS save_tshirt_design;

-- Create a function to handle file uploads and design storage
-- This will be used to convert File objects to URLs
CREATE OR REPLACE FUNCTION save_tshirt_design(
  p_user_id UUID,
  p_label TEXT,
  p_description TEXT,
  p_price DECIMAL(10,2),
  p_color TEXT,
  p_designs JSONB
)
RETURNS UUID AS $$
DECLARE
  shirt_id UUID;
BEGIN
  -- Insert the new t-shirt
  INSERT INTO shirts (user_id, label, title, description, price, color, designs, status)
  VALUES (p_user_id, p_label, p_label, p_description, p_price, p_color, p_designs, 'draft')
  RETURNING id INTO shirt_id;
  
  RETURN shirt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION save_tshirt_design TO authenticated;
