"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Home, LogIn } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center animate-in fade-in zoom-in-95 duration-300">
        
        {/* ไอคอน */}
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogOut size={40} className="text-green-500" />
        </div>

        {/* ข้อความหลัก */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          ออกจากระบบเรียบร้อยแล้ว 👋
        </h1>
        
        <p className="text-gray-500 text-sm md:text-base mb-8">
          ขอบคุณที่ใช้บริการ Bamblue Store<br />
          หวังว่าจะได้เจอกันใหม่เร็วๆ นี้!
        </p>

        {/* Countdown */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-xs text-gray-500 mb-2">กำลังพาคุณกลับไปหน้าแรกใน</p>
          <p className="text-3xl font-bold text-[#dc6fd6]">{countdown}</p>
          <p className="text-xs text-gray-400 mt-1">วินาที</p>
        </div>

        {/* ปุ่ม Action */}
        <div className="space-y-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3.5 rounded-lg font-bold tracking-wider transition-all shadow-md text-sm"
          >
            <Home size={18} />
            กลับไปหน้าแรกทันที
          </Link>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full border-2 border-[#dc6fd6] text-[#dc6fd6] hover:bg-pink-50 py-3.5 rounded-lg font-bold tracking-wider transition-all text-sm"
          >
            <LogIn size={18} />
            เข้าสู่ระบบอีกครั้ง
          </Link>
        </div>

        {/* ข้อความเพิ่มเติม */}
        <p className="text-xs text-gray-400 mt-8">
          Session ของคุณถูกยกเลิกแล้ว คุณสามารถเข้าสู่ระบบใหม่ได้ตลอดเวลา
        </p>
      </div>
    </main>
  );
}
