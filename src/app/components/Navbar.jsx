"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// นำเข้าไอคอน Heart มาเพิ่ม
import { Search, User, ShoppingCart, Minus, Plus, Trash2, Menu, X, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { CartSkeleton } from './LoadingSkeletons';

export default function Navbar() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const { wishlistItems } = useWishlist();
  const pathname = usePathname();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const popularSearches = ['เสื้อ', 'เดรส', 'ชุดเซ็ต', 'Dress'];
  const [recentSearches, setRecentSearches] = useState([]);
  const [productsData, setProductsData] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      // ตรวจสอบว่าเป็น admin หรือไม่
      if (currentUser) {
        const isAdminUser = currentUser.email === 'admin@bamblue.com' ||
          currentUser.email === 'earn.hcg32@gmail.com' ||
          currentUser.user_metadata?.role === 'admin' ||
          currentUser.email?.includes('admin');
        setIsAdmin(isAdminUser);
      } else {
        setIsAdmin(false);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      // ตรวจสอบว่าเป็น admin หรือไม่
      if (currentUser) {
        const isAdminUser = currentUser.email === 'admin@bamblue.com' ||
          currentUser.email === 'earn.hcg32@gmail.com' ||
          currentUser.user_metadata?.role === 'admin' ||
          currentUser.email?.includes('admin');
        setIsAdmin(isAdminUser);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsProfileOpen(false);
    router.push('/logout');
  };

  useEffect(() => {
    const savedSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    setRecentSearches(savedSearches);
  }, []);

  // ดึงข้อมูลสินค้าจาก Supabase สำหรับใช้ในช่องค้นหา
  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products1')
        .select('*');
      
      if (!error && data) {
        setProductsData(data);
      }
    }
    fetchProducts();
  }, []);

  const handleSearch = (term) => {
    if (!term.trim()) return;

    const updatedSearches = [term, ...recentSearches.filter(item => item !== term)].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

    setIsSearchOpen(false);
    setSearchInput('');
    setSuggestions([]);

    // ตรวจสอบว่าเป็นหมวดหมู่หรือไม่
    const categoryMap = {
      'เสื้อ': 'shirt',
      'shirt': 'shirt',
      'เดรส': 'dress',
      'dress': 'dress',
      'ชุดเซ็ต': 'set',
      'set': 'set'
    };

    const lowerTerm = term.toLowerCase();
    const categoryKey = Object.keys(categoryMap).find(key => key.toLowerCase() === lowerTerm);

    if (categoryKey) {
      // ถ้าเป็นหมวดหมู่ ให้ลิงค์ไปที่หมวดหมู่โดยตรง
      router.push(`/products?category=${categoryMap[categoryKey]}`);
    } else {
      // ถ้าไม่ใช่หมวดหมู่ ให้ค้นหาปกติ
      router.push(`/products?search=${encodeURIComponent(term)}`);
    }
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
  const profileRef = useRef(null);

  // นับจำนวนชนิดสินค้า (ไม่ใช่จำนวนชิ้น)
  const cartItemCount = cartItems ? cartItems.length : 0;
  // นับจำนวนชิ้นทั้งหมด (สำหรับแสดงในหัวข้อ)
  const totalQuantity = cartItems ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => {
      return total + (Number(item.price) * item.quantity);
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
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">

        <Link href="/" className="cursor-pointer text-2xl font-bold tracking-tight">
          Bamblue <span className="text-[#dc6fd6]">store</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600">
          <Link href="/" className={`cursor-pointer px-4 py-2 rounded-lg transition-colors ${pathname === '/' ? 'bg-[#dc6fd6] text-white border-2 border-[#dc6fd6]' : 'hover:text-[#dc6fd6]'}`}>หน้าหลัก</Link>
          <Link href="/products" className={`cursor-pointer px-4 py-2 rounded-lg transition-colors ${pathname === '/products' ? 'bg-[#dc6fd6] text-white border-2 border-[#dc6fd6]' : 'hover:text-[#dc6fd6]'}`}>สินค้าทั้งหมด</Link>
          <Link href="/reviews" className={`cursor-pointer px-4 py-2 rounded-lg transition-colors ${pathname === '/reviews' ? 'bg-[#dc6fd6] text-white border-2 border-[#dc6fd6]' : 'hover:text-[#dc6fd6]'}`}>รีวิวจากลูกค้า</Link>
          <Link href="/promotions" className={`cursor-pointer px-4 py-2 rounded-lg transition-colors ${pathname === '/promotions' ? 'bg-[#dc6fd6] text-white border-2 border-[#dc6fd6]' : 'hover:text-[#dc6fd6]'}`}>ข่าวสารโปรโมชั่น</Link>
          <Link href="/contact" className={`cursor-pointer px-4 py-2 rounded-lg transition-colors ${pathname === '/contact' ? 'bg-[#dc6fd6] text-white border-2 border-[#dc6fd6]' : 'hover:text-[#dc6fd6]'}`}>ติดต่อเรา</Link>
        </div>

        <div className="flex items-center space-x-5 text-gray-700">
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsCartOpen(false);
              setIsSearchOpen(false);
              setIsProfileOpen(false);
            }}
            className="md:hidden cursor-pointer hover:text-[#dc6fd6] transition-colors border-none bg-transparent py-2"
          >
            {isMobileMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>

          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              setIsCartOpen(false);
              setIsProfileOpen(false);
            }}
            className={`cursor-pointer transition-colors border-none bg-transparent py-2 ${isSearchOpen ? 'text-[#dc6fd6]' : 'hover:text-[#dc6fd6]'}`}
          >
            <Search size={22} strokeWidth={1.5} />
          </button>

          {/* ปุ่ม Wishlist บน Navbar */}
          <Link
            href={user ? "/wishlist" : "/login"}
            className="cursor-pointer relative hover:text-[#dc6fd6] transition-colors border-none bg-transparent py-2 flex items-center"
            title="รายการโปรด"
          >
            <Heart size={22} strokeWidth={1.5} />
            {wishlistItems.length > 0 && (
              <span className="absolute top-0 -right-2 bg-[#dc6fd6] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsCartOpen(false);
                  setIsSearchOpen(false);
                }}
                className="cursor-pointer hover:text-[#dc6fd6] transition-colors border-none bg-transparent py-2 flex items-center"
              >
                <User size={22} strokeWidth={1.5} className="text-[#dc6fd6]" />
              </button>

              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-white shadow-xl border border-gray-100 rounded-lg p-2 z-50 dropdown-animate">
                  <div className="px-4 py-3 border-b border-gray-100 mb-2">
                    <p className="text-xs text-gray-500 mb-1">เข้าสู่ระบบด้วย</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                        Admin
                      </span>
                    )}
                  </div>

                  {/* แสดงลิงก์ Admin Dashboard ถ้าเป็น admin */}
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin"
                        className="block w-full text-left px-4 py-2.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-md transition-colors cursor-pointer"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        🎯 Admin Dashboard
                      </Link>
                      <div className="border-t border-gray-100 my-2"></div>
                    </>
                  )}

                  <Link
                    href="/profile"
                    className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    โปรไฟล์ของฉัน
                  </Link>
                  <Link
                    href="/orders"
                    className="block w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    ประวัติการสั่งซื้อ
                  </Link>
                  <div className="border-t border-gray-100 my-2"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="cursor-pointer hover:text-[#dc6fd6] transition-colors border-none bg-transparent py-2 flex items-center">
              <User size={22} strokeWidth={1.5} />
            </Link>
          )}

          <div className="relative" ref={cartRef}>
            <button
              onClick={() => {
                setIsCartOpen(!isCartOpen);
                setIsSearchOpen(false);
                setIsProfileOpen(false);
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

            {isCartOpen && (
              <div className="absolute top-full right-0 mt-3 w-80 bg-white shadow-xl border border-gray-100 rounded-lg p-4 z-50 cursor-default dropdown-animate">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800">
                    ตะกร้าสินค้า ({totalQuantity} ชิ้น)
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
                        <div key={item.cartKey || item.id} className="flex gap-3">
                          <img src={item.image} alt={item.nameEN} className="w-16 h-20 object-cover rounded shrink-0 bg-gray-50" />
                          <div className="grow flex flex-col justify-center">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.nameEN}</p>
                            <p className="text-xs text-gray-500 mb-1">ไซส์: {item.size || 'M'}</p>
                            <p className="text-xs text-[#dc6fd6] font-medium mb-2">฿{Number(item.price).toLocaleString()}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center border border-gray-200 rounded w-20 h-7">
                                <button onClick={() => updateQuantity(item.cartKey, -1)} disabled={item.quantity <= 1} className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-[#dc6fd6] disabled:opacity-30 cursor-pointer"><Minus size={12} /></button>
                                <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.cartKey, 1)} className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-[#dc6fd6] cursor-pointer"><Plus size={12} /></button>
                              </div>
                              <button onClick={() => removeFromCart(item.cartKey)} className="text-gray-400 hover:text-red-500 cursor-pointer p-1 transition-colors"><Trash2 size={16} /></button>
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

      {isSearchOpen && (
        <div ref={searchRef} className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 py-8 px-6 z-40 cursor-default animate-fade-in-down">
          {/* ส่วนค้นหาเหมือนเดิม ไม่ได้ปรับแก้ครับ */}
          <div className="max-w-4xl mx-auto">
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

            <div className="space-y-8">
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