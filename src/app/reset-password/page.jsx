"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMessage({
          type: 'error',
          text: 'ลิงก์รีเซ็ตรหัสผ่านหมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่',
        });
      } else {
        setHasValidSession(true);
      }
      setIsCheckingSession(false);
    };

    checkSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (password.length < 8) {
      setMessage({ type: 'error', text: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage({ type: 'success', text: 'ตั้งรหัสผ่านใหม่สำเร็จ กำลังพาไปหน้าเข้าสู่ระบบ...' });
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => router.push('/login'), 1200);
    } catch (error) {
      console.error('Reset password update error:', error.message);
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาด: ' + error.message });
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
            NEW PASSWORD
          </h2>
          <p className="text-lg text-white/90 drop-shadow-md font-light tracking-wide">
            ตั้งรหัสผ่านใหม่ให้บัญชี Bamblue store ของคุณ
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-gray-50 md:bg-white">
        <div className="w-full max-w-md bg-white p-8 md:p-0 rounded-2xl md:rounded-none shadow-sm md:shadow-none border border-gray-100 md:border-none">
          <div className="text-center md:text-left mb-10">
            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto md:mx-0 mb-4">
              <KeyRound size={32} className="text-[#dc6fd6]" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">ตั้งรหัสผ่านใหม่</h1>
            <p className="text-gray-500 text-sm">กรอกรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
          </div>

          {isCheckingSession ? (
            <div className="flex items-center justify-center py-10 text-gray-500">
              <Loader2 className="animate-spin h-6 w-6 mr-2" />
              กำลังตรวจสอบลิงก์...
            </div>
          ) : (
            <>
              {message.text && (
                <div className={`mb-6 p-4 rounded-lg text-sm font-medium border ${
                  message.type === 'error'
                    ? 'bg-red-50 text-red-600 border-red-100'
                    : 'bg-green-50 text-green-600 border-green-100'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    รหัสผ่านใหม่
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    ยืนยันรหัสผ่านใหม่
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !hasValidSession}
                  className="w-full bg-[#dc6fd6] hover:bg-[#c05ca8] disabled:bg-gray-400 text-white py-3.5 rounded-lg font-bold tracking-wider transition-all shadow-md text-sm cursor-pointer"
                >
                  {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-gray-600">
                กลับไปหน้า{' '}
                <Link href="/login" className="font-bold text-[#dc6fd6] hover:text-[#c05ca8] transition-colors">
                  เข้าสู่ระบบ
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
