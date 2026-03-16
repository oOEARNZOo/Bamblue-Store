"use client";
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, Truck, QrCode, ArrowLeft, XCircle, CheckCircle } from 'lucide-react'; // 🌟 เพิ่ม Icon สำหรับ Pop-up
import { supabase } from '../../lib/supabase'; 

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart(); 
  const router = useRouter();
  
  const [paymentMethod, setPaymentMethod] = useState('credit'); 

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    province: '',
    zipcode: '',
    phone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🌟 1. สร้าง State สำหรับจัดการ Pop-up
  const [popup, setPopup] = useState({
    isOpen: false,
    type: 'error', // 'error' หรือ 'success'
    message: ''
  });

  // 🧮 ฟังก์ชันคำนวณราคารวม
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + Number(item.price) * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shippingFee = subtotal > 2000 ? 0 : 50; 
  const total = subtotal + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชันยืนยันสั่งซื้อ
  const handleConfirmOrder = async () => {
    // Validate form
    if (!formData.firstName || !formData.phone || !formData.address) {
      setPopup({
        isOpen: true,
        type: 'error',
        message: 'กรุณากรอกชื่อ ที่อยู่ และเบอร์โทรศัพท์ให้ครบถ้วนด้วยนะครับ'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // ดึง user ID จาก Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;

      if (!user) {
        setPopup({
          isOpen: true,
          type: 'error',
          message: 'กรุณาเข้าสู่ระบบก่อนสั่งซื้อ'
        });
        setIsSubmitting(false);
        return;
      }

      // สร้าง order number (format: ORD-2026-00001)
      const year = new Date().getFullYear();
      const randomNum = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
      const orderNumber = `ORD-${year}-${randomNum}`;

      // สร้างข้อมูล order
      const orderData = {
        user_id: user.id,
        order_number: orderNumber,
        status: 'pending',
        email: formData.email || user.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        shipping_address: formData.address,
        shipping_province: formData.province,
        shipping_zipcode: formData.zipcode,
        payment_method: paymentMethod,
        subtotal: subtotal,
        shipping_fee: shippingFee,
        total: total
      };

      // บันทึก order ลง Supabase
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderError) throw orderError;

      // สร้าง order items
      const orderItems = cartItems.map(item => ({
        order_id: newOrder.id,
        product_id: item.id,
        product_name_en: item.nameEN,
        product_name_th: item.nameTH,
        product_image: item.image,
        price: Number(item.price),
        quantity: item.quantity,
        size: item.size || 'M'
      }));

      // บันทึก order items ลง Supabase
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // สั่งซื้อสำเร็จ
      setPopup({
        isOpen: true,
        type: 'success',
        message: `🎉 สั่งซื้อสำเร็จ!\nเลขที่ออเดอร์: ${orderNumber}\nขอบคุณที่อุดหนุน Bamblue Store ครับ`
      });
      
      // ล้างตะกร้า
      if (clearCart) clearCart();

    } catch (err) {
      console.error("Error saving order:", err);
      setPopup({
        isOpen: true,
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการสั่งซื้อ: ' + err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ฟังก์ชันปิด Pop-up
  const closePopup = () => {
    // ถ้าเป็น Pop-up สำเร็จ พอกดปิดให้เด้งไปหน้า Success เลย
    if (popup.type === 'success') {
      router.push('/success');
    }
    setPopup({ ...popup, isOpen: false });
  };

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
    <main className="min-h-screen bg-gray-50/50 py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none transition-all text-sm"
                />
              </div>
            </div>

            {/* กล่อง 2: ที่อยู่จัดส่ง */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-zinc-900 mb-6 tracking-wide">ที่อยู่สำหรับจัดส่ง</h2>
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">ชื่อ</label>
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] outline-none text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">นามสกุล</label>
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] outline-none text-sm" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">ที่อยู่ (บ้านเลขที่, ซอย, ถนน)</label>
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] outline-none text-sm" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">จังหวัด</label>
                    <input 
                      type="text" 
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] outline-none text-sm" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">รหัสไปรษณีย์</label>
                    <input 
                      type="text" 
                      name="zipcode"
                      value={formData.zipcode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] outline-none text-sm" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] outline-none text-sm" 
                  />
                </div>
              </div>
            </div>

            {/* กล่อง 3: วิธีการชำระเงิน */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-zinc-900 mb-6 tracking-wide">วิธีการชำระเงิน</h2>

              <div className="space-y-3">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'credit' ? 'border-[#dc6fd6] bg-pink-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="credit" checked={paymentMethod === 'credit'} onChange={() => setPaymentMethod('credit')} className="text-[#dc6fd6] focus:ring-[#dc6fd6]" />
                  <CreditCard className="mx-4 text-gray-500" size={24} />
                  <span className="font-medium text-gray-900">บัตรเครดิต / เดบิต</span>
                </label>

                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'qr' ? 'border-[#dc6fd6] bg-pink-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="qr" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} className="text-[#dc6fd6] focus:ring-[#dc6fd6]" />
                  <QrCode className="mx-4 text-gray-500" size={24} />
                  <span className="font-medium text-gray-900">สแกนจ่าย (PromptPay)</span>
                </label>

                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#dc6fd6] bg-pink-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="text-[#dc6fd6] focus:ring-[#dc6fd6]" />
                  <Truck className="mx-4 text-gray-500" size={24} />
                  <span className="font-medium text-gray-900">เก็บเงินปลายทาง (COD)</span>
                </label>
              </div>
            </div>

          </div>

          {/* 🧾 ฝั่งขวา: สรุปออเดอร์ */}
          <div className="w-full lg:w-2/5">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold text-zinc-900 mb-6 tracking-wide">สรุปคำสั่งซื้อ</h2>

              <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4">
                    <div className="relative">
                      <img src={item.image} alt={item.nameEN} className="w-16 h-20 object-cover rounded bg-gray-100" />
                      <span className="absolute -top-2 -right-2 bg-zinc-900 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.nameEN}</h4>
                      <p className="text-xs text-gray-500">{item.nameTH} (ไซส์ {item.size || 'M'})</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        ฿{(Number(item.price) * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

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

              <button
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className="block w-full bg-[#dc6fd6] hover:bg-[#c05ca8] disabled:bg-gray-400 text-white py-4 rounded-xl text-center text-sm tracking-widest font-bold shadow-md transition-colors cursor-pointer"
              >
                {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันการสั่งซื้อ (PLACE ORDER)'}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 🌟 4. ตัว UI ของ Pop-up Modal */}
      {popup.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm transform transition-all text-center animate-in fade-in zoom-in duration-200">
            {popup.type === 'error' ? (
              <XCircle className="mx-auto text-red-500 mb-4" size={56} />
            ) : (
              <CheckCircle className="mx-auto text-[#dc6fd6] mb-4" size={56} />
            )}
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {popup.type === 'error' ? 'แจ้งเตือน' : 'สำเร็จ!'}
            </h3>
            
            <p className="text-gray-600 mb-8 text-sm leading-relaxed">
              {popup.message}
            </p>
            
            <button
              onClick={closePopup}
              className={`w-full py-3 rounded-xl font-bold text-white transition-colors ${
                popup.type === 'error' 
                  ? 'bg-zinc-900 hover:bg-zinc-800' 
                  : 'bg-[#dc6fd6] hover:bg-[#c05ca8]'
              }`}
            >
              ตกลง
            </button>
          </div>
        </div>
      )}
    </main>
  );
}