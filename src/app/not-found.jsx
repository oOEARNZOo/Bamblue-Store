'use client';

import { FileQuestion, Home, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full blur-lg opacity-50"></div>
            <div className="relative bg-white rounded-full p-6 shadow-lg">
              <FileQuestion className="w-12 h-12 text-blue-500" />
            </div>
          </div>
        </div>

        {/* 404 Message */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">
            404
          </h1>
          <p className="text-2xl font-semibold text-gray-700 mb-2">
            ไม่พบหน้านี้
          </p>
          <p className="text-gray-600">
            ขออภัย หน้าที่คุณค้นหาไม่มีอยู่ในระบบของเรา
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Home Button */}
          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 bg-[#dc6fd6] hover:bg-[#c55ebf] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            กลับหน้าหลัก
          </Link>

          {/* Shop Button */}
          <Link
            href="/products"
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            ไปดูสินค้า
          </Link>
        </div>

        {/* Fun Message */}
        <p className="text-center text-sm text-gray-500 mt-6">
          💡 ลองใส่ URL ถูกต้องดูอีกครั้ง
        </p>
      </div>
    </div>
  );
}
