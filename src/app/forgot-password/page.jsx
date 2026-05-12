"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/frontend/services/supabaseClient';
import { KeyRound, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลแล้ว กรุณาตรวจสอบกล่องจดหมายและ Spam',
      });
      setEmail('');
    } catch (error) {
      console.error('Reset password error:', error.message);
      let errorText = 'เกิดข้อผิดพลาด: ' + error.message;

      if (error.message.includes('Invalid email')) {
        errorText = 'รูปแบบอีเมลไม่ถูกต้อง';
      }

      setMessage({ type: 'error', text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-white">
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gray-100">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/Picture/banner1.png')" }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-16 left-16 z-10 max-w-lg">
          <KeyRound size={48} className="text-white mb-4" strokeWidth={1.5} />
          <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-3 tracking-wider">
            ลืมรหัสผ่าน?
          </h2>
          <p className="text-lg text-white/90 drop-shadow-md font-light tracking-wide">
            ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปที่อีเมลของคุณ
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-gray-50 md:bg-white">
        <div className="w-full max-w-md bg-white p-8 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-gray-100 md:border-none">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#dc6fd6] transition-colors mb-8 cursor-pointer">
            <ArrowLeft size={16} />
            กลับไปหน้าเข้าสู่ระบบ
          </Link>

          <div className="text-center md:text-left mb-10">
            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4">
              <KeyRound size={32} className="text-[#dc6fd6]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">รีเซ็ตรหัสผ่าน</h1>
            <p className="text-gray-500 text-sm">
              กรอกอีเมลที่ใช้สมัครสมาชิก แล้วกดลิงก์จากอีเมลเพื่อมาตั้งรหัสผ่านใหม่
            </p>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg text-sm font-medium border ${
              message.type === 'error'
                ? 'bg-red-50 text-red-600 border-red-100'
                : 'bg-green-50 text-green-600 border-green-100'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#dc6fd6] hover:bg-[#c05ca8] disabled:bg-gray-400 text-white py-3.5 rounded-lg font-bold tracking-wider transition-all shadow-md text-sm cursor-pointer"
            >
              {loading ? 'กำลังส่งอีเมล...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              จำรหัสผ่านได้แล้ว?{' '}
              <Link href="/login" className="font-bold text-[#dc6fd6] hover:text-[#c05ca8] transition-colors">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
