-- ลบตารางเก่าถ้ามี (เพื่อแก้ปัญหา type mismatch)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;

-- สร้างตาราง orders สำหรับเก็บข้อมูลออเดอร์หลัก
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- ข้อมูลการสั่งซื้อ
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  
  -- ข้อมูลลูกค้า
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  
  -- ที่อยู่จัดส่ง
  shipping_address TEXT NOT NULL,
  shipping_province VARCHAR(100) NOT NULL,
  shipping_zipcode VARCHAR(10) NOT NULL,
  
  -- ข้อมูลการชำระเงิน
  payment_method VARCHAR(50) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  
  -- เวลา
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้างตาราง order_items สำหรับเก็บสินค้าในแต่ละออเดอร์
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  
  -- ข้อมูลสินค้า (เก็บ snapshot ไว้กรณีสินค้าถูกแก้ไข)
  product_id INTEGER NOT NULL,
  product_name_en VARCHAR(255) NOT NULL,
  product_name_th VARCHAR(255),
  product_image TEXT,
  
  -- ราคาและจำนวน
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  size VARCHAR(10),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- สร้าง Index เพื่อเพิ่มประสิทธิภาพการค้นหา
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- สร้าง Function สำหรับอัพเดต updated_at อัตโนมัติ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- สร้าง Trigger สำหรับตาราง orders
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ตั้งค่า Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Policy: ผู้ใช้สามารถดูออเดอร์ของตัวเองได้
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: ผู้ใช้สามารถสร้างออเดอร์ของตัวเองได้
CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: ผู้ใช้สามารถดู order_items ของออเดอร์ตัวเองได้
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Policy: ผู้ใช้สามารถสร้าง order_items ในออเดอร์ของตัวเองได้
CREATE POLICY "Users can create order items for their orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Comment สำหรับ documentation
COMMENT ON TABLE orders IS 'ตารางเก็บข้อมูลออเดอร์หลัก';
COMMENT ON TABLE order_items IS 'ตารางเก็บรายการสินค้าในแต่ละออเดอร์';
COMMENT ON COLUMN orders.status IS 'สถานะออเดอร์: pending, processing, shipped, delivered, cancelled';
COMMENT ON COLUMN orders.order_number IS 'เลขที่ออเดอร์ที่ unique เช่น ORD-2026-00001';

-- ตรวจสอบว่าตารางถูกสร้างแล้ว
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'order_items');
