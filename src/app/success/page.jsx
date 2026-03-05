import React from 'react';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, Home, Package } from 'lucide-react';

export default function SuccessPage() {
  // สร้างเลขที่ออเดอร์จำลอง (Mock Order Number) สำหรับแสดงผลหน้า UI
  const mockOrderNumber = "BAM-" + Math.floor(10000000 + Math.random() * 90000000);

  return (
    <main className="min-h-[80vh] flex items-center justify-center bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-100 text-center transform transition-all hover:-translate-y-1 hover:shadow-md duration-300">
        
        {/* 🌟 ไอคอนติ๊กถูก (Success Icon) */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-green-100 text-green-500 p-4 rounded-full flex items-center justify-center">
              <CheckCircle size={48} strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* ข้อความยืนยัน */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-wide">
          สั่งซื้อสำเร็จ!
        </h1>
        <p className="text-gray-500 mb-8">
          ขอบคุณที่สั่งซื้อสินค้ากับ Bamblue store นะคะ <br className="hidden sm:block" />
          เราได้รับรายการสั่งซื้อของคุณเรียบร้อยแล้ว
        </p>

        {/* 📦 กล่องข้อมูลออเดอร์ */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100 text-left">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <span className="text-gray-500 text-sm flex items-center gap-2">
              <Package size={16} /> หมายเลขคำสั่งซื้อ
            </span>
            <span className="font-bold text-gray-900 tracking-wider">
              {mockOrderNumber}
            </span>
          </div>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• ระบบได้ส่งใบเสร็จรับเงินไปที่อีเมลของคุณแล้ว</p>
            <p>• คุณสามารถติดตามสถานะสินค้าได้ผ่านลิงก์ในอีเมล</p>
          </div>
        </div>

        {/* 🔘 ปุ่มดำเนินการต่อ */}
        <div className="space-y-4">
          <Link 
            href="/products" 
            className="w-full flex items-center justify-center gap-2 bg-[#dc6fd6] hover:bg-[#c05ca8] text-white py-4 rounded-xl font-bold tracking-wider transition-all shadow-md text-sm"
          >
            <ShoppingBag size={18} />
            ช้อปปิ้งสินค้าต่อ
          </Link>
          
          <Link 
            href="/" 
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 py-4 rounded-xl font-bold tracking-wider transition-all border border-gray-200 text-sm"
          >
            <Home size={18} />
            กลับหน้าหลัก
          </Link>
        </div>

      </div>
    </main>
  );
}