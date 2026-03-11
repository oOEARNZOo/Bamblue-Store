"use client";
import { useCart } from '../context/CartContext';
import Link from 'next/link';
// 🌟 นำเข้าไอคอน Plus และ Minus มาใช้ทำปุ่ม
import { Minus, Plus } from 'lucide-react';

export default function CartPage() {
  // 🌟 ดึง updateQuantity มาใช้งาน
  const { cartItems, removeFromCart, updateQuantity } = useCart();

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
                <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-24 h-32 bg-gray-100 overflow-hidden rounded shrink-0">
                      <img src={item.image} alt={item.nameEN} className="w-full h-full object-cover" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-zinc-900 tracking-wide">{item.nameEN}</h3>
                      <p className="text-xs text-gray-500 mb-2">{item.nameTH}</p>
                      <p className="font-medium text-gray-800 mb-3">฿{Number(item.price).toLocaleString()}</p>

                      {/* 🌟 ปุ่ม + / - */}
                      <div className="flex items-center border border-gray-300 w-28 rounded">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1} // ปิดปุ่มถ้าจำนวนเหลือแค่ 1
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
                          onClick={() => updateQuantity(item.id, 1)}
                          className="cursor-pointer w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#dc6fd6] transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
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

              {/* ✅ เปลี่ยนเป็น Link เพื่อพาไปหน้า Checkout จริงๆจัง */}
              <Link
                href="/checkout"
                className="inline-block cursor-pointer w-full md:w-auto bg-[#dc6fd6] hover:bg-[#c05ca8] text-white px-12 py-4 rounded text-sm tracking-widest font-bold shadow-md transition-colors text-center"
              >
                CHECKOUT
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}