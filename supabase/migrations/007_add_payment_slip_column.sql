-- 🏦 Payment Gateway: เพิ่มคอลัมน์สำหรับระบบตรวจสอบการชำระเงิน
-- รันใน Supabase Dashboard > SQL Editor

-- ⚠️ สำคัญ: ขยายขนาดคอลัมน์ status ให้รองรับสถานะใหม่
ALTER TABLE orders 
ALTER COLUMN status TYPE VARCHAR(50);

-- ⚠️ ลบ CHECK CONSTRAINT เก่าและสร้างใหม่ที่รองรับสถานะใหม่
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'pending_payment_verification', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'));

-- เพิ่มคอลัมน์ payment_confirmed_at สำหรับเก็บเวลาที่ลูกค้ากดยืนยันชำระเงิน
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMP WITH TIME ZONE;

-- เพิ่มคอลัมน์ payment_verified_at สำหรับเก็บเวลาที่ Admin อนุมัติ
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP WITH TIME ZONE;

-- เพิ่มคอลัมน์ payment_verified_by สำหรับเก็บ admin ที่อนุมัติ
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_verified_by UUID REFERENCES auth.users(id);

-- =============================================
-- 📝 หมายเหตุ: สถานะ Order ที่รองรับ
-- =============================================
-- pending                      = รอชำระเงิน
-- pending_payment_verification = รอตรวจสอบการชำระเงิน (ลูกค้ากดยืนยันแล้ว)
-- paid                         = ชำระเงินแล้ว (Admin อนุมัติแล้ว)
-- processing                   = กำลังจัดเตรียม
-- shipped                      = จัดส่งแล้ว
-- delivered                    = ส่งถึงแล้ว
-- cancelled                    = ยกเลิก
