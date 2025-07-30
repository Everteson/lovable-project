-- Check and update user role to admin
UPDATE profiles 
SET role = 'admin' 
WHERE user_id = 'be2711d5-15ac-474b-bcb9-162faccb67f5';

-- If profile doesn't exist, insert it
INSERT INTO profiles (user_id, email, display_name, role)
VALUES ('be2711d5-15ac-474b-bcb9-162faccb67f5', 'everteson@hotmail.com', 'everteson', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Fix storage policies to use proper admin check
DROP POLICY IF EXISTS "Admins can manage portfolio storage" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage profile storage" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage backgrounds" ON storage.objects;

-- Create a function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate storage policies using the function
CREATE POLICY "Admins can manage portfolio storage" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'portfolio' AND public.is_admin());

CREATE POLICY "Admins can manage profile storage" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'profiles' AND public.is_admin());

CREATE POLICY "Admins can manage backgrounds" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'backgrounds' AND public.is_admin());