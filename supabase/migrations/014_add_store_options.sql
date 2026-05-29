-- Optional storefront features: coupons, order tracking, and payment metadata.
-- Run this migration before wiring the admin coupon/tracking UI to production data.

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS shipping_carrier TEXT,
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_provider TEXT,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  minimum_subtotal NUMERIC(10, 2) DEFAULT 0,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons (code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons (is_active, starts_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders (tracking_number);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage coupons" ON coupons;
CREATE POLICY "Admins can manage coupons"
  ON coupons
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM admin_users
      WHERE admin_users.user_id = auth.uid()
        AND admin_users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM admin_users
      WHERE admin_users.user_id = auth.uid()
        AND admin_users.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Authenticated users can read active coupons" ON coupons;
CREATE POLICY "Authenticated users can read active coupons"
  ON coupons
  FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND starts_at <= now()
    AND (expires_at IS NULL OR expires_at >= now())
  );

NOTIFY pgrst, 'reload schema';
