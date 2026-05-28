/*
  # Create Storage Buckets for Marketplace

  1. Storage Buckets
    - `store-logos` - Public bucket for store logo images
    - `product-images` - Public bucket for product images
    - `custom-request-images` - Public bucket for custom request reference images
    - `avatars` - Public bucket for user profile avatars

  2. Security
    - All buckets are public (images need to be publicly viewable)
    - Upload restricted to authenticated users
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('store-logos', 'store-logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('custom-request-images', 'custom-request-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for store-logos
CREATE POLICY "Authenticated users can upload store logos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'store-logos' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view store logos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'store-logos');

CREATE POLICY "Admin can delete store logos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'store-logos' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Storage policies for product-images
CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin can delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Storage policies for custom-request-images
CREATE POLICY "Authenticated users can upload custom request images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'custom-request-images' AND auth.role() = 'authenticated');

CREATE POLICY "Anyone can view custom request images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'custom-request-images');

-- Storage policies for avatars
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');
