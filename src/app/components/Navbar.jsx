"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, User, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext'; 

export default function Navbar() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  
  // 🌟 State สำหรับเปิด/ปิด ตะกร้า และ ค้นหา
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // 🌟 Refs สำหรับตรวจจับการคลิกนอกกรอบ
  const cartRef = useRef(null);
  const searchRef = useRef(null);
  
  const cartItemCount = cartItems ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => {
      const priceNumber = parseInt(item.price.replace(/[^0-9]/g, ''), 10);
      return total + (priceNumber * item.quantity);
    }, 0);
  };

  // 🌟 ฟังก์ชันปิดตะกร้าและค้นหาเมื่อคลิกที่อื่น
  useEffect(() => {
    function handleClickOutside(event) {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ข้อมูลจำลองสำหรับหน้าต่างค้นหา
  const popularSearches = ['กระเป๋า', 'กางเกง', 'เสื้อกันหนาว', 'รองเท้า'];
  const recentSearches = ['m08z011', 'mttza98', 'm', 'mssz315'];

  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
        
        {/* 🌸 ฝั่งซ้าย: โลโก้ร้าน */}
        <Link href="/" className="cursor-pointer text-2xl font-bold tracking-tight">
          Bamblue <span className="text-pink-400">store</span>
        </Link>

        {/* 📝 ตรงกลาง: เมนู */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
          <Link href="/" className="cursor-pointer hover:text-pink-400 transition-colors">หน้าหลัก</Link>
          <Link href="/products" className="cursor-pointer hover:text-pink-400 transition-colors">สินค้าทั้งหมด</Link>
          <Link href="/reviews" className="cursor-pointer hover:text-pink-400 transition-colors">รีวิวจากลูกค้า</Link>
          <Link href="/promotions" className="cursor-pointer hover:text-pink-400 transition-colors">ข่าวสารโปรโมชั่น</Link>
          <Link href="/contact" className="cursor-pointer hover:text-pink-400 transition-colors">ติดต่อเรา</Link>
        </div>

        {/* 🔍 ฝั่งขวา: ไอคอนต่างๆ */}
        <div className="flex items-center space-x-5 text-gray-700">
          
          {/* 🌟 ปุ่มค้นหา */}
          <button 
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              setIsCartOpen(false); // ปิดตะกร้าถ้าเปิดอยู่
            }}
            className={`cursor-pointer transition-colors border-none bg-transparent py-2 ${isSearchOpen ? 'text-pink-400' : 'hover:text-pink-400'}`}
          >
            <Search size={22} strokeWidth={1.5} />
          </button>
          
          <button className="cursor-pointer hover:text-pink-400 transition-colors border-none bg-transparent py-2">
            <User size={22} strokeWidth={1.5} />
          </button>
          
          {/* 🛒 โซนตะกร้าสินค้า */}
          <div className="relative" ref={cartRef}>
            <button 
              onClick={() => {
                setIsCartOpen(!isCartOpen);
                setIsSearchOpen(false); // ปิดค้นหาถ้าเปิดอยู่
              }}
              className="cursor-pointer relative hover:text-pink-400 transition-colors flex items-center py-2 bg-transparent border-none"
            >
              <ShoppingCart size={22} strokeWidth={1.5} />
              {cartItemCount > 0 && (
                <span className="absolute top-0 -right-2 bg-pink-400 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mini-Cart Dropdown */}
            {isCartOpen && (
              <div className="absolute top-full right-0 mt-3 w-80 bg-white shadow-xl border border-gray-100 rounded-lg p-4 z-50 cursor-default">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800">
                    ตะกร้าสินค้า ({cartItemCount} ชิ้น)
                  </h3>
                  <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-pink-400 text-xs cursor-pointer">
                    ปิด ✕
                  </button>
                </div>
                
                {!cartItems || cartItems.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">ไม่มีสินค้าในตะกร้า</p>
                ) : (
                  <>
                    <div className="max-h-[60vh] overflow-y-auto space-y-4 mb-4 pr-1">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex gap-3">
                          <img src={item.image} alt={item.nameEN} className="w-16 h-20 object-cover rounded shrink-0 bg-gray-50" />
                          <div className="grow flex flex-col justify-center">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.nameEN}</p>
                            <p className="text-xs text-pink-500 font-medium mb-2">{item.price}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center border border-gray-200 rounded w-20 h-7">
                                <button onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1} className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-pink-400 disabled:opacity-30 cursor-pointer"><Minus size={12} /></button>
                                <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-pink-400 cursor-pointer"><Plus size={12} /></button>
                              </div>
                              <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 cursor-pointer p-1 transition-colors"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-gray-700">ราคาสินค้ารวม</span>
                        <span className="text-lg font-bold text-zinc-900">฿{calculateTotal().toLocaleString()}</span>
                      </div>
                      <Link href="/cart" onClick={() => setIsCartOpen(false)} className="cursor-pointer block w-full text-center py-3 px-4 bg-pink-400 text-white rounded text-sm font-bold hover:bg-pink-500 transition-colors shadow-sm">
                        ดำเนินการสั่งซื้อ
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🌟 Search Dropdown Panel (เด้งลงมาแบบ Full-width) */}
      {isSearchOpen && (
        <div ref={searchRef} className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 py-8 px-6 z-40 cursor-default">
          <div className="max-w-4xl mx-auto">
            
            {/* ช่อง Input ค้นหา */}
            <div className="flex items-center gap-4 mb-10">
              <div className="grow flex items-center bg-gray-100 rounded-full px-5 py-3">
                <Search size={20} className="text-gray-500 mr-3 shrink-0" />
                <input 
                  type="text" 
                  placeholder="ค้นหา" 
                  className="w-full bg-transparent border-none focus:outline-none text-gray-800 text-base"
                  autoFocus
                />
              </div>
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="text-sm font-bold text-gray-600 hover:text-pink-400 cursor-pointer whitespace-nowrap"
              >
                ยกเลิก
              </button>
            </div>

            {/* หมวดหมู่ค้นหา */}
            <div className="space-y-8">
              {/* คำค้นหายอดนิยม */}
              <div>
                <h4 className="text-sm font-bold text-gray-500 mb-4">คำค้นหายอดนิยม</h4>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {popularSearches.map((term, index) => (
                    <button 
                      key={index}
                      className="cursor-pointer px-4 py-1.5 md:px-5 md:py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-pink-400 hover:text-pink-400 transition-colors bg-white"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* สินค้าที่เพิ่งค้นหา */}
              <div>
                <h4 className="text-sm font-bold text-gray-500 mb-4">สินค้าที่เพิ่งค้นหา</h4>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {recentSearches.map((term, index) => (
                    <button 
                      key={index}
                      className="cursor-pointer px-4 py-1.5 md:px-5 md:py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-pink-400 hover:text-pink-400 transition-colors bg-white"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}