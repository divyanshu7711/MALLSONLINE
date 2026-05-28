/*
  # Fix Security Issues

  1. Fix Function Search Path Mutable
    - Set explicit `search_path` on `handle_new_user()` to prevent search path injection

  2. Fix Public Bucket Allows Listing
    - Remove broad SELECT policies on all 4 public buckets
    - Public buckets serve files via public URL without needing SELECT policies
    - SELECT policies only enable file listing (enumeration), which is unnecessary
      for URL-based access and exposes more data than intended
    - Add restricted SELECT policies that only allow authenticated users to list files

  3. Fix SECURITY DEFINER Function Execution
    - Revoke EXECUTE on `handle_new_user()` from `anon` and `authenticated` roles
    - This function is only meant to run as a trigger on auth.users insert,
      not to be called directly via REST RPC
    - The trigger executes as the database owner, so revoking direct
      execution does not affect the trigger behavior
*/

-- 1. Fix search_path on handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Revoke EXECUTE on handle_new_user from anon and authenticated
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;

-- 2. Remove broad public SELECT policies on storage buckets and replace with restricted ones

-- store-logos: remove broad SELECT, add authenticated-only listing
DROP POLICY IF EXISTS "Anyone can view store logos" ON storage.objects;
CREATE POLICY "Authenticated users can list store logos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'store-logos');

-- product-images: remove broad SELECT, add authenticated-only listing
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
CREATE POLICY "Authenticated users can list product images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'product-images');

-- custom-request-images: remove broad SELECT, add authenticated-only listing
DROP POLICY IF EXISTS "Anyone can view custom request images" ON storage.objects;
CREATE POLICY "Authenticated users can list custom request images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'custom-request-images');

-- avatars: remove broad SELECT, add authenticated-only listing
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Authenticated users can list avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');
