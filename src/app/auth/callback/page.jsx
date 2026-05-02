"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

function getSafeNextPath(value) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }

  return value;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState('กำลังยืนยันบัญชี...');

  useEffect(() => {
    const handleCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      const next = getSafeNextPath(url.searchParams.get('next'));

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (!data.session) {
            throw new Error('ไม่พบ session จาก Supabase');
          }
        }

        router.replace(next);
      } catch (error) {
        console.error('Auth callback error:', error);
        setMessage('ยืนยันบัญชีไม่สำเร็จ กรุณาลองกดลิงก์จากอีเมลอีกครั้ง');
        setTimeout(() => router.replace('/login'), 1800);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center bg-white border border-gray-100 rounded-2xl shadow-sm p-8 max-w-sm w-full">
        <Loader2 className="animate-spin h-10 w-10 text-[#dc6fd6] mx-auto mb-4" />
        <p className="text-sm font-medium text-gray-700">{message}</p>
      </div>
    </main>
  );
}
