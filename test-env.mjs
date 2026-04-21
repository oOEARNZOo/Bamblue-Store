9// 🧪 ทดสอบ Environment Variables
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 ตรวจสอบ Environment Variables\n');

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ไม่พบใน .env.local');
  console.log('💡 ต้องเพิ่มค่านี้ใน .env.local:\n');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://xrduqrfeyhlwpnnwolyh.supabase.co\n');
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
}

if (!supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY ไม่พบใน .env.local');
  console.log('💡 ต้องเพิ่มค่านี้ใน .env.local\n');
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey.substring(0, 30) + '...');
}

if (!supabaseUrl || !supabaseKey) {
  console.log('\n⚠️  Environment Variables ไม่ครบ!');
  console.log('📝 แก้ไข .env.local และเพิ่มค่าทั้ง 2 ตัว\n');
  process.exit(1);
}

console.log('\n🔄 ทดสอบการเชื่อมต่อ Supabase...');

const supabase = createClient(supabaseUrl, supabaseKey);

try {
  const { data, error, count } = await supabase
    .from('products1')
    .select('id, nameEN', { count: 'exact' })
    .limit(3);

  if (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message);
    console.log('\n💡 สาเหตุที่เป็นไปได้:');
    console.log('   1. RLS (Row Level Security) บล็อกการอ่านข้อมูล');
    console.log('   2. โปรเจ็กต์ Supabase ถูก Pause');
    console.log('   3. API Key ไม่ถูกต้อง\n');
    process.exit(1);
  }

  console.log('✅ เชื่อมต่อสำเร็จ!');
  console.log(`📦 พบสินค้าทั้งหมด: ${count} รายการ`);
  console.log(`📦 แสดง ${data.length} รายการแรก:\n`);
  data.forEach((p, i) => console.log(`   ${i + 1}. ID: ${p.id} - ${p.nameEN}`));
  console.log('\n🎉 ทุกอย่างทำงานปกติ!\n');
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
