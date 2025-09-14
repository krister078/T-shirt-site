-- Add preview image fields to shirts table
-- Run this in your Supabase SQL Editor

ALTER TABLE shirts 
ADD COLUMN IF NOT EXISTS preview_front_url TEXT,
ADD COLUMN IF NOT EXISTS preview_back_url TEXT;

-- Update the save_tshirt_design function to include preview URLs
DROP FUNCTION IF EXISTS save_tshirt_design;

CREATE OR REPLACE FUNCTION save_tshirt_design(
  p_user_id UUID,
  p_label TEXT,
  p_description TEXT,
  p_price DECIMAL(10,2),
  p_color TEXT,
  p_designs JSONB,
  p_preview_front_url TEXT DEFAULT NULL,
  p_preview_back_url TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  shirt_id UUID;
BEGIN
  -- Insert the new t-shirt with preview images
  INSERT INTO shirts (
    user_id, 
    label, 
    title, 
    description, 
    price, 
    color, 
    designs, 
    status,
    preview_front_url,
    preview_back_url
  )
  VALUES (
    p_user_id, 
    p_label, 
    p_label, 
    p_description, 
    p_price, 
    p_color, 
    p_designs, 
    'draft',
    p_preview_front_url,
    p_preview_back_url
  )
  RETURNING id INTO shirt_id;
  
  RETURN shirt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION save_tshirt_design TO authenticated;
