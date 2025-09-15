-- Add phone number field to addresses table
-- Run this in your Supabase SQL Editor

-- Add phone number to addresses table
ALTER TABLE addresses 
ADD COLUMN IF NOT EXISTS phone TEXT;
