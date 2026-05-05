-- Allow the storefront to read products with the public anon key.
-- Without this policy, products can load locally for a signed-in user but fail
-- on Vercel for anonymous visitors when RLS is enabled on products1.

ALTER TABLE products1 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read storefront products" ON products1;
DROP POLICY IF EXISTS "Admins can manage storefront products" ON products1;

CREATE POLICY "Public can read storefront products"
  ON products1 FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage storefront products"
  ON products1 FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM admin_users
      WHERE admin_users.user_id = (SELECT auth.uid())
        AND admin_users.is_admin = true
    ) OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM admin_users
      WHERE admin_users.user_id = (SELECT auth.uid())
        AND admin_users.is_admin = true
    ) OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  );
