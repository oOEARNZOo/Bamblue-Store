"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/frontend/services/supabaseClient';

export default function RegisterPage() {
  const router = useRouter();
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน' });
      return;
    }

    if (formData.password.length < 8) {
      setMessage({ type: 'error', text: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' });
      return;
    }

    if (!termsAccepted) {
      setMessage({ type: 'error', text: 'กรุณายอมรับเงื่อนไขการให้บริการก่อนสมัครสมาชิก' });
      return;
    }

    setLoading(true);

    try {
      const email = formData.email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/login`,
        },
      });

      if (error) throw error;

      localStorage.setItem('pending_verification_email', email);

      if (data.session) {
        setMessage({ type: 'success', text: 'สมัครสมาชิกสำเร็จ กำลังพาไปหน้าแรก...' });
        setTimeout(() => router.push('/'), 700);
        return;
      }

      setMessage({
        type: 'success',
        text: 'สมัครสมาชิกสำเร็จ กรุณาตรวจอีเมลเพื่อกดยืนยันบัญชีก่อนเข้าสู่ระบบ',
      });
      setTimeout(() => router.push('/login'), 2500);
    } catch (error) {
      console.error('Registration error:', error.message);
      let errorText = 'เกิดข้อผิดพลาด: ' + error.message;

      if (error.message.includes('User already registered') || error.message.includes('already registered')) {
        errorText = 'อีเมลนี้มีผู้ใช้งานแล้ว กรุณาเข้าสู่ระบบหรือใช้อีเมลอื่น';
      } else if (error.message.includes('Password should be at least') || error.message.includes('weak password')) {
        errorText = 'รหัสผ่านไม่ผ่านเงื่อนไขของ Supabase กรุณาตั้งรหัสผ่านให้เดายากขึ้น';
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
          style={{ backgroundImage: "url('/Picture/banner2.png')" }}
        />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute bottom-16 left-16 z-10 max-w-lg">
          <span className="inline-block py-1 px-3 rounded-full bg-pink-500 text-white text-xs font-bold tracking-wider mb-4">
            NEW MEMBER
          </span>
          <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-3 tracking-wider">
            JOIN THE CLUB
          </h2>
          <p className="text-lg text-white/90 drop-shadow-md font-light tracking-wide">
            สมัครสมาชิกเพื่อบันทึกโปรไฟล์ ติดตามคำสั่งซื้อ และใช้งานระบบสมาชิกของ Bamblue store
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 xl:p-24 bg-gray-50 md:bg-white overflow-y-auto">
        <div className="w-full max-w-md bg-white p-8 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-gray-100 md:border-none my-8 md:my-0">
          <div className="text-center md:text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">สร้างบัญชีใหม่</h1>
            <p className="text-gray-500 text-sm">สมัครด้วยอีเมลและรหัสผ่านผ่าน Supabase Auth</p>
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

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                  placeholder="ชื่อ"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  นามสกุล
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                  placeholder="นามสกุล"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่าน
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                placeholder="อย่างน้อย 8 ตัวอักษร"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                ยืนยันรหัสผ่าน
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
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
              {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div className="mt-8 mb-6 flex items-center justify-center space-x-4">
            <span className="h-px w-full bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider whitespace-nowrap">หรือ</span>
            <span className="h-px w-full bg-gray-200" />
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
