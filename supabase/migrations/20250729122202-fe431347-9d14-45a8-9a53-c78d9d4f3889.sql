-- Create storage buckets for profile pictures and portfolio images
INSERT INTO storage.buckets (id, name, public) VALUES ('profiles', 'profiles', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true);

-- Create storage policies for profile pictures
CREATE POLICY "Profile images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profiles');

CREATE POLICY "Users can upload their own profile" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own profile" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own profile" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profiles' AND auth.role() = 'authenticated');

-- Create storage policies for portfolio images
CREATE POLICY "Portfolio images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'portfolio');

CREATE POLICY "Admins can upload portfolio images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'portfolio' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can update portfolio images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'portfolio' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can delete portfolio images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'portfolio' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));

-- Add profile picture URL to profiles table
ALTER TABLE profiles ADD COLUMN avatar_url TEXT;

-- Add payment and progress status to commissions table
ALTER TABLE commissions ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', '50_paid', '100_paid'));
ALTER TABLE commissions ADD COLUMN progress_status TEXT DEFAULT 'in_queue' CHECK (progress_status IN ('in_queue', 'waiting_payment', 'in_progress', 'completed'));

-- Insert default site settings for terms, pricing, and work hours
INSERT INTO site_settings (key, value, description) VALUES 
('terms_of_service', 'Termos de Serviço padrão aqui...', 'Termos de Serviço do site'),
('pricing_info', '[{"service": "Ilustração Digital", "price": "R$ 150,00", "description": "Arte digital personalizada"}]', 'Informações de preços dos serviços'),
('work_hours', '{"monday": "09:00-17:00", "tuesday": "09:00-17:00", "wednesday": "09:00-17:00", "thursday": "09:00-17:00", "friday": "09:00-17:00", "saturday": "Fechado", "sunday": "Fechado"}', 'Horário de funcionamento')
ON CONFLICT (key) DO NOTHING;