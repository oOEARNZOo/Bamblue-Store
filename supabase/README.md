# Supabase Database Setup

## การติดตั้งตาราง Orders และ Order Items

### วิธีที่ 1: ใช้ Supabase Dashboard (แนะนำ)

1. เข้าสู่ระบบ [Supabase Dashboard](https://app.supabase.com)
2. เลือก Project ของคุณ
3. ไปที่ **SQL Editor** (เมนูด้านซ้าย)
4. กดปุ่ม **New Query**
5. คัดลอกโค้ดจากไฟล์ `migrations/001_create_orders_tables.sql` ทั้งหมด
6. วางลงใน SQL Editor
7. กด **Run** (หรือกด Ctrl/Cmd + Enter)
8. ตรวจสอบว่าไม่มี error และเห็นข้อความ "Success"

### วิธีที่ 2: ใช้ Supabase CLI (สำหรับ Advanced Users)

```bash
# ติดตั้ง Supabase CLI
npm install -g supabase

# Login
supabase login

# Link กับ project
supabase link --project-ref <your-project-id>

# Run migration
supabase db push
```

## โครงสร้างตาราง

### 📦 `orders` - ตารางข้อมูลออเดอร์หลัก

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | Foreign key → auth.users |
| `order_number` | VARCHAR(50) | เลขที่ออเดอร์ (unique) |
| `status` | VARCHAR(20) | สถานะ: pending, processing, shipped, delivered, cancelled |
| `email` | VARCHAR(255) | อีเมลลูกค้า |
| `first_name` | VARCHAR(100) | ชื่อ |
| `last_name` | VARCHAR(100) | นามสกุล |
| `phone` | VARCHAR(20) | เบอร์โทร |
| `shipping_address` | TEXT | ที่อยู่จัดส่ง |
| `shipping_province` | VARCHAR(100) | จังหวัด |
| `shipping_zipcode` | VARCHAR(10) | รหัสไปรษณีย์ |
| `payment_method` | VARCHAR(50) | วิธีชำระเงิน |
| `subtotal` | DECIMAL(10,2) | ราคารวมสินค้า |
| `shipping_fee` | DECIMAL(10,2) | ค่าจัดส่ง |
| `total` | DECIMAL(10,2) | ราคารวมทั้งหมด |
| `created_at` | TIMESTAMP | วันที่สั่งซื้อ |
| `updated_at` | TIMESTAMP | วันที่อัพเดต |

### 📋 `order_items` - ตารางรายการสินค้าในแต่ละออเดอร์

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `order_id` | UUID | Foreign key → orders |
| `product_id` | INTEGER | รหัสสินค้า |
| `product_name_en` | VARCHAR(255) | ชื่อสินค้า (EN) |
| `product_name_th` | VARCHAR(255) | ชื่อสินค้า (TH) |
| `product_image` | TEXT | URL รูปภาพ |
| `price` | DECIMAL(10,2) | ราคาต่อชิ้น |
| `quantity` | INTEGER | จำนวน |
| `size` | VARCHAR(10) | ขนาด |
| `created_at` | TIMESTAMP | วันที่สร้าง |

## ฟีเจอร์ที่มี

✅ **Row Level Security (RLS)** - ผู้ใช้แต่ละคนเห็นเฉพาะออเดอร์ของตัวเอง
✅ **Auto-generated UUID** - สร้าง ID อัตโนมัติ
✅ **Auto-update timestamp** - อัพเดต `updated_at` อัตโนมัติ
✅ **Indexes** - เพิ่มความเร็วในการค้นหา
✅ **Foreign Key Constraints** - รักษาความสมบูรณ์ของข้อมูล
✅ **Check Constraints** - ตรวจสอบความถูกต้องของข้อมูล

## การทดสอบว่าติดตั้งสำเร็จ

รันคำสั่งนี้ใน SQL Editor:

```sql
-- ตรวจสอบว่าตารางถูกสร้างแล้ว
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'order_items');

-- ควรเห็น 2 แถว: orders และ order_items
```

## Next Steps

หลังจากรัน migration แล้ว:

1. ✅ ตาราง `orders` และ `order_items` พร้อมใช้งาน
2. ⏭️ แก้ไข Checkout page ให้บันทึกออเดอร์ลง Supabase
3. ⏭️ สร้างหน้า Order History
4. ⏭️ สร้างหน้า User Profile

## ตัวอย่างข้อมูล Order Number

```
ORD-2026-00001
ORD-2026-00002
...
```

Format: `ORD-{YEAR}-{5-digit-sequence}`
