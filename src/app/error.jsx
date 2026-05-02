'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({ error, reset }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Log error to monitoring service in production
    console.error('Error boundary caught:', error);
  }, [error]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-100 rounded-full blur-lg opacity-50"></div>
            <div className="relative bg-white rounded-full p-6 shadow-lg">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            มีบางอย่างผิดพลาด!
          </h1>
          <p className="text-gray-600 mb-4">
            ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด
          </p>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs font-mono text-red-700 overflow-auto max-h-24">
                {error.message || 'Unknown error'}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Retry Button */}
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 bg-[#dc6fd6] hover:bg-[#c55ebf] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            ลองใหม่
          </button>

          {/* Home Button */}
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            กลับหน้าหลัก
          </Link>
        </div>

        {/* Support Message */}
        <p className="text-center text-sm text-gray-500 mt-6">
          ถ้าปัญหายังคงเกิดขึ้น โปรดติดต่อ{' '}
          <Link
            href="/contact"
            className="text-[#dc6fd6] hover:underline font-semibold"
          >
            ฝ่ายสนับสนุน
          </Link>
        </p>
      </div>
    </div>
  );
}
