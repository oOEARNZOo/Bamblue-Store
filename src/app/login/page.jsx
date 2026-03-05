import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="min-h-screen flex bg-white">
      
      {/* 🖼️ ฝั่งซ้าย: รูปภาพตกแต่ง (แสดงเฉพาะบนจอคอมพิวเตอร์) */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gray-100">
        {/* เปลี่ยน path รูปเป็นรูปสวยๆ ของร้านคุณได้เลยครับ */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/Picture/banner1.png')" }}
        ></div>
        {/* เลเยอร์สีดำบางๆ ให้ตัวหนังสือเด่นขึ้น */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* ข้อความต้อนรับบนรูป */}
        <div className="absolute bottom-16 left-16 z-10 max-w-lg">
          <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-3 tracking-wider">
            YOUTH ELEVATED
          </h2>
          <p className="text-lg text-white/90 drop-shadow-md font-light tracking-wide">
            เข้าสู่ระบบเพื่อสะสมแต้ม รับสิทธิพิเศษ และไม่พลาดทุกโปรโมชั่นลับเฉพาะสมาชิก Bamblue store
          </p>
        </div>
      </div>

      {/* 📝 ฝั่งขวา: ฟอร์มเข้าสู่ระบบ */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-gray-50 md:bg-white">
        <div className="w-full max-w-md bg-white p-8 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-gray-100 md:border-none">
          
          {/* หัวข้อ */}
          <div className="text-center md:text-left mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">ยินดีต้อนรับกลับมา! ✨</h1>
            <p className="text-gray-500 text-sm">ลงชื่อเข้าใช้เพื่อช้อปปิ้งสไตล์ Simply Stylish ต่อได้เลย</p>
          </div>

          {/* ⚡ ฟอร์ม (เตรียมพร้อมสำหรับ React 19 Actions) */}
          <form className="space-y-6">
            
            {/* Input: อีเมล */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">อีเมล (Email)</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                required 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-sm bg-gray-50 focus:bg-white" 
                placeholder="your@email.com" 
              />
            </div>

            {/* Input: รหัสผ่าน */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">รหัสผ่าน (Password)</label>
                {/* ลิงก์ลืมรหัสผ่าน */}
                <Link href="/forgot-password" className="text-xs font-semibold text-pink-500 hover:text-pink-600 transition-colors">
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <input 
                type="password" 
                id="password" 
                name="password"
                required 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-sm bg-gray-50 focus:bg-white" 
                placeholder="••••••••" 
              />
            </div>

            {/* Checkbox: จดจำฉันไว้ */}
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-4 h-4 text-pink-500 border-gray-300 rounded focus:ring-pink-500 cursor-pointer" 
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                จดจำฉันไว้ในระบบ
              </label>
            </div>

            {/* ปุ่ม Submit */}
            <button 
              type="submit" 
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-3.5 rounded-lg font-bold tracking-wider transition-all shadow-md mt-4 text-sm"
            >
              เข้าสู่ระบบ
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-6 flex items-center justify-center space-x-4">
            <span className="h-px w-full bg-gray-200"></span>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider whitespace-nowrap">หรือ</span>
            <span className="h-px w-full bg-gray-200"></span>
          </div>

          {/* ไปหน้าสมัครสมาชิก */}
          <p className="text-center text-sm text-gray-600">
            ยังไม่มีบัญชีใช่ไหม?{' '}
            <Link href="/register" className="font-bold text-pink-500 hover:text-pink-600 transition-colors border-b border-transparent hover:border-pink-500 pb-0.5">
              สมัครสมาชิกฟรี
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}