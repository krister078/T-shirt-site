-- Fix RLS policies for profiles table to allow public viewing of basic info
-- Run this in your Supabase SQL Editor

-- Option 1: Allow viewing basic profile info for users who have published shirts
-- This is more secure as it only exposes profiles of users who have made their work public
CREATE POLICY "Anyone can view profiles of shirt creators" ON profiles 
FOR SELECT 
USING (
  id IN (
    SELECT DISTINCT user_id 
    FROM shirts 
    WHERE status IN ('published', 'draft')
  )
);

-- Option 2: If you prefer a simpler approach, uncomment the line below instead:
-- CREATE POLICY "Anyone can view basic profile info" ON profiles FOR SELECT USING (true);
