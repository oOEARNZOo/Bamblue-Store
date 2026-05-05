-- Harden admin authorization rules.
-- Admin access must come from server-controlled app_metadata or admin_users.

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public to read admin status" ON admin_users;
DROP POLICY IF EXISTS "Allow admin to update admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow admin to insert admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow admin to delete admin_users" ON admin_users;

DROP POLICY IF EXISTS "Admin can view all orders" ON orders;
DROP POLICY IF EXISTS "Admin can update all orders" ON orders;

DROP POLICY IF EXISTS "Admin can view all order items" ON order_items;

DROP POLICY IF EXISTS "Admin can view all reviews" ON reviews;
DROP POLICY IF EXISTS "Admin can update all reviews" ON reviews;
DROP POLICY IF EXISTS "Admin can delete all reviews" ON reviews;

CREATE POLICY "Users can read own admin status"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  );

CREATE POLICY "App admins can insert admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  );

CREATE POLICY "App admins can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  )
  WITH CHECK (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  );

CREATE POLICY "App admins can delete admin users"
  ON admin_users FOR DELETE
  TO authenticated
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  );

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
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
  );

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
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

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
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
  );

CREATE POLICY "Admins can view all reviews"
  ON reviews FOR SELECT
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
  );

CREATE POLICY "Admins can update all reviews"
  ON reviews FOR UPDATE
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

CREATE POLICY "Admins can delete all reviews"
  ON reviews FOR DELETE
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
  );
