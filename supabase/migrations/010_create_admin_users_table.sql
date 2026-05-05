-- ============================================
-- SQL Migration: สร้าง admin_users table
-- ============================================
-- 
-- วัตถุประสงค์:
-- ✅ เก็บข้อมูลผู้ดูแลระบบแทนการ hardcode email
-- ✅ ให้การจัดการสิทธิ admin ยืดหยุ่นมากขึ้น
-- ✅ สามารถเพิ่ม/ลบ admin ได้โดยไม่ต้องแก้ code
--
-- วิธีใช้:
-- 1. ไปที่ Supabase Dashboard
-- 2. ไปที่ SQL Editor
-- 3. Copy-paste SQL นี้ทั้งหมดแล้ว Execute
-- ============================================

-- 1. สร้าง Table admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin BOOLEAN DEFAULT true,
  role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'moderator', 'support'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. สร้าง Index สำหรับการค้นหาเร็ว
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX idx_admin_users_role ON admin_users(role);

-- 3. เปิด RLS (Row Level Security)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 4. สร้าง Policies สำหรับ RLS
-- Policy 1: ให้อ่านข้อมูล admin ได้ (สำหรับตรวจสอบ admin status)
CREATE POLICY "Allow public to read admin status"
  ON admin_users FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid()) OR
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  );

-- Policy 2: ให้เฉพาะ authenticated users ที่เป็น admin แก้ไขได้
CREATE POLICY "Allow admin to update admin_users"
  ON admin_users FOR UPDATE
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  )
  WITH CHECK (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  );

-- Policy 3: ให้เฉพาะ admin เพิ่มข้อมูลได้
CREATE POLICY "Allow admin to insert admin_users"
  ON admin_users FOR INSERT
  WITH CHECK (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  );

-- Policy 4: ให้เฉพาะ admin ลบข้อมูลได้
CREATE POLICY "Allow admin to delete admin_users"
  ON admin_users FOR DELETE
  USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  );

-- ============================================
-- 🎯 หลังจากสร้าง Table แล้ว:
-- ============================================
-- 
-- 1. เพิ่ม user ที่เป็น admin:
-- INSERT INTO admin_users (user_id, is_admin, role) 
-- VALUES ('USER_ID_HERE', true, 'admin');
-- 
-- 2. ได้ USER_ID จาก Supabase Auth Users table
--    (ต้องให้ user register ก่อนนะ)
--
-- ============================================
