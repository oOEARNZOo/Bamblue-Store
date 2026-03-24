"use client";
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

export default function CartPage() {
  // 🌟 ดึง updateQuantity มาใช้งาน
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // ตรวจสอบสถานะ Login
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ฟังก์ชันกดปุ่ม Checkout
  const handleCheckout = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    router.push('/checkout');
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      // ✅ เปลี่ยนมาใช้ Number(item.price) แบบตรงๆ ได้เลย
      return total + Number(item.price) * item.quantity;
    }, 0);
  };

  return (
    <main className="min-h-screen bg-white py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold tracking-widest text-zinc-900 mb-10 text-center">
          YOUR CART
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-md">
            <p className="text-gray-500 mb-6 tracking-wider">ตะกร้าของคุณยังว่างเปล่า</p>
            <Link href="/products" className="inline-block bg-zinc-900 hover:bg-gray-800 text-white px-8 py-3 rounded text-sm tracking-widest font-semibold transition-colors">
              CONTINUE SHOPPING
            </Link>
          </div>
        ) : (
          <div>
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.cartKey || item.id} className="flex items-center justify-between border-b border-gray-200 pb-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-32 bg-gray-100 overflow-hidden rounded shrink-0">
                      <img src={item.image} alt={item.nameEN} className="w-full h-full object-cover" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-zinc-900 tracking-wide">{item.nameEN}</h3>
                      <p className="text-xs text-gray-500 mb-1">{item.nameTH}</p>
                      {/* แสดงไซส์สินค้า */}
                      <p className="text-xs text-[#dc6fd6] font-medium mb-2">ไซส์: {item.size || 'M'}</p>
                      <p className="font-medium text-gray-800 mb-3">฿{Number(item.price).toLocaleString()}</p>

                      {/* ปุ่ม + / - */}
                      <div className="flex items-center border border-gray-300 w-28 rounded">
                        <button
                          onClick={() => updateQuantity(item.cartKey, -1)}
                          disabled={item.quantity <= 1}
                          className={`w-8 h-8 flex items-center justify-center transition-colors ${item.quantity <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-[#dc6fd6] cursor-pointer'}`}
                        >
                          <Minus size={14} />
                        </button>

                        <input
                          type="text"
                          readOnly
                          value={item.quantity}
                          className="w-12 h-8 text-center text-sm font-semibold focus:outline-none cursor-default bg-transparent"
                        />

                        <button
                          onClick={() => updateQuantity(item.cartKey, 1)}
                          className="cursor-pointer w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#dc6fd6] transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.cartKey)}
                    className="cursor-pointer text-xs text-gray-400 hover:text-red-500 tracking-wider transition-colors border-b border-transparent hover:border-red-500"
                  >
                    REMOVE
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-gray-50 p-8 rounded-md text-right">
              <div className="flex justify-between items-center mb-6 max-w-sm ml-auto">
                <span className="text-gray-600 tracking-wider">SUBTOTAL</span>
                <span className="text-2xl font-bold text-zinc-900">
                  ฿{calculateTotal().toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-6 tracking-wide">ภาษีและค่าจัดส่งจะถูกคำนวณในขั้นตอนชำระเงิน</p>

              {/* ✅ เปลี่ยนเป็น button เพื่อตรวจสอบ Login ก่อน */}
              <button
                onClick={handleCheckout}
                className="cursor-pointer w-full md:w-auto bg-[#dc6fd6] hover:bg-[#c05ca8] text-white px-12 py-4 rounded text-sm tracking-widest font-bold shadow-md transition-colors text-center"
              >
                CHECKOUT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🔐 Modal แจ้งเตือนให้ Login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-200">
            {/* ปุ่มปิด */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>

            {/* ไอคอนและข้อความ */}
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#dc6fd6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              <h3 className="text-xl font-bold text-zinc-900 mb-2">กรุณาเข้าสู่ระบบ</h3>
              <p className="text-gray-500 text-sm mb-6">
                คุณต้องเข้าสู่ระบบก่อนดำเนินการสั่งซื้อสินค้า
              </p>

              {/* ปุ่ม */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/login"
                  className="flex-1 bg-[#dc6fd6] hover:bg-[#c05ca8] text-white py-3 px-6 rounded-lg font-semibold transition-colors text-center"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="flex-1 border-2 border-[#dc6fd6] text-[#dc6fd6] hover:bg-pink-50 py-3 px-6 rounded-lg font-semibold transition-colors text-center"
                >
                  สมัครสมาชิก
                </Link>
              </div>

              <button
                onClick={() => setShowLoginModal(false)}
                className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                ช้อปต่อก่อน
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}