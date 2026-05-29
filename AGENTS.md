# AGENTS.md

คู่มือสำหรับ AI coding agent ที่เข้ามาทำงานในโปรเจกต์ **Bamblue Store**

## ภาพรวมโปรเจกต์

Bamblue Store เป็นเว็บ E-commerce แฟชั่นแนว K-Fashion สร้างด้วย:

- Next.js 14 App Router
- React 18
- Tailwind CSS
- Supabase สำหรับสินค้า, stock, order, review และ auth
- Framer Motion สำหรับ motion/animation
- react-hot-toast สำหรับ notification
- lucide-react สำหรับ icon

เป้าหมายของเว็บคือให้ดู clean, modern, premium, smooth และรองรับ mobile/tablet/desktop

## โครงสร้างหลัก

- `src/app` - หน้าและ route หลักของ Next.js App Router
- `src/frontend/components` - component ฝั่ง UI
- `src/frontend/context` - React context เช่น cart และ wishlist
- `src/frontend/services` - Supabase client และ service ที่เกี่ยวข้อง
- `src/frontend/utils` - utility เช่น toast helper
- `public` - static assets และรูปภาพ
- `supabase` - ไฟล์หรือ config ที่เกี่ยวกับ Supabase

## คำสั่งที่ใช้บ่อย

```bash
npm run dev
npm run lint
npm run build
```

หมายเหตุ: ห้ามรัน `npm run build`, restart dev server หรือปิด localhost เอง ถ้าผู้ใช้ไม่ได้ขอชัดเจน

## แนวทางการแก้โค้ด

- อ่านโค้ดเดิมก่อนแก้ และทำตาม pattern ที่มีอยู่
- แก้เฉพาะ scope ที่ผู้ใช้ขอ ไม่ refactor ใหญ่ถ้าไม่จำเป็น
- อย่าเปลี่ยนชื่อ component/function โดยไม่จำเป็น
- อย่าลบ feature เดิมโดยไม่ได้รับอนุญาต
- อย่าแก้ business logic ถ้างานเป็น UX/UI อย่างเดียว
- ถ้าแก้ Supabase/Auth/Admin ให้ระวัง RLS และสิทธิ์ admin เป็นพิเศษ
- ถ้าเจอ worktree มีไฟล์แก้ค้างอยู่ ให้ถือว่าเป็นงานของผู้ใช้หรือ agent ก่อนหน้า ห้าม revert เอง

## UX/UI Guideline

- โทนหลัก: ขาว, ชมพู Bamblue `#dc6fd6`, เทาอ่อน, ดำ
- UI ต้องดู premium, clean และไม่รก
- ใช้ card radius ประมาณ 12-16px ถ้าไม่มี pattern เดิมกำหนดไว้
- อย่าใช้ animation เยอะเกินไป
- Motion ควรใช้ `opacity` และ `transform` เป็นหลัก
- Notification ใช้ตำแหน่ง `top-center` ใต้ navbar
- Loading ควรใช้ skeleton/shimmer มากกว่า spinner
- ต้องตรวจ mobile layout ทุกครั้งที่แก้ navbar, card grid, modal, mini window หรือ admin dashboard

## Product / Cart / Wishlist

- Product detail ต้องผูกจำนวนซื้อกับ stock ตาม size
- ห้ามให้จำนวนใน cart เกิน stock ของ size นั้น
- Add to cart ควรแจ้งจำนวนที่เพิ่มและจำนวนรวมในตะกร้า
- Wishlist และ cart mini window ควรมี confirmation ก่อนลบ
- Badge count ของ cart/wishlist ควร update ชัดเจนและไม่กระตุก

## Admin Dashboard

- Admin layout ใช้ sidebar แยกจาก navbar หลักของหน้าร้าน
- Sidebar ต้องอยู่ค้างด้านซ้ายบน desktop
- ต้องมีปุ่มกลับหน้าร้านใน admin sidebar หรือ mobile admin bar
- Main content ต้องไม่ล้นแนวนอน
- Table ที่กว้างควร scroll เฉพาะ container ไม่ใช่ทั้งหน้า
- ห้ามเพิ่ม menu admin ที่ยังไม่มีหน้าจริง ถ้าไม่ได้ implement route รองรับ

## Supabase

- ใช้ `supabasePublic` สำหรับข้อมูล public ที่อ่านได้
- ใช้ `supabase` สำหรับ auth/session หรือ operation ที่ต้องใช้ user context
- อย่าใช้ `user_metadata` เป็นแหล่งตรวจสิทธิ์ admin ถ้าเป็น security-critical
- ถ้าแก้ schema/query ให้เช็กชื่อ field ให้ตรงกับ checkout/admin/order pages

## การตรวจงาน

ถ้าผู้ใช้ห้าม build ให้ใช้วิธีตรวจแบบเบาแทน เช่น:

```bash
node -e "const fs=require('fs'); const parser=require('next/dist/compiled/babel/parser'); parser.parse(fs.readFileSync('path/to/file.jsx','utf8'),{sourceType:'module',plugins:['jsx']}); console.log('ok')"
git diff --check
```

ให้บอกผู้ใช้ชัดเจนว่าได้ตรวจอะไร และไม่ได้ตรวจอะไร

## สไตล์การตอบผู้ใช้

- ตอบเป็นภาษาไทยเป็นหลัก
- สรุปไฟล์ที่แก้และเหตุผลให้ชัด
- ถ้าไม่ได้ run build หรือ test ให้บอกตรงๆ
- ถ้างานเป็นคำถามก่อนแก้ ให้ตอบแนวทางก่อน อย่าเพิ่งแก้โค้ด
- ถ้าแก้โค้ดแล้ว ให้บอกวิธี test บน `localhost:3000`
