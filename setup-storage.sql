-- Setup Supabase Storage buckets for T-shirt files
-- Run this in your Supabase SQL Editor

-- Create bucket for T-shirt design files (user uploads)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tshirt-designs',
  'tshirt-designs',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for T-shirt preview images (generated snapshots)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tshirt-previews',
  'tshirt-previews',
  true,
  2097152, -- 2MB limit
  ARRAY['image/png']
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for tshirt-designs bucket
CREATE POLICY "Users can upload their own design files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tshirt-designs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all design files"
ON storage.objects FOR SELECT
USING (bucket_id = 'tshirt-designs');

CREATE POLICY "Users can update their own design files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tshirt-designs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own design files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tshirt-designs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Set up RLS policies for tshirt-previews bucket
CREATE POLICY "Users can upload their own preview images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'tshirt-previews' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all preview images"
ON storage.objects FOR SELECT
USING (bucket_id = 'tshirt-previews');

CREATE POLICY "Users can update their own preview images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'tshirt-previews' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own preview images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'tshirt-previews' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
