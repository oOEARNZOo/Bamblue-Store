"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, User, ShoppingCart, Minus, Plus, Trash2, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRouter } from 'next/navigation';
import { productsData } from '../../data/products';

export default function Navbar() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  // 🌟 State สำหรับเปิด/ปิด ตะกร้า และ ค้นหา
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ข้อมูลจำลองสำหรับหน้าต่างค้นหา
  const popularSearches = ['กระเป๋า', 'กางเกง', 'เสื้อกันหนาว', 'รองเท้า'];
  const [recentSearches, setRecentSearches] = useState([]);

  // ดึงประวัติการค้นหาจาก localStorage ตอนโหลดหน้าเว็บครั้งแรก
  useEffect(() => {
    const savedSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    setRecentSearches(savedSearches);
  }, []);

  // 🎯 ฟังก์ชันจัดการตอนกดค้นหา (พิมพ์เสร็จแล้วกด Enter หรือคลิกเลือก)
  const handleSearch = (term) => {
    if (!term.trim()) return;

    const updatedSearches = [term, ...recentSearches.filter(item => item !== term)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

    setIsSearchOpen(false);
    setSearchInput('');
    setSuggestions([]);
    router.push(`/products?search=${encodeURIComponent(term)}`);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value.trim().length > 0) {
      const q = value.toLowerCase();
      const filtered = productsData.filter(p =>
        p.nameEN.toLowerCase().includes(q) ||
        p.nameTH.toLowerCase().includes(q)
      ).slice(0, 5);

      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

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

  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">

        {/* 🌸 ฝั่งซ้าย: โลโก้ร้าน */}
        <Link href="/" className="cursor-pointer text-2xl font-bold tracking-tight">
          Bamblue <span className="text-[#dc6fd6]">store</span>
        </Link>

        {/* 📝 ตรงกลาง: เมนู */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
          <Link href="/" className={`cursor-pointer px-4 py-2 rounded-lg transition-colors ${pathname === '/' ? 'bg-[#dc6fd6] text-white border-2 border-[#dc6fd6]' : 'hover:text-[#dc6fd6]'}`}>หน้าหลัก</Link>
          <Link href="/products" className={`cursor-pointer px-4 py-2 rounded-lg transition-colors ${pathname === '/products' ? 'bg-[#dc6fd6] text-white border-2 border-[#dc6fd6]' : 'hover:text-[#dc6fd6]'}`}>สินค้าทั้งหมด</Link>
          <Link href="/reviews" className={`cursor-pointer px-4 py-2 rounded-lg transition-colors ${pathname === '/reviews' ? 'bg-[#dc6fd6] text-white border-2 border-[#dc6fd6]' : 'hover:text-[#dc6fd6]'}`}>รีวิวจากลูกค้า</Link>
          <Link href="/promotions" className={`cursor-pointer px-4 py-2 rounded-lg transition-colors ${pathname === '/promotions' ? 'bg-[#dc6fd6] text-white border-2 border-[#dc6fd6]' : 'hover:text-[#dc6fd6]'}`}>ข่าวสารโปรโมชั่น</Link>
          <Link href="/contact" className={`cursor-pointer px-4 py-2 rounded-lg transition-colors ${pathname === '/contact' ? 'bg-[#dc6fd6] text-white border-2 border-[#dc6fd6]' : 'hover:text-[#dc6fd6]'}`}>ติดต่อเรา</Link>
        </div>

        {/* 🔍 ฝั่งขวา: ไอคอนต่างๆ */}
        <div className="flex items-center space-x-5 text-gray-700">
          {/* 🍔 Hamburger Menu สำหรับมือถือ */}
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsCartOpen(false);
              setIsSearchOpen(false);
            }}
            className="md:hidden cursor-pointer hover:text-[#dc6fd6] transition-colors border-none bg-transparent py-2"
          >
            {isMobileMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>

          {/* 🌟 ปุ่มค้นหา */}
          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              setIsCartOpen(false); // ปิดตะกร้าถ้าเปิดอยู่
            }}
            className={`cursor-pointer transition-colors border-none bg-transparent py-2 ${isSearchOpen ? 'text-[#dc6fd6]' : 'hover:text-[#dc6fd6]'}`}
          >
            <Search size={22} strokeWidth={1.5} />
          </button>

          {/* 👤 ไอคอนเข้าสู่ระบบ / บัญชีผู้ใช้ (แก้ไขตรงนี้ครับ ✅) */}
          <Link href="/login" className="cursor-pointer hover:text-[#dc6fd6] transition-colors border-none bg-transparent py-2 flex items-center">
            <User size={22} strokeWidth={1.5} />
          </Link>

          {/* 🛒 โซนตะกร้าสินค้า */}
          <div className="relative" ref={cartRef}>
            <button
              onClick={() => {
                setIsCartOpen(!isCartOpen);
                setIsSearchOpen(false); // ปิดค้นหาถ้าเปิดอยู่
              }}
              className="cursor-pointer relative hover:text-[#dc6fd6] transition-colors flex items-center py-2 bg-transparent border-none"
            >
              <ShoppingCart size={22} strokeWidth={1.5} />
              {cartItemCount > 0 && (
                <span className="absolute top-0 -right-2 bg-[#dc6fd6] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
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
                  <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-[#dc6fd6] text-xs cursor-pointer">
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
                            <p className="text-xs text-[#dc6fd6] font-medium mb-2">{item.price}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center border border-gray-200 rounded w-20 h-7">
                                <button onClick={() => updateQuantity(item.id, -1)} disabled={item.quantity <= 1} className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-[#dc6fd6] disabled:opacity-30 cursor-pointer"><Minus size={12} /></button>
                                <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-[#dc6fd6] cursor-pointer"><Plus size={12} /></button>
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
                      <Link href="/cart" onClick={() => setIsCartOpen(false)} className="cursor-pointer block w-full text-center py-3 px-4 bg-[#dc6fd6] text-white rounded text-sm font-bold hover:bg-[#c05ca8] transition-colors shadow-sm">
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

      {/* 📱 Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6 animate-in fade-in duration-200">
          <div className="space-y-2">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${pathname === '/' ? 'bg-[#dc6fd6] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>หน้าหลัก</Link>
            <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${pathname === '/products' ? 'bg-[#dc6fd6] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>สินค้าทั้งหมด</Link>
            <Link href="/reviews" onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${pathname === '/reviews' ? 'bg-[#dc6fd6] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>รีวิวจากลูกค้า</Link>
            <Link href="/promotions" onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${pathname === '/promotions' ? 'bg-[#dc6fd6] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>ข่าวสารโปรโมชั่น</Link>
            <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${pathname === '/contact' ? 'bg-[#dc6fd6] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>ติดต่อเรา</Link>
          </div>
        </div>
      )}

      {/* 🌟 Search Dropdown Panel (เด้งลงมาแบบ Full-width) */}
      {isSearchOpen && (
        <div ref={searchRef} className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 py-8 px-6 z-40 cursor-default">
          <div className="max-w-4xl mx-auto">

            {/* 🔍 ส่วนของ Input และกล่อง Suggestions */}
            <div className="relative w-full mb-8">
              <input
                type="text"
                placeholder="ค้นหาสินค้า เช่น เสื้อ, Butterfly..."
                className="w-full bg-transparent border-b-2 border-gray-200 focus:border-[#dc6fd6] py-2 focus:outline-none text-gray-800 text-lg transition-colors"
                autoFocus
                value={searchInput}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchInput);
                  }
                }}
              />

              {/* 📦 กล่องรายการแนะนำสินค้า */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 shadow-xl rounded-lg overflow-hidden z-50">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        const term = item.nameEN;
                        const updatedSearches = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
                        setRecentSearches(updatedSearches);
                        localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

                        router.push(`/product/${item.id}`);
                        setIsSearchOpen(false);
                        setSearchInput('');
                        setSuggestions([]);
                      }}
                      className="w-full text-left px-4 py-3 flex items-center gap-4 hover:bg-pink-50 transition-colors border-b border-gray-50 last:border-none cursor-pointer"
                    >
                      <img src={item.image} alt={item.nameEN} className="w-12 h-16 object-cover rounded bg-gray-100 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-zinc-800 line-clamp-1">{item.nameEN}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{item.nameTH}</p>
                        <p className="text-xs font-bold text-[#dc6fd6] mt-1">{item.price}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
                      onClick={() => handleSearch(term)}
                      className="cursor-pointer px-4 py-1.5 md:px-5 md:py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-[#dc6fd6] hover:text-[#dc6fd6] transition-colors bg-white"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* สินค้าที่เพิ่งค้นหา */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-gray-500">สินค้าที่เพิ่งค้นหา</h4>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      ล้างประวัติ
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {recentSearches.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(term)}
                        className="cursor-pointer px-4 py-1.5 md:px-5 md:py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:border-[#dc6fd6] hover:text-[#dc6fd6] transition-colors bg-white"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}