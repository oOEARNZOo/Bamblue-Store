-- เพิ่ม RLS Policy สำหรับ Admin ให้สามารจัดการออเดอร์ได้

-- เปิด RLS บนตาราง orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับ Admin: สามารถอ่านและอัปเดตทุกออเดอร์ได้
CREATE POLICY "Admin can view all orders" ON orders
  FOR SELECT USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  );

CREATE POLICY "Admin can update all orders" ON orders
  FOR UPDATE USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  );

-- Policy สำหรับ User: สามารถอ่านออเดอร์ของตัวเองได้
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- เปิด RLS บนตาราง order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy สำหรับ Admin: สามารถอ่าน order_items ทั้งหมดได้
CREATE POLICY "Admin can view all order items" ON order_items
  FOR SELECT USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  );

-- Policy สำหรับ User: สามารถอ่าน order_items ของตัวเองได้ (ผ่าน orders)
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );
