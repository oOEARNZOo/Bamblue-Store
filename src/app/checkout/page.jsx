"use client";
import React, { useRef, useState } from 'react';
import { useCart } from '@/frontend/context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CreditCard, Truck, QrCode, ArrowLeft, XCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/frontend/services/supabaseClient';
import PromptPayQR from '@/frontend/components/PromptPayQR';
import { validateCheckoutForm, getErrorMessage } from '@/frontend/utils/validation';

// Stock is checked atomically by /api/checkout; this preserves the existing UX guard.
const validateCartStock = async () => ({ isValid: true, message: '' });

const CHECKOUT_IDEMPOTENCY_STORAGE_KEY = 'bamblue_checkout_idempotency';

const createCheckoutSignature = ({ cartItems, formData, paymentMethod }) => JSON.stringify({
  paymentMethod,
  customer: {
    email: formData.email,
    firstName: formData.firstName,
    lastName: formData.lastName,
    address: formData.address,
    province: formData.province,
    zipcode: formData.zipcode,
    phone: formData.phone,
  },
  items: cartItems.map((item) => ({
    id: item.id,
    size: item.size || 'M',
    quantity: item.quantity,
  })).sort((a, b) => `${a.id}-${a.size}`.localeCompare(`${b.id}-${b.size}`)),
});

const createClientKey = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const getCheckoutIdempotencyKey = (signature) => {
  if (typeof sessionStorage === 'undefined') return createClientKey();

  try {
    const saved = JSON.parse(sessionStorage.getItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY) || '{}');
    if (saved.signature === signature && saved.key) return saved.key;

    const key = createClientKey();
    sessionStorage.setItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY, JSON.stringify({ signature, key }));
    return key;
  } catch {
    return createClientKey();
  }
};

const clearCheckoutIdempotencyKey = () => {
  if (typeof sessionStorage === 'undefined') return;

  try {
    sessionStorage.removeItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY);
  } catch {
    // Storage cleanup is best-effort; server idempotency still protects duplicate submits.
  }
};

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart(); 
  const router = useRouter();
  const submittingRef = useRef(false);
  
  const [paymentMethod, setPaymentMethod] = useState('qr');

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

  // 🌟 State สำหรับ PromptPay QR Modal
  const [showQRModal, setShowQRModal] = useState(false);
  const [currentOrderNumber, setCurrentOrderNumber] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [currentOrderTotal, setCurrentOrderTotal] = useState(0);

  // 🌟 State สำหรับเก็บ validation errors
  const [formErrors, setFormErrors] = useState({});

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
    
    // จำกัดให้ใส่ได้เฉพาะตัวเลขสำหรับบางฟิลด์
    if (name === 'zipcode') {
      // รหัสไปรษณีย์: ตัวเลขเท่านั้น, สูงสุด 5 หลัก
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 5);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    
    if (name === 'phone') {
      // เบอร์โทร: ตัวเลขเท่านั้น, สูงสุด 10 หลัก
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    
    if (name === 'firstName' || name === 'lastName' || name === 'province') {
      // ชื่อ, นามสกุล, จังหวัด: ตัวอักษรเท่านั้น (ไทย/อังกฤษ)
      const textValue = value.replace(/[0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: textValue }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชันยืนยันสั่งซื้อ
  const handleConfirmOrder = async () => {
    if (isSubmitting || submittingRef.current) return;
    submittingRef.current = true;

    // ✅ ตรวจสอบ validation ก่อน
    const validation = validateCheckoutForm(formData);

    if (!validation.isValid) {
      submittingRef.current = false;
      setFormErrors(validation.errors);
      setPopup({
        isOpen: true,
        type: 'error',
        message: getErrorMessage(validation.errors)
      });
      return;
    }

    // ✅ ตรวจสอบว่าตะกร้าไม่ว่าง
    if (!cartItems || cartItems.length === 0) {
      submittingRef.current = false;
      setPopup({
        isOpen: true,
        type: 'error',
        message: 'ตะกร้าของคุณว่างเปล่า กรุณาเลือกสินค้า'
      });
      return;
    }

    try {
      const stockValidation = await validateCartStock();

      if (!stockValidation.isValid) {
        submittingRef.current = false;
        setPopup({
          isOpen: true,
          type: 'error',
          message: stockValidation.message
        });
        return;
      }
    } catch (error) {
      console.error('Error validating stock:', error);
      setPopup({
        isOpen: true,
        type: 'error',
        message: 'ไม่สามารถตรวจสอบสต็อกสินค้าล่าสุดได้ กรุณาลองใหม่อีกครั้ง'
      });
      submittingRef.current = false;
      return;
    }

    // ✅ ตรวจสอบราคารวม
    if (total <= 0) {
      submittingRef.current = false;
      setPopup({
        isOpen: true,
        type: 'error',
        message: 'ราคารวมไม่ถูกต้อง'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // ดึง user ID จาก Supabase Auth
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;

      if (!session?.access_token) {
        setPopup({
          isOpen: true,
          type: 'error',
          message: 'กรุณาเข้าสู่ระบบก่อนสั่งซื้อ'
        });
        setIsSubmitting(false);
        submittingRef.current = false;
        return;
      }

      const checkoutSignature = createCheckoutSignature({ cartItems, formData, paymentMethod });
      const idempotencyKey = getCheckoutIdempotencyKey(checkoutSignature);

      const checkoutResponse = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.id,
            size: item.size || 'M',
            quantity: item.quantity,
          })),
          customer: {
            email: formData.email || session.user?.email || '',
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            province: formData.province,
            zipcode: formData.zipcode,
            phone: formData.phone,
          },
          paymentMethod,
          idempotencyKey,
        }),
      });

      const checkoutResult = await checkoutResponse.json().catch(() => ({}));

      if (!checkoutResponse.ok) {
        throw new Error(checkoutResult.error || 'Unable to create order.');
      }

      const newOrder = checkoutResult.order;
      const orderNumber = newOrder?.order_number;
      
      // ล้าง validation errors
      setFormErrors({});

      // ถ้าเลือก PromptPay ให้แสดง QR Code Modal
      if (paymentMethod === 'qr') {
        setCurrentOrderNumber(orderNumber);
        setCurrentOrderId(newOrder.id);
        setCurrentOrderTotal(Number(newOrder?.total) || total);
        setShowQRModal(true);
        setIsSubmitting(false);
        submittingRef.current = false;
        return;
      }
      
      if (clearCart) clearCart();
      clearCheckoutIdempotencyKey();

      // สั่งซื้อสำเร็จ (สำหรับวิธีอื่น)
      setPopup({
        isOpen: true,
        type: 'success',
        message: `🎉 สั่งซื้อสำเร็จ!\nเลขที่ออเดอร์: ${orderNumber}\nขอบคุณที่อุดหนุน Bamblue Store ครับ`
      });
      
      // Redirect ไปหน้า orders
      router.push('/orders');

    } catch (err) {
      console.error("Error saving order:", err);
      setPopup({
        isOpen: true,
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการสั่งซื้อ: ' + err.message
      });
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // ฟังก์ชันปิด Pop-up
  const closePopup = () => {
    // ถ้าเป็น Pop-up สำเร็จ พอกดปิดให้เด้งไปหน้า Orders เลย
    if (popup.type === 'success') {
      router.push('/orders');
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
                      inputMode="numeric"
                      name="zipcode"
                      value={formData.zipcode}
                      onChange={handleChange}
                      placeholder="เช่น 10110"
                      maxLength={5}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] outline-none text-sm" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">เบอร์โทรศัพท์</label>
                  <input 
                    type="tel" 
                    inputMode="numeric"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="เช่น 0812345678"
                    maxLength={10}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#dc6fd6] outline-none text-sm" 
                  />
                </div>
              </div>
            </div>

            {/* กล่อง 3: วิธีการชำระเงิน */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-zinc-900 mb-6 tracking-wide">วิธีการชำระเงิน</h2>

              <div className="space-y-3">
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

                <label className="flex items-center p-4 border rounded-xl border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed">
                  <input type="radio" name="payment" value="credit" checked={paymentMethod === 'credit'} disabled className="text-[#dc6fd6] focus:ring-[#dc6fd6]" />
                  <CreditCard className="mx-4 text-gray-500" size={24} />
                  <span className="font-medium text-gray-500">บัตรเครดิต / เดบิต (เร็ว ๆ นี้)</span>
                </label>
              </div>
            </div>

          </div>

          {/* ฝั่งขวา: สรุปออเดอร์ */}
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

      {/* 🏦 PromptPay QR Code Modal */}
      {showQRModal && (
        <PromptPayQR
          phoneNumber="0917484417"
          amount={currentOrderTotal || total}
          orderNumber={currentOrderNumber}
          mockMode={true} // เปลี่ยนเป็น false เมื่อต้องการใช้ระบบจริง
          onClose={() => {
            setShowQRModal(false);
            setPopup({
              isOpen: true,
              type: 'error',
              message: 'ออเดอร์ยังไม่ถูกยืนยันการชำระเงิน ตะกร้ายังอยู่ให้กลับมาชำระได้'
            });
          }}
          onSuccess={async (paymentData) => {
            
            // อัปเดตสถานะ order เป็น paid (ชำระเงินแล้ว) สำหรับ Mock Mode
            // หรือ pending_payment_verification สำหรับ Real Mode
            const { data: { session }, error: authError } = await supabase.auth.getSession();
            if (authError) throw authError;

            if (!session?.access_token) {
              throw new Error('Please sign in before confirming payment.');
            }
            
            
            const confirmResponse = await fetch('/api/orders/confirm-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                orderId: currentOrderId,
                paymentData,
              }),
            });

            const confirmResult = await confirmResponse.json().catch(() => ({}));

            if (!confirmResponse.ok) {
              throw new Error(confirmResult.error || 'Unable to confirm payment.');
            }
            
            
            setShowQRModal(false);
            if (clearCart) clearCart();
            clearCheckoutIdempotencyKey();
            router.push('/orders');
          }}
        />
      )}
    </main>
  );
}
