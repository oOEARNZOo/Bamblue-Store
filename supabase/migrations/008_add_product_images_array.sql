-- 🖼️ Multiple Product Images: เพิ่มคอลัมน์ images สำหรับเก็บรูปภาพหลายรูป
-- รันใน Supabase Dashboard > SQL Editor

-- เพิ่มคอลัมน์ images เป็น array ของ text (URLs)
ALTER TABLE products1 
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- อัปเดตข้อมูลเดิม: คัดลอก image ไปใส่ใน images array
UPDATE products1 
SET images = ARRAY[image]
WHERE image IS NOT NULL AND (images IS NULL OR images = '{}');

-- สร้าง index สำหรับการค้นหา
CREATE INDEX IF NOT EXISTS idx_products1_images ON products1 USING GIN (images);
