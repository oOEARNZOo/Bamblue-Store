import React from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex bg-white">
      
      {/* 🖼️ ฝั่งซ้าย: รูปภาพตกแต่ง (ใช้รูปที่แตกต่างจากหน้า Login เพื่อความสดใหม่) */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gray-100">
        {/* เปลี่ยน path รูปได้ตามต้องการครับ แนะนำเป็นรูปรวมคอลเลกชันหรือไลฟ์สไตล์ */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/Picture/banner2.png')" }} 
        ></div>
        <div className="absolute inset-0 bg-black/25"></div>
        
        {/* ข้อความเชิญชวนบนรูป */}
        <div className="absolute bottom-16 left-16 z-10 max-w-lg">
          <span className="inline-block py-1 px-3 rounded-full bg-pink-500 text-white text-xs font-bold tracking-wider mb-4">
            NEW MEMBER
          </span>
          <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-3 tracking-wider">
            JOIN THE CLUB
          </h2>
          <p className="text-lg text-white/90 drop-shadow-md font-light tracking-wide">
            สมัครสมาชิกวันนี้ รับทันทีโค้ดส่วนลด 10% สำหรับการสั่งซื้อครั้งแรก และสะสมพอยต์เพื่อแลกของรางวัล
          </p>
        </div>
      </div>

      {/* 📝 ฝั่งขวา: ฟอร์มสมัครสมาชิก */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 xl:p-24 bg-gray-50 md:bg-white overflow-y-auto">
        <div className="w-full max-w-md bg-white p-8 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-gray-100 md:border-none my-8 md:my-0">
          
          {/* หัวข้อ */}
          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">สร้างบัญชีใหม่ ✨</h1>
            <p className="text-gray-500 text-sm">มาร่วมเป็นส่วนหนึ่งของครอบครัว Bamblue store</p>
          </div>

          {/* ⚡ ฟอร์ม (เตรียมพร้อมสำหรับ React 19 Actions) */}
          <form className="space-y-5">
            
            {/* Grid สำหรับ ชื่อ - นามสกุล */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">ชื่อ (First Name)</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName"
                  required 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm bg-gray-50 focus:bg-white" 
                  placeholder="เช่น แพรวา" 
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">นามสกุล (Last Name)</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName"
                  required 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm bg-gray-50 focus:bg-white" 
                  placeholder="เช่น ใจดี" 
                />
              </div>
            </div>

            {/* Input: อีเมล */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">อีเมล (Email)</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                required 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm bg-gray-50 focus:bg-white" 
                placeholder="your@email.com" 
              />
            </div>

            {/* Input: รหัสผ่าน */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่าน (Password)</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                required 
                minLength={8}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm bg-gray-50 focus:bg-white" 
                placeholder="อย่างน้อย 8 ตัวอักษร" 
              />
            </div>

            {/* Input: ยืนยันรหัสผ่าน */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">ยืนยันรหัสผ่าน (Confirm Password)</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword"
                required 
                minLength={8}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm bg-gray-50 focus:bg-white" 
                placeholder="กรอกรหัสผ่านอีกครั้ง" 
              />
            </div>

            {/* Checkbox: ยอมรับเงื่อนไข */}
            <div className="flex items-start mt-2">
              <div className="flex items-center h-5">
                <input 
                  type="checkbox" 
                  id="terms" 
                  required
                  className="w-4 h-4 text-[#dc6fd6] border-gray-300 rounded focus:ring-[#dc6fd6] cursor-pointer" 
                />
              </div>
              <label htmlFor="terms" className="ml-2 block text-xs text-gray-600 leading-relaxed cursor-pointer">
                ฉันยอมรับ <Link href="/terms" className="text-[#dc6fd6] hover:underline">เงื่อนไขการให้บริการ</Link> และ <Link href="/privacy" className="text-[#dc6fd6] hover:underline">นโยบายความเป็นส่วนตัว</Link> ของ Bamblue store
              </label>
            </div>

            {/* ปุ่ม Submit */}
            <button 
              type="submit" 
              className="w-full bg-[#dc6fd6] hover:bg-[#c05ca8] text-white py-3.5 rounded-lg font-bold tracking-wider transition-all shadow-md mt-6 text-sm"
            >
              สมัครสมาชิก
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-6 flex items-center justify-center space-x-4">
            <span className="h-px w-full bg-gray-200"></span>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider whitespace-nowrap">หรือ</span>
            <span className="h-px w-full bg-gray-200"></span>
          </div>

          {/* กลับไปหน้าเข้าสู่ระบบ */}
          <p className="text-center text-sm text-gray-600">
            มีบัญชีอยู่แล้วใช่ไหม?{' '}
            <Link href="/login" className="font-bold text-zinc-900 hover:text-[#dc6fd6] transition-colors border-b border-transparent hover:border-[#dc6fd6] pb-0.5">
              เข้าสู่ระบบ
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}