"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
// นำเข้าไอคอน Heart มาเพิ่ม
import { Search, User, ShoppingCart, Minus, Plus, Trash2, Menu, X, Heart } from 'lucide-react';
import { useCart } from '@/frontend/context/CartContext';
import { useWishlist } from '@/frontend/context/WishlistContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/frontend/services/supabaseClient';
import { CartSkeleton } from './LoadingSkeletons';
import NavbarSearch from './NavbarSearch';
import { checkIsAdminCached } from '@/frontend/auth/adminCheck';

export default function Navbar() {
  const { cartItems, updateQuantity, removeFromCart, getItemStockLimit, clearCart } = useCart();
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [confirmWishlistRemove, setConfirmWishlistRemove] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      // ✅ ตรวจสอบว่าเป็น admin ด้วย helper function (ไม่ hardcode email)
      if (currentUser) {
        const adminStatus = await checkIsAdminCached(currentUser);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);

      // ✅ ตรวจสอบว่าเป็น admin ด้วย helper function
      if (currentUser) {
        const adminStatus = await checkIsAdminCached(currentUser);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearCart();
    clearWishlist();
    setUser(null);
    setIsProfileOpen(false);
    router.push('/logout');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartRef = useRef(null);
  const wishlistRef = useRef(null);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  // นับจำนวนชนิดสินค้า (ไม่ใช่จำนวนชิ้น)
  const cartItemCount = cartItems ? cartItems.length : 0;
  // นับจำนวนชิ้นทั้งหมด (สำหรับแสดงในหัวข้อ)
  const totalQuantity = cartItems ? cartItems.reduce((total, item) => total + item.quantity, 0) : 0;
  const wishlistCount = wishlistItems ? wishlistItems.length : 0;
  const { scrollY } = useScroll();
  const navBackground = useTransform(scrollY, [0, 90], ['rgba(255,255,255,0.96)', 'rgba(255,255,255,0.84)']);
  const navShadow = useTransform(scrollY, [0, 90], ['0 0 0 rgba(15,23,42,0)', '0 14px 40px rgba(15,23,42,0.08)']);

  const calculateTotal = () => {
    if (!cartItems) return 0;
    return cartItems.reduce((total, item) => {
      return total + (Number(item.price) * item.quantity);
    }, 0);
  };

  const formatWishlistPrice = (price) => {
    const numericPrice = Number(String(price || 0).replace(/[^0-9.]/g, ''));
    return numericPrice ? `฿${numericPrice.toLocaleString()}` : '฿0';
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
      if (wishlistRef.current && !wishlistRef.current.contains(event.target)) {
        setIsWishlistOpen(false);
        setConfirmWishlistRemove(null);
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
    <motion.nav
      className="sticky top-0 z-50 border-b border-gray-100 px-3 py-2.5 backdrop-blur-xl sm:px-5 sm:py-3"
      style={{ backgroundColor: navBackground, boxShadow: navShadow }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">

        <Link href="/" className="cursor-pointer flex min-w-0 items-center gap-2">
          <img src="/Picture/icon.png" alt="Bamblue Logo" className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12" />
          <span className="hidden whitespace-nowrap text-lg font-bold tracking-tight min-[420px]:inline sm:text-xl">Bamblue <span className="text-[var(--bamblue-brand)]">store</span></span>
        </Link>

        <div className="hidden lg:flex items-center space-x-6 text-sm font-medium text-gray-600">
          <Link href="/" className={`cursor-pointer rounded-lg px-3 py-2 transition-colors ${pathname === '/' ? 'bg-pink-50 text-[var(--bamblue-brand)]' : 'hover:bg-gray-50 hover:text-[var(--bamblue-brand)]'}`}>หน้าหลัก</Link>
          <Link href="/products" className={`cursor-pointer rounded-lg px-3 py-2 transition-colors ${pathname === '/products' ? 'bg-pink-50 text-[var(--bamblue-brand)]' : 'hover:bg-gray-50 hover:text-[var(--bamblue-brand)]'}`}>สินค้าทั้งหมด</Link>
          <Link href="/reviews" className={`cursor-pointer rounded-lg px-3 py-2 transition-colors ${pathname === '/reviews' ? 'bg-pink-50 text-[var(--bamblue-brand)]' : 'hover:bg-gray-50 hover:text-[var(--bamblue-brand)]'}`}>รีวิว</Link>
          <Link href="/promotions" className={`cursor-pointer rounded-lg px-3 py-2 transition-colors ${pathname === '/promotions' ? 'bg-pink-50 text-[var(--bamblue-brand)]' : 'hover:bg-gray-50 hover:text-[var(--bamblue-brand)]'}`}>โปรโมชั่น</Link>
          <Link href="/contact" className={`cursor-pointer rounded-lg px-3 py-2 transition-colors ${pathname === '/contact' ? 'bg-pink-50 text-[var(--bamblue-brand)]' : 'hover:bg-gray-50 hover:text-[var(--bamblue-brand)]'}`}>ติดต่อเรา</Link>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 text-gray-700 sm:gap-3 lg:gap-6">
          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsCartOpen(false);
              setIsWishlistOpen(false);
              setIsSearchOpen(false);
              setIsProfileOpen(false);
            }}
            className="order-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent transition-colors hover:bg-pink-50 hover:text-[var(--bamblue-brand)] lg:hidden"
            aria-label={isMobileMenuOpen ? 'ปิดเมนูหลัก' : 'เปิดเมนูหลัก'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>

          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              setIsCartOpen(false);
              setIsWishlistOpen(false);
              setIsProfileOpen(false);
              setIsMobileMenuOpen(false);
            }}
            className={`order-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent transition-colors lg:order-none ${isSearchOpen ? 'bg-pink-50 text-[var(--bamblue-brand)]' : 'hover:bg-pink-50 hover:text-[var(--bamblue-brand)]'}`}
            aria-label={isSearchOpen ? 'ปิดการค้นหาสินค้า' : 'เปิดการค้นหาสินค้า'}
            aria-expanded={isSearchOpen}
          >
            <Search size={20} strokeWidth={1.5} />
          </button>

          {/* ปุ่ม Wishlist บน Navbar */}
          <div className="relative hidden sm:block" ref={wishlistRef}>
            <button
              onClick={() => {
                if (!user) {
                  router.push('/login');
                  return;
                }

                setIsWishlistOpen(!isWishlistOpen);
                setConfirmWishlistRemove(null);
                setIsCartOpen(false);
                setIsSearchOpen(false);
                setIsProfileOpen(false);
                setIsMobileMenuOpen(false);
              }}
              className={`relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent transition-colors ${isWishlistOpen ? 'bg-pink-50 text-[var(--bamblue-brand)]' : 'hover:bg-pink-50 hover:text-[var(--bamblue-brand)]'}`}
              title="รายการโปรด"
              aria-label={isWishlistOpen ? 'ปิดรายการโปรด' : 'เปิดรายการโปรด'}
              aria-expanded={isWishlistOpen}
            >
              <Heart size={20} strokeWidth={1.5} />
              {mounted && wishlistCount > 0 && (
                <motion.span
                  key={wishlistCount}
                  initial={{ scale: 0.7, y: 2 }}
                  animate={{ scale: 1, y: 0 }}
                  className="absolute -top-1 right-0 bg-[var(--bamblue-brand)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                >
                  {wishlistCount}
                </motion.span>
              )}
            </button>

            <AnimatePresence>
              {isWishlistOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="dropdown-animate fixed inset-x-4 top-[78px] z-[60] max-h-[calc(100vh-104px)] overflow-hidden rounded-2xl border border-pink-100 bg-white p-4 shadow-[0_28px_80px_rgba(31,18,36,0.22)] ring-1 ring-pink-100 cursor-default md:absolute md:inset-auto md:right-0 md:top-full md:mt-4 md:w-[23rem]"
                >
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-gray-800">Wishlist</h3>
                      <p className="text-xs text-gray-500">{wishlistCount} saved items</p>
                    </div>
                    <button
                      onClick={() => {
                        setIsWishlistOpen(false);
                        setConfirmWishlistRemove(null);
                      }}
                      className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#dc6fd6]"
                      aria-label="Close wishlist"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {wishlistCount === 0 ? (
                    <div className="my-4 rounded-2xl border border-gray-100 bg-gray-50 px-5 py-6 text-center">
                      <Heart size={34} className="mx-auto mb-3 text-gray-300" />
                      <p className="text-sm font-bold text-gray-700">No saved products yet</p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">Tap a heart on a product to save it here.</p>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-[56vh] space-y-3 overflow-y-auto py-4 pr-1 md:max-h-[420px]">
                        {wishlistItems.slice(0, 6).map((item) => (
                          <div key={item.id} className="flex gap-3 rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
                            <Link
                              href={`/product/${item.id}`}
                              onClick={() => setIsWishlistOpen(false)}
                              className="h-20 w-16 shrink-0 overflow-hidden rounded-md bg-gray-50"
                            >
                              <img src={item.image} alt={item.nameEN} className="h-full w-full object-cover" />
                            </Link>
                            <div className="min-w-0 flex-1">
                              <Link href={`/product/${item.id}`} onClick={() => setIsWishlistOpen(false)}>
                                <p className="line-clamp-1 text-sm font-semibold text-gray-800 transition-colors hover:text-[#dc6fd6]">{item.nameEN}</p>
                              </Link>
                              <p className="line-clamp-1 text-xs text-gray-500">{item.nameTH}</p>
                              <div className="mt-2 flex items-center justify-between gap-2">
                                <span className="text-sm font-bold text-[#dc6fd6]">{formatWishlistPrice(item.price)}</span>
                                <div
                                  className="flex h-8 items-center overflow-hidden rounded-full bg-white transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
                                  style={{ width: confirmWishlistRemove === item.id ? '72px' : '32px' }}
                                >
                                  {confirmWishlistRemove === item.id ? (
                                    <div className="flex w-full items-center gap-1 px-1">
                                      <button
                                        onClick={() => setConfirmWishlistRemove(null)}
                                        className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                        aria-label="Cancel remove"
                                      >
                                        <X size={14} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          removeFromWishlist(item.id);
                                          setConfirmWishlistRemove(null);
                                        }}
                                        className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white transition-colors hover:bg-red-600"
                                        aria-label={`Confirm remove ${item.nameEN} from wishlist`}
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setConfirmWishlistRemove(item.id)}
                                      className="flex h-8 w-8 items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                      aria-label={`Remove ${item.nameEN} from wishlist`}
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {wishlistCount > 6 && (
                        <p className="mb-3 text-center text-xs text-gray-500">
                          {wishlistCount - 6} more items in Wishlist
                        </p>
                      )}
                    </>
                  )}

                  <div className="border-t border-gray-100 pt-3">
                    <Link
                      href="/wishlist"
                      onClick={() => {
                        setIsWishlistOpen(false);
                        setConfirmWishlistRemove(null);
                      }}
                      className="block w-full rounded-lg bg-zinc-900 px-4 py-3 text-center text-sm font-bold text-white transition-colors hover:bg-zinc-800"
                    >
                      View all Wishlist
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {user ? (
            <div className="relative hidden sm:block" ref={profileRef}>
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsCartOpen(false);
                  setIsWishlistOpen(false);
                  setIsSearchOpen(false);
                  setIsMobileMenuOpen(false);
                }}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent transition-colors hover:bg-pink-50 hover:text-[#dc6fd6]"
              >
                <User size={20} strokeWidth={1.5} className="text-[#dc6fd6]" />
              </button>

              {isProfileOpen && (
                <div className="absolute top-full right-0 mt-3 w-56 bg-white shadow-xl border border-gray-100 rounded-lg p-2 z-50 dropdown-animate">
                  <div className="px-4 py-3 border-b border-gray-100 mb-2">
                    <p className="text-xs text-gray-500 mb-1">เข้าสู่ระบบด้วย</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
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
            <Link href="/login" className="hidden h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent transition-colors hover:bg-pink-50 hover:text-[var(--bamblue-brand)] sm:flex" aria-label="เข้าสู่ระบบ">
              <User size={20} strokeWidth={1.5} />
            </Link>
          )}

          <div className="relative order-2 lg:order-none" ref={cartRef}>
            <button
              onClick={() => {
                setIsCartOpen(!isCartOpen);
                setIsWishlistOpen(false);
                setIsSearchOpen(false);
                setIsProfileOpen(false);
                setIsMobileMenuOpen(false);
              }}
              className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent transition-colors hover:bg-pink-50 hover:text-[var(--bamblue-brand)]"
              aria-label={isCartOpen ? 'ปิดตะกร้าสินค้า' : 'เปิดตะกร้าสินค้า'}
              aria-expanded={isCartOpen}
            >
              <ShoppingCart size={20} strokeWidth={1.5} />
              {mounted && cartItemCount > 0 && (
                <motion.span
                  key={cartItemCount}
                  initial={{ scale: 0.7, y: 2 }}
                  animate={{ scale: 1, y: 0 }}
                  className="absolute -top-1 right-0 bg-[var(--bamblue-brand)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm"
                >
                  {cartItemCount}
                </motion.span>
              )}
            </button>

            {isCartOpen && (
              <div className="dropdown-animate fixed inset-x-4 top-[78px] z-[60] max-h-[calc(100vh-104px)] overflow-hidden rounded-2xl border border-pink-100 bg-white p-4 shadow-[0_28px_80px_rgba(31,18,36,0.22)] ring-1 ring-pink-100 cursor-default md:absolute md:inset-auto md:right-0 md:top-full md:mt-4 md:w-80">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-gray-800">
                    ตะกร้าสินค้า ({totalQuantity} ชิ้น)
                  </h3>
                  <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-[var(--bamblue-brand)] text-xs cursor-pointer" aria-label="ปิดตะกร้าสินค้า">
                    ปิด ✕
                  </button>
                </div>

                {!cartItems || cartItems.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">ไม่มีสินค้าในตะกร้า</p>
                ) : (
                  <>
                    <div className="max-h-[50vh] overflow-y-auto space-y-4 mb-4 pr-1 md:max-h-[60vh]">
                      {cartItems.map(item => {
                        const stockLimit = getItemStockLimit(item);
                        const isAtStockLimit = stockLimit !== null && item.quantity >= stockLimit;

                        return (
                          <div key={item.cartKey || item.id} className="flex gap-3">
                            <img src={item.image} alt={item.nameEN} className="w-16 h-20 object-cover rounded shrink-0 bg-gray-50" />
                            <div className="grow flex flex-col justify-center">
                              <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.nameEN}</p>
                              <p className="text-xs text-gray-500 mb-1">ไซส์: {item.size || 'M'}</p>
                              <p className="text-xs text-[var(--bamblue-brand)] font-medium mb-2">฿{Number(item.price).toLocaleString()}</p>
                              <div className="flex items-center justify-between">
                                <div className="flex h-9 w-28 items-center rounded-lg border border-gray-200">
                                  <button onClick={() => updateQuantity(item.cartKey, -1)} disabled={item.quantity <= 1} className="flex h-9 w-9 cursor-pointer items-center justify-center text-gray-500 hover:text-[var(--bamblue-brand)] disabled:cursor-not-allowed disabled:opacity-30" aria-label={`ลดจำนวน ${item.nameEN}`}><Minus size={13} /></button>
                                  <span className="w-10 text-center text-xs font-semibold" aria-live="polite">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item.cartKey, 1)} disabled={isAtStockLimit} className="flex h-9 w-9 cursor-pointer items-center justify-center text-gray-500 hover:text-[var(--bamblue-brand)] disabled:cursor-not-allowed disabled:opacity-30" aria-label={`เพิ่มจำนวน ${item.nameEN}`}><Plus size={13} /></button>
                                </div>
                                <button onClick={() => removeFromCart(item.cartKey)} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-red-400 transition-colors hover:bg-red-50 hover:text-red-600" aria-label={`ลบ ${item.nameEN} ออกจากตะกร้า`}><Trash2 size={16} /></button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-gray-700">ราคาสินค้ารวม</span>
                        <span className="text-lg font-bold text-zinc-900">฿{calculateTotal().toLocaleString()}</span>
                      </div>
                      <Link href="/cart" onClick={() => setIsCartOpen(false)} className="cursor-pointer block w-full text-center py-3 px-4 bg-[var(--bamblue-brand)] text-white rounded text-sm font-bold hover:bg-[var(--bamblue-brand-hover)] transition-colors shadow-sm">
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

      {(isMobileMenuOpen || isSearchOpen || isCartOpen || isWishlistOpen || isProfileOpen) && (
        <button
          type="button"
          className="fixed inset-x-0 bottom-0 top-[61px] z-40 bg-white/80 backdrop-blur-sm"
          aria-label="Close open navigation panel"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsSearchOpen(false);
            setIsCartOpen(false);
            setIsWishlistOpen(false);
            setIsProfileOpen(false);
            setConfirmWishlistRemove(null);
          }}
        />
      )}

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-50 bg-white border-t border-gray-100 py-4 px-3 sm:px-5 lg:hidden"
          >
            <div className="space-y-2">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${pathname === '/' ? 'bg-[#dc6fd6] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>หน้าหลัก</Link>
              <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${pathname === '/products' ? 'bg-[#dc6fd6] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>สินค้าทั้งหมด</Link>
              <Link href="/reviews" onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${pathname === '/reviews' ? 'bg-[#dc6fd6] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>รีวิวจากลูกค้า</Link>
              <Link href="/promotions" onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${pathname === '/promotions' ? 'bg-[#dc6fd6] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>ข่าวสารโปรโมชั่น</Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-3 rounded-lg transition-colors text-sm font-medium ${pathname === '/contact' ? 'bg-[#dc6fd6] text-white' : 'text-gray-700 hover:bg-gray-100'}`}>ติดต่อเรา</Link>
            </div>
            <div className="mt-4 border-t border-gray-100 pt-4">
              <p className="mb-2 px-4 text-xs font-bold uppercase tracking-widest text-gray-400">Account</p>
              <div className="space-y-2">
                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${pathname === '/wishlist'
                      ? 'bg-pink-50 text-[#b342ad]'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <span>Wishlist</span>
                  {mounted && wishlistCount > 0 && (
                    <span className="rounded-full bg-[#dc6fd6] px-2 py-0.5 text-xs font-bold text-white">{wishlistCount}</span>
                  )}
                </Link>

                {user ? (
                  <>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block rounded-lg px-4 py-3 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-50"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${pathname === '/profile'
                          ? 'bg-pink-50 text-[#b342ad]'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      โปรไฟล์ของฉัน
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${pathname === '/orders'
                          ? 'bg-pink-50 text-[#b342ad]'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      ประวัติการสั่งซื้อ
                    </Link>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                    >
                      ออกจากระบบ
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${pathname === '/login'
                        ? 'bg-pink-50 text-[#b342ad]'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    เข้าสู่ระบบ
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NavbarSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} panelRef={searchRef} />
    </motion.nav>
  );
}
