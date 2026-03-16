"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase'; // ⚠️ เช็ค Path ให้ตรงกับโฟลเดอร์ของคุณนะครับ

export default function RegisterPage() {
  const router = useRouter();

  // 🌟 สร้าง State สำหรับเก็บข้อมูลที่กรอกในฟอร์ม
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // ฟังก์ชันจัดการเมื่อพิมพ์ข้อมูล
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 ฟังก์ชันยืนยันสมัครสมาชิก
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' }); // ล้างข้อความเก่า

    // 1. เช็คว่ารหัสผ่านตรงกันไหม
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'รหัสผ่าน และ ยืนยันรหัสผ่าน ไม่ตรงกันครับ' });
      return;
    }

    // 2. เช็คว่ากดยอมรับเงื่อนไขหรือยัง
    if (!termsAccepted) {
      setMessage({ type: 'error', text: 'กรุณายอมรับเงื่อนไขการให้บริการก่อนสมัครสมาชิกครับ' });
      return;
    }

    setLoading(true);

    try {
      // 3. สมัครสมาชิกก่อน (ไม่ต้องยืนยันอีเมล)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) throw signUpError;

      // 4. ส่ง OTP 6 หลักทางอีเมล
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: formData.email,
        options: {
          shouldCreateUser: false
        }
      });

      if (otpError) throw otpError;

      // 5. บันทึกข้อมูลไว้ใน localStorage
      localStorage.setItem('pending_verification_email', formData.email);
      localStorage.setItem('pending_user_data', JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName
      }));

      setMessage({ 
        type: 'success', 
        text: '📧 ส่งรหัส OTP 6 หลักไปยังอีเมลแล้ว! กรุณาตรวจสอดกล่องจดหมาย' 
      });
      
      // ดีเลย์ 2 วินาทีแล้วเด้งไปหน้า Verify OTP
      setTimeout(() => router.push(`/verify-otp?email=${formData.email}&action=signup`), 2000); 

    } catch (error) {
      console.error('Registration error:', error.message);
      let errorText = 'เกิดข้อผิดพลาด: ' + error.message;
      
      // แปลง Error ภาษาอังกฤษจาก Supabase ให้เป็นภาษาไทยที่เข้าใจง่าย
      if (error.message.includes('User already registered')) {
          errorText = 'อีเมลนี้มีผู้ใช้งานแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ';
      } else if (error.message.includes('Password should be at least')) {
          errorText = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษรครับ';
      }
      
      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-white">
      
      {/* 🖼️ ฝั่งซ้าย: รูปภาพตกแต่ง */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gray-100">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/Picture/banner2.png')" }} 
        ></div>
        <div className="absolute inset-0 bg-black/25"></div>
        
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
          
          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">สร้างบัญชีใหม่ ✨</h1>
            <p className="text-gray-500 text-sm">มาร่วมเป็นส่วนหนึ่งของครอบครัว Bamblue store</p>
          </div>

          {/* 🌟 แสดงข้อความแจ้งเตือน Error / Success */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-medium border ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
              {message.text}
            </div>
          )}

          {/* ⚡ ฟอร์ม (เชื่อม onSubmit กับฟังก์ชัน handleRegister) */}
          <form onSubmit={handleRegister} className="space-y-5">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">ชื่อ (First Name)</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
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
                  value={formData.lastName}
                  onChange={handleChange}
                  required 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm bg-gray-50 focus:bg-white" 
                  placeholder="เช่น ใจดี" 
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">อีเมล (Email)</label>
              <input 
                type="email" 
                id="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm bg-gray-50 focus:bg-white" 
                placeholder="your@email.com" 
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">รหัสผ่าน (Password)</label>
              <input 
                type="password" 
                id="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required 
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm bg-gray-50 focus:bg-white" 
                placeholder="อย่างน้อย 6 ตัวอักษร" 
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">ยืนยันรหัสผ่าน (Confirm Password)</label>
              <input 
                type="password" 
                id="confirmPassword" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required 
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm bg-gray-50 focus:bg-white" 
                placeholder="กรอกรหัสผ่านอีกครั้ง" 
              />
            </div>

            <div className="flex items-start mt-2">
              <div className="flex items-center h-5">
                <input 
                  type="checkbox" 
                  id="terms" 
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 text-[#dc6fd6] border-gray-300 rounded focus:ring-[#dc6fd6] cursor-pointer" 
                />
              </div>
              <label htmlFor="terms" className="ml-2 block text-xs text-gray-600 leading-relaxed cursor-pointer">
                ฉันยอมรับ <Link href="/terms" className="text-[#dc6fd6] hover:underline">เงื่อนไขการให้บริการ</Link> และ <Link href="/privacy" className="text-[#dc6fd6] hover:underline">นโยบายความเป็นส่วนตัว</Link> ของ Bamblue store
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#dc6fd6] hover:bg-[#c05ca8] disabled:bg-gray-400 text-white py-3.5 rounded-lg font-bold tracking-wider transition-all shadow-md mt-6 text-sm cursor-pointer"
            >
              {loading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div className="mt-8 mb-6 flex items-center justify-center space-x-4">
            <span className="h-px w-full bg-gray-200"></span>
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider whitespace-nowrap">หรือ</span>
            <span className="h-px w-full bg-gray-200"></span>
          </div>

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