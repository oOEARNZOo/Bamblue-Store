import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/backend/supabase/server';

// ต้องไม่ถูก cache ตอน build ไม่งั้นจะไม่ได้ยิง query จริง
export const dynamic = 'force-dynamic';

// เรียกโดย Vercel Cron (ดู vercel.json) เพื่อให้โปรเจกต์ Supabase ฟรีไม่ถูก pause
export async function GET(request) {
  // ถ้าตั้ง CRON_SECRET ใน Vercel, Vercel Cron จะส่ง Authorization: Bearer <CRON_SECRET> มาให้อัตโนมัติ
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from('products1').select('id').limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, checkedAt: new Date().toISOString() });
}
