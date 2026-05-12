"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/frontend/services/supabaseClient';
import { Shield, ArrowLeft, Mail, Smartphone, RefreshCw } from 'lucide-react';

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    // ดึง email จาก URL params
    const emailParam = searchParams.get('email');
    const savedEmail = localStorage.getItem('pending_verification_email');
    
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('pending_verification_email', emailParam);
    } else if (savedEmail) {
      setEmail(savedEmail);
    }

    // ตั้งเวลานับถอยหลัง
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  const handleResendOTP = async () => {
    setIsResending(true);
    setTimeLeft(60);
    setCanResend(false);

    try {
      const action = searchParams.get('action') || 'login';
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-otp?email=${email}&action=${action}`
        }
      });
      
      if (error) throw error;
      alert('ส่ง OTP ไปยังอีเมลใหม่แล้ว!');
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      alert('กรุณากรอก OTP 6 หลัก');
      return;
    }

    setIsLoading(true);

    try {
      // ตรวจสอบว่าเป็น signup หรือ login จาก URL params
      const action = searchParams.get('action') || 'login';
      
      const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: otpCode,
        type: action === 'signup' ? 'signup' : 'email'
      });

      if (error) throw error;
      
      alert('ยืนยันตัวตนสำเร็จ!');
      localStorage.removeItem('pending_verification_email');
      
      // ดีเลย์ 1 วินาทีแล้วเด้งไปหน้าแรก
      setTimeout(() => router.push('/'), 1000);
    } catch (error) {
      console.error('OTP verification error:', error);
      alert('OTP ไม่ถูกต้อง หรือหมดอายุแล้ว');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // ข้าไป input ถัดไปอัตโนมัติ
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // กลับไป input ก่อนหน้าเมื่อกด backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <main className="min-h-screen flex bg-white">
      
      {/* 🖼️ ฝั่งซ้าย: รูปภาพตกแต่ง */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gray-100">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/Picture/banner1.png')" }}
        ></div>
        <div className="absolute inset-0 bg-black/30"></div>
        
        <div className="absolute bottom-16 left-16 z-10 max-w-lg">
          <Shield size={48} className="text-white mb-4" strokeWidth={1.5} />
          <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-3 tracking-wider">
            ยืนยันตัวตน
          </h2>
          <p className="text-lg text-white/90 drop-shadow-md font-light tracking-wide">
            กรอกรหัส OTP 6 หลักที่เราส่งไปยังอีเมลของคุณ
          </p>
        </div>
      </div>

      {/* 📝 ฝั่งขวา: ฟอร์มยืนยัน OTP */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-gray-50 md:bg-white">
        <div className="w-full max-w-md bg-white p-8 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-gray-100 md:border-none">
          
          {/* ปุ่มกลับ */}
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#dc6fd6] transition-colors mb-8 cursor-pointer"
          >
            <ArrowLeft size={16} />
            กลับไปหน้าเข้าสู่ระบบ
          </Link>

          <div className="text-center md:text-left mb-10">
            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4">
              <Mail size={32} className="text-[#dc6fd6]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">ยืนยันตัวตน</h1>
            <p className="text-gray-500 text-sm">
              กรุณากรอกรหัส OTP 6 หลักที่เราส่งไปยัง
            </p>
            <p className="text-sm font-medium text-gray-700 mt-2">
              {email}
            </p>
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-6">
            
            {/* OTP Input */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOTPChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#dc6fd6] focus:outline-none transition-colors"
                />
              ))}
            </div>

            {/* Resend OTP */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend || isResending}
                className="text-sm text-[#dc6fd6] hover:text-[#c05ca8] disabled:text-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 mx-auto"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} />
                    กำลังส่ง...
                  </>
                ) : canResend ? (
                  'ส่ง OTP อีกครั้ง'
                ) : (
                  `ส่ง OTP อีกครั้ง (${timeLeft}s)`
                )}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#dc6fd6] hover:bg-[#c05ca8] disabled:bg-gray-400 text-white py-3.5 rounded-lg font-bold tracking-wider transition-all shadow-md text-sm cursor-pointer"
            >
              {isLoading ? 'กำลังยืนยัน...' : 'ยืนยันตัวตน'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              ไม่ได้รับรหัส OTP?{' '}
              <span className="text-xs text-gray-500">
                ตรวจสอบในกล่องจดหมาย (Spam) หรือลองส่งใหม่
              </span>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
