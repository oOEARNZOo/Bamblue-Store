-- 📦 Stock & Badges: เพิ่มคอลัมน์สำหรับจัดการสต็อกและ badges
-- รันใน Supabase Dashboard > SQL Editor

-- เพิ่มคอลัมน์ stock สำหรับเก็บจำนวนสินค้าในสต็อก
ALTER TABLE products1 
ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 99;

-- เพิ่มคอลัมน์ is_new สำหรับแสดง badge "NEW"
ALTER TABLE products1 
ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;

-- เพิ่มคอลัมน์ discount_percent สำหรับแสดง badge "SALE" และคำนวณราคาลด
ALTER TABLE products1 
ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;

-- เพิ่มคอลัมน์ original_price สำหรับเก็บราคาเดิมก่อนลด
ALTER TABLE products1 
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2);

-- อัปเดตสินค้าที่มีอยู่ให้มี stock เริ่มต้น
UPDATE products1 
SET stock = 99 
WHERE stock IS NULL;

-- ตั้งค่าสินค้า 4 ชิ้นแรกเป็น "NEW"
UPDATE products1 
SET is_new = true 
WHERE id IN (SELECT id FROM products1 ORDER BY id ASC LIMIT 4);

-- สร้าง index สำหรับการค้นหา
CREATE INDEX IF NOT EXISTS idx_products1_stock ON products1(stock);
CREATE INDEX IF NOT EXISTS idx_products1_is_new ON products1(is_new);
CREATE INDEX IF NOT EXISTS idx_products1_discount ON products1(discount_percent);

-- =============================================
-- 📊 ตัวอย่างการอัปเดตข้อมูล (ปรับตามต้องการ)
-- =============================================

-- ตัวอย่าง: ตั้งค่าสินค้า id=5 ให้หมดสต็อก
-- UPDATE products1 SET stock = 0 WHERE id = 5;

-- ตัวอย่าง: ตั้งค่าสินค้า id=3 ให้ลด 20%
-- UPDATE products1 SET discount_percent = 20, original_price = price WHERE id = 3;

-- ตัวอย่าง: ตั้งค่าสินค้าใหม่
-- UPDATE products1 SET is_new = true WHERE id = 1;
