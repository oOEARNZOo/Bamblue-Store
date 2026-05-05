-- เพิ่ม RLS Policy สำหรับ Admin ให้สามารถจัดการรีวิวได้ทั้งหมด

-- Policy สำหรับ Admin: สามารถดูรีวิวทั้งหมดได้ (รวมที่ยังไม่อนุมัติ)
CREATE POLICY "Admin can view all reviews" ON reviews
  FOR SELECT USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  );

-- Policy สำหรับ Admin: สามารถอัปเดตรีวิวทั้งหมดได้
CREATE POLICY "Admin can update all reviews" ON reviews
  FOR UPDATE USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  );

-- Policy สำหรับ Admin: สามารถลบรีวิวทั้งหมดได้
CREATE POLICY "Admin can delete all reviews" ON reviews
  FOR DELETE USING (
    auth.jwt() -> 'app_metadata' ->> 'role' = 'admin' OR
    COALESCE(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb) ? 'admin'
  );
