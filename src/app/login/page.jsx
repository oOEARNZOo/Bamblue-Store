"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/frontend/services/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'เข้าสู่ระบบสำเร็จ กำลังพาไปหน้าแรก...' });
      setTimeout(() => router.push('/'), 700);
    } catch (error) {
      console.error('Login error:', error.message);
      let errorText = 'เกิดข้อผิดพลาด: ' + error.message;

      if (error.message.includes('Invalid login credentials')) {
        errorText = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
      } else if (error.message.includes('Email not confirmed')) {
        errorText = 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ';
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
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute bottom-16 left-16 z-10 max-w-lg">
          <h2 className="text-4xl font-bold text-white drop-shadow-lg mb-3 tracking-wider">
            YOUTH ELEVATED
          </h2>
          <p className="text-lg text-white/90 drop-shadow-md font-light tracking-wide">
            เข้าสู่ระบบเพื่อจัดการโปรไฟล์ รายการสั่งซื้อ และใช้งานสิทธิ์สมาชิกของ Bamblue store
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-gray-50 md:bg-white">
        <div className="w-full max-w-md bg-white p-8 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-gray-100 md:border-none">
          <div className="text-center md:text-left mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">ยินดีต้อนรับกลับมา</h1>
            <p className="text-gray-500 text-sm">ลงชื่อเข้าใช้ด้วยอีเมลและรหัสผ่านที่สมัครไว้</p>
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

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  รหัสผ่าน
                </label>
                <Link href="/forgot-password" className="text-xs font-semibold text-pink-500 hover:text-pink-600 transition-colors">
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                placeholder="รหัสผ่านของคุณ"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-gray-400 text-white py-3.5 rounded-lg font-bold tracking-wider transition-all shadow-md mt-4 text-sm cursor-pointer"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="mt-8 mb-6 flex items-center justify-center space-x-4">
            <span className="h-px w-full bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider whitespace-nowrap">หรือ</span>
            <span className="h-px w-full bg-gray-200" />
          </div>

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
