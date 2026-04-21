-- อัพเดต size_stock สำหรับทุกสินค้าที่ยังไม่มีข้อมูล
UPDATE products1
SET size_stock = '{"S": 10, "M": 25, "L": 15, "XL": 5}'::jsonb
WHERE size_stock IS NULL;

-- หรือตั้งค่าเฉพาะสินค้าบางตัว
UPDATE products1
SET size_stock = '{"S": 10, "M": 25, "L": 15, "XL": 5}'::jsonb
WHERE id = 10; -- เปลี่ยน ID ตามที่ต้องการ

-- ดูผลลัพธ์
SELECT id, nameEN, size_stock, stock
FROM products1
ORDER BY id;
