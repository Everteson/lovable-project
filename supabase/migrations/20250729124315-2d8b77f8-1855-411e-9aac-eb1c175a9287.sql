-- Fix RLS policies for storage buckets
CREATE POLICY "Admins can manage portfolio storage" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'portfolio' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can manage profile storage" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'profiles' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Add background images bucket for site backgrounds
INSERT INTO storage.buckets (id, name, public) VALUES ('backgrounds', 'backgrounds', true);

CREATE POLICY "Everyone can view backgrounds" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'backgrounds');

CREATE POLICY "Admins can manage backgrounds" 
ON storage.objects 
FOR ALL 
USING (
  bucket_id = 'backgrounds' AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);