"use client";
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { CreditCard, Truck, QrCode, ArrowLeft } from 'lucide-react';

export default function CheckoutPage() {
  const { cartItems } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('credit'); // เก็บสถานะวิธีชำระเงิน

  // 🧮 ฟังก์ชันคำนวณราคารวม
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      // ✅ เปลี่ยนมาใช้ Number(item.price) แบบตรงๆ
      return total + Number(item.price) * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = subtotal > 2000 ? 0 : 50; // โปรโมชั่นส่งฟรี
  const total = subtotal + shippingFee;

  // ถ้าเข้าหน้านี้แต่ไม่มีของในตะกร้า ให้บอกให้กลับไปช้อปปิ้ง
  if (cartItems.length === 0) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center px-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">ไม่มีสินค้าให้ชำระเงิน</h2>
        <Link href="/products" className="text-[#dc6fd6] hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> กลับไปเลือกสินค้าก่อนนะ
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ลิงก์กลับไปตะกร้า */}
        <Link href="/cart" className="inline-flex items-center text-sm text-gray-500 hover:text-zinc-900 mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> กลับไปหน้าตะกร้าสินค้า
        </Link>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* 📝 ฝั่งซ้าย: ฟอร์มกรอกข้อมูล */}
          <div className="w-full lg:w-3/5 space-y-8">

            {/* กล่อง 1: ข้อมูลการติดต่อ */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-zinc-900 mb-6 tracking-wide">ข้อมูลการติดต่อ</h2>
              <div>
                <label className="block text-sm text-gray-700 mb-2">อีเมล (สำหรับส่งใบเสร็จ)</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* กล่อง 2: ที่อยู่จัดส่ง */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-zinc-900 mb-6 tracking-wide">ที่อยู่สำหรับจัดส่ง</h2>
              <form className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">ชื่อ</label>
                    <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">นามสกุล</label>
                    <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] outline-none text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">ที่อยู่ (บ้านเลขที่, ซอย, ถนน)</label>
                  <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] outline-none text-sm" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">จังหวัด</label>
                    <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">รหัสไปรษณีย์</label>
                    <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] outline-none text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                  <input type="tel" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] outline-none text-sm" />
                </div>
              </form>
            </div>

            {/* กล่อง 3: วิธีการชำระเงิน */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-zinc-900 mb-6 tracking-wide">วิธีการชำระเงิน</h2>

              <div className="space-y-3">
                {/* Option 1: บัตรเครดิต */}
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'credit' ? 'border-[#dc6fd6] bg-pink-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="credit" checked={paymentMethod === 'credit'} onChange={() => setPaymentMethod('credit')} className="text-[#dc6fd6] focus:ring-[#dc6fd6]" />
                  <CreditCard className="mx-4 text-gray-500" size={24} />
                  <span className="font-medium text-gray-900">บัตรเครดิต / เดบิต</span>
                </label>

                {/* Option 2: สแกนจ่าย */}
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'qr' ? 'border-[#dc6fd6] bg-pink-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="qr" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} className="text-[#dc6fd6] focus:ring-[#dc6fd6]" />
                  <QrCode className="mx-4 text-gray-500" size={24} />
                  <span className="font-medium text-gray-900">สแกนจ่าย (PromptPay)</span>
                </label>

                {/* Option 3: เก็บเงินปลายทาง */}
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#dc6fd6] bg-pink-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-[#dc6fd6] focus:ring-[#dc6fd6]" />
                  <Truck className="mx-4 text-gray-500" size={24} />
                  <span className="font-medium text-gray-900">เก็บเงินปลายทาง (COD)</span>
                </label>
              </div>
            </div>

          </div>

          {/* 🧾 ฝั่งขวา: สรุปออเดอร์ (Order Summary) */}
          <div className="w-full lg:w-2/5">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold text-zinc-900 mb-6 tracking-wide">สรุปคำสั่งซื้อ</h2>

              {/* รายการสินค้าที่ดึงมาจาก CartContext */}
              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative">
                      <img src={item.image} alt={item.nameEN} className="w-16 h-20 object-cover rounded bg-gray-100" />
                      <span className="absolute -top-2 -right-2 bg-zinc-900 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.nameEN}</h4>
                      <p className="text-xs text-gray-500">{item.nameTH}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        ฿{(Number(item.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* สรุปยอดเงิน */}
              <div className="border-t border-gray-100 pt-6 space-y-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>ยอดรวมสินค้า</span>
                  <span>฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ค่าจัดส่ง</span>
                  <span>{shippingFee === 0 ? <span className="text-green-500 font-medium">ส่งฟรี</span> : `฿${shippingFee.toLocaleString()}`}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 mt-6 pt-6 flex justify-between items-end mb-8">
                <span className="text-base font-bold text-gray-900">ยอดชำระสุทธิ</span>
                <span className="text-2xl font-bold text-[#dc6fd6]">฿{total.toLocaleString()}</span>
              </div>

              {/* ปุ่มสั่งซื้อ (ตอนนี้เป็นแค่ Link เตรียมไว้ต่อยอด) */}
              <Link
                href="/success"
                className="block w-full bg-[#dc6fd6] hover:bg-[#c05ca8] text-white py-4 rounded-xl text-center text-sm tracking-widest font-bold shadow-md transition-colors cursor-pointer"
              >
                ยืนยันการสั่งซื้อ (PLACE ORDER)
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}