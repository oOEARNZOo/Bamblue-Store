# 🔐 คู่มือเข้าถึง Admin Dashboard

## 📋 วิธีที่ 1: สร้าง Admin Account (แนะนำ)

### **Option A: สมัครใหม่ด้วยอีเมล admin**
1. ไปที่ `/register`
2. สมัครด้วยอีเมล: `admin@bamblue.com`
3. ใส่รหัสผ่าน: `123456`
4. ยืนยัน OTP
5. ✅ **เข้าได้เลย!**

### **Option B: แก้ไขอีเมลที่มีอยู่**
1. ไปที่ Supabase Dashboard
2. เข้า Authentication → Users
3. ค้นหาอีเมลของคุณ
4. แก้ไขเป็น: `admin@bamblue.com`
5. ✅ **เข้าได้เลย!**

---

## 📋 วิธีที่ 2: ตั้งค่า Role ใน Supabase

### **Step 1: ไปที่ Supabase Dashboard**
1. เข้า [Supabase Dashboard](https://app.supabase.com)
2. เลือก Project ของคุณ
3. ไปที่ **Authentication** → **Users**

### **Step 2: แก้ไข User Metadata**
1. คลิกที่ผู้ใช้ที่ต้องการให้เป็น admin
2. ไปที่แท็บ **Raw JSON**
3. เพิ่มข้อมูลนี้:
```json
{
  "role": "admin",
  "first_name": "Admin",
  "last_name": "User"
}
```

### **Step 3: หรือใช้ SQL**
```sql
-- อัพเดต user metadata ให้เป็น admin
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data, 
  '{role}', 
  '"admin"'
) 
WHERE email = 'your-email@example.com';
```

---

## 🚀 วิธีเข้าใช้งาน

### **Step 1: Login**
1. ไปที่ `/login`
2. ใช้อีเมล admin ที่สร้างไว้
3. ใส่รหัสผ่าน
4. ✅ Login สำเร็จ

### **Step 2: เข้า Admin Dashboard**
1. พิมพ์ `/admin` ใน address bar
2. หรือคลิกลิงก์ถ้ามี
3. ✅ **เข้าสู่ Admin Dashboard!**

---

## 🛡️ ระบบความปลอดภัย

### **Admin Check Logic:**
```javascript
// ตรวจสอบ admin 3 วิธี:
const isAdminUser = 
  user.email === 'admin@bamblue.com' ||           // วิธี 1
  user.user_metadata?.role === 'admin' ||          // วิธี 2  
  user.email?.includes('admin');                   // วิธี 3
```

### **ถ้าไม่ใช่ Admin:**
- จะ redirect ไปหน้าแรก `/`
- ไม่สามารถเข้าถึงหน้า admin ได้

---

## 🎯 ทดสอบได้เลย!

**วิธีเร็วที่สุด:**
1. สมัครใหม่ด้วย `admin@bamblue.com`
2. Login
3. ไป `/admin`
4. ✅ **ใช้งานได้ทันที!**

---

## 📞 ถ้ามีปัญหา

**ตรวจสอบ:**
- ✅ ใช้อีเมล `admin@bamblue.com` หรือมีคำว่า "admin"
- ✅ Login สำเร็จแล้ว
- ✅ พิมพ์ `/admin` ถูกต้อง

**ถ้ายังไม่ได้:**
- ลองออกจากระบบแล้ว login ใหม่
- ตรวจสอดว่าอีเมลถูกต้อง
- ดู console ว่ามี error อะไร

---

**Admin Dashboard พร้อมใช้งาน!** 🎉
