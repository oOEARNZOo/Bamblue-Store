"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from './context/CartContext';
import { useWishlist } from './context/WishlistContext';
import { Heart } from 'lucide-react';

// 🌟 1. นำเข้า Supabase
import { supabase } from '@/lib/supabase';
import { 
  HeroBannerSkeleton, 
  ProductGridSkeleton 
} from './components/LoadingSkeletons';
import { ProductImage, BannerImage } from './components/OptimizedImage';

export default function Home() {
  const { addToCart } = useCart();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();

  // ตรวจสอบว่าสินค้าอยู่ใน wishlist หรือไม่ (useCallback เพื่อ optimize)
  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item.id === productId);
  }, [wishlistItems]);

  // Toggle wishlist (useCallback เพื่อ optimize)
  const toggleWishlist = useCallback((item) => {
    if (wishlistItems.some(i => i.id === item.id)) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist(item);
    }
  }, [wishlistItems, addToWishlist, removeFromWishlist]);

  // 🌟 2. สร้าง State สำหรับรับข้อมูลสินค้าใหม่จาก Supabase
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalSold: 0,
    avgRating: 0,
    totalReviews: 0
  });

  // ข้อมูลแบนเนอร์ (ปรับปรุงให้ครบถ้วน)
  const banners = [
    {
      id: 1,
      image: "/Picture/banner1.png",
      title: "YOUTH ELEVATED",
      subtitle: "SIMPLY STYLISH",
      btnText: "SHOP NOW",
      link: "/products"
    },
    {
      id: 2,
      image: "/Picture/banner2.png",
      title: "NEW COLLECTION",
      subtitle: "SPRING 2026",
      btnText: "EXPLORE NOW",
      link: "/products?category=dress"
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // ตั้งเวลาสไลด์แบนเนอร์
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 10000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));

  // 🌟 3. ฟังก์ชันดึงข้อมูลทั้งหมดจาก Supabase (Optimized with Promise.all)
  useEffect(() => {
    async function fetchAllData() {
      try {
        setIsLoading(true);
        
        // 🚀 ดึงข้อมูลทั้งหมดพร้อมกัน (Parallel Fetching)
        const [newArrivalsRes, bestSellersRes, reviewsRes, orderCountRes, ordersDataRes, allReviewsRes] = await Promise.all([
          // ดึง New Arrivals (4 ชิ้นแรก)
          supabase.from('products1').select('*').order('id', { ascending: true }).limit(4),
          // ดึง Best Sellers (4 ชิ้นสุ่ม)
          supabase.from('products1').select('*').order('id', { ascending: false }).limit(4),
          // ดึงรีวิวล่าสุด (3 รีวิว)
          supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(3),
          // นับจำนวนออเดอร์
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          // ดึง items จาก orders
          supabase.from('orders').select('items'),
          // ดึง ratings จากรีวิว
          supabase.from('reviews').select('rating')
        ]);

        // Set ข้อมูลสินค้า
        setNewArrivals(newArrivalsRes.data || []);
        setBestSellers(bestSellersRes.data || []);
        setReviews(reviewsRes.data || []);

        // คำนวณสถิติ
        const totalSold = ordersDataRes.data?.reduce((sum, order) => {
          const items = order.items || [];
          return sum + items.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0);
        }, 0) || 0;

        const totalReviews = allReviewsRes.data?.length || 0;
        const avgRating = totalReviews > 0 
          ? (allReviewsRes.data.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews).toFixed(1)
          : 5.0;

        setStats({
          totalCustomers: orderCountRes.count || 0,
          totalSold: totalSold,
          avgRating: avgRating,
          totalReviews: totalReviews
        });

      } catch (err) {
        console.error("System Error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllData();
  }, []);

  // สถิติร้านค้า (useMemo เพื่อ optimize - ไม่ต้องคำนวณใหม่ถ้า stats ไม่เปลี่ยน)
  const statsDisplay = useMemo(() => [
    { 
      label: 'ลูกค้าที่สั่งซื้อ', 
      value: stats.totalCustomers > 0 ? `${stats.totalCustomers.toLocaleString()}+` : '0', 
      icon: '❤️' 
    },
    { 
      label: 'สินค้าที่ขายแล้ว', 
      value: stats.totalSold > 0 ? `${stats.totalSold.toLocaleString()}+` : '0', 
      icon: '📦' 
    },
    { 
      label: 'คะแนนเฉลี่ย', 
      value: `${stats.avgRating}/5`, 
      icon: '⭐',
      subtext: stats.totalReviews > 0 ? `(${stats.totalReviews} รีวิว)` : ''
    },
    { 
      label: 'จัดส่งภายใน', 
      value: '1-3 วัน', 
      icon: '🚚' 
    },
  ], [stats]);

  return (
    <main className="min-h-screen flex flex-col">

      {/* 🌟 Section 1: Hero Banner Slider (แก้ไขความสูงตรงนี้) 🌟 */}
      <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gray-100 group">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
          >
            {/* 🖼️ ใช้ BannerImage แทน background-image */}
            <BannerImage 
              src={banner.image} 
              alt={banner.title || 'Banner'} 
            />
            
            {/* 🌟 Gradient Overlay เพื่อให้อ่านข้อความง่ายขึ้น */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-10" />
            
            <div className="absolute inset-0 h-full flex items-center px-8 md:px-24 z-20">
              <div className={`max-w-xl text-center md:text-left mt-10 md:mt-0 ${index === currentSlide ? 'animate-fade-in-up' : ''}`}>
                {banner.subtitle && (
                  <p className="text-sm md:text-base font-medium text-[#dc6fd6] mb-2 tracking-widest uppercase">
                    {banner.subtitle}
                  </p>
                )}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-wider leading-tight">
                  {banner.title}
                </h1>
                <p className="text-white/80 text-sm md:text-base mb-8 max-w-md hidden md:block">
                  ค้นพบคอลเลกชันใหม่ล่าสุด สไตล์มินิมอลที่เหมาะกับทุกโอกาส
                </p>
                {banner.btnText && (
                  <Link 
                    href={banner.link || '/products'}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#dc6fd6] hover:bg-[#c55fc6] text-white font-semibold text-sm tracking-wider rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/30"
                  >
                    {banner.btnText}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {banners.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all cursor-pointer shadow-md ${index === currentSlide ? "bg-white scale-110" : "bg-white/50 hover:bg-white/80"}`}></button>
          ))}
        </div>
      </section>


      {/* 🌟 Section 2: NEW ARRIVALS */}
      <section className="py-20 bg-gradient-to-b from-white via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl tracking-widest text-[#dc6fd6] border-gray-200 border-b font-medium">NEW ARRIVALS</h3>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {newArrivals.map((item) => (
                <div key={item.id} className="group flex flex-col text-center relative">
                  {/* 🌟 Badges */}
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {item.is_new && (
                      <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        NEW
                      </span>
                    )}
                    {item.discount_percent > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        -{item.discount_percent}%
                      </span>
                    )}
                    {item.stock === 0 && (
                      <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        หมด
                      </span>
                    )}
                  </div>

                  {/* ❤️ Wishlist Button */}
                  <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(item); }}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 cursor-pointer"
                  >
                    <Heart 
                      size={16} 
                      className={isInWishlist(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'} 
                    />
                  </button>

                  <Link href={`/product/${item.id}`} className="block">
                    <div className={`w-full mb-4 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all ${item.stock === 0 ? 'opacity-60' : ''}`}>
                      <ProductImage 
                        src={item.image} 
                        alt={item.nameEN}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">{item.nameTH}</p>
                      <h4 className="text-sm font-semibold text-zinc-900 mb-1 tracking-wide group-hover:text-[#dc6fd6] transition-colors">{item.nameEN}</h4>
                      
                      {/* 💰 ราคา (แสดงราคาลดถ้ามีส่วนลด) */}
                      <div className="mb-4">
                        {item.discount_percent > 0 ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-sm text-gray-400 line-through">
                              ฿{(item.original_price || item.price).toLocaleString()}
                            </span>
                            <span className="text-sm text-red-500 font-bold">
                              ฿{Math.round(item.price * (1 - item.discount_percent / 100)).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 font-medium">
                            ฿{item.price ? item.price.toLocaleString() : 0}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                  
                  {/* 🛒 ปุ่มเพิ่มลงตะกร้า */}
                  <button
                    onClick={() => addToCart(item)}
                    disabled={item.stock === 0}
                    className={`w-full py-2.5 text-xs font-semibold tracking-widest rounded-lg transition-all cursor-pointer ${
                      item.stock === 0 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'border border-gray-300 text-gray-600 hover:bg-[#dc6fd6] hover:text-white hover:border-[#dc6fd6]'
                    }`}>
                    {item.stock === 0 ? 'SOLD OUT' : 'QUICK ADD'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 🌟 Section 3: สถิติร้านค้า (Social Proof Stats) */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statsDisplay.map((stat, index) => (
              <div key={index} className="text-center p-6 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 hover:shadow-lg transition-shadow">
                <span className="text-3xl mb-2 block">{stat.icon}</span>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
                {stat.subtext && <p className="text-xs text-gray-400 mt-1">{stat.subtext}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🌟 Section 4: BEST SELLERS */}
      <section className="py-20 bg-gradient-to-b from-pink-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm text-[#dc6fd6] font-medium tracking-widest uppercase mb-2 block">สินค้ายอดนิยม</span>
            <h3 className="text-2xl tracking-widest text-gray-800 font-bold">BEST SELLERS</h3>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {bestSellers.map((item) => (
                <div key={item.id} className="group flex flex-col text-center relative">
                  {/* 🌟 Badges */}
                  <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    <span className="bg-[#dc6fd6] text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                      🔥 HOT
                    </span>
                    {item.discount_percent > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        -{item.discount_percent}%
                      </span>
                    )}
                    {item.stock === 0 && (
                      <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        หมด
                      </span>
                    )}
                  </div>

                  {/* ❤️ Wishlist Button */}
                  <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(item); }}
                    className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 cursor-pointer"
                  >
                    <Heart 
                      size={16} 
                      className={isInWishlist(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'} 
                    />
                  </button>

                  <Link href={`/product/${item.id}`} className="block">
                    <div className={`w-full mb-4 rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all ${item.stock === 0 ? 'opacity-60' : ''}`}>
                      <ProductImage 
                        src={item.image} 
                        alt={item.nameEN}
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">{item.nameTH}</p>
                      <h4 className="text-sm font-semibold text-zinc-900 mb-1 tracking-wide group-hover:text-[#dc6fd6] transition-colors">{item.nameEN}</h4>
                      
                      {/* 💰 ราคา */}
                      <div className="mb-4">
                        {item.discount_percent > 0 ? (
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-sm text-gray-400 line-through">
                              ฿{(item.original_price || item.price).toLocaleString()}
                            </span>
                            <span className="text-sm text-red-500 font-bold">
                              ฿{Math.round(item.price * (1 - item.discount_percent / 100)).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-700 font-medium">
                            ฿{item.price ? item.price.toLocaleString() : 0}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                  
                  {/* 🛒 ปุ่มเพิ่มลงตะกร้า */}
                  <button
                    onClick={() => addToCart(item)}
                    disabled={item.stock === 0}
                    className={`w-full py-2.5 text-xs font-semibold tracking-widest rounded-lg transition-all cursor-pointer shadow-sm ${
                      item.stock === 0 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-[#dc6fd6] text-white hover:bg-[#c55fc6]'
                    }`}>
                    ADD TO CART
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 px-8 py-3 border-2 border-[#dc6fd6] text-[#dc6fd6] font-semibold text-sm tracking-wider rounded-full hover:bg-[#dc6fd6] hover:text-white transition-all"
            >
              ดูสินค้าทั้งหมด
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 🌟 Section 5: รีวิวจากลูกค้า */}
      <section className="py-20 bg-gradient-to-b from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm text-[#dc6fd6] font-medium tracking-widest uppercase mb-2 block">ลูกค้าพูดถึงเรา</span>
            <h3 className="text-2xl tracking-widest text-gray-800 font-bold">CUSTOMER REVIEWS</h3>
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <div key={review.id || index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#dc6fd6] to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {review.name ? review.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{review.name || 'ลูกค้า'}</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < (review.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">"{review.comment || 'สินค้าสวยมาก คุณภาพดี จัดส่งเร็วมากค่ะ'}"</p>
                  {review.product_name && (
                    <p className="text-xs text-[#dc6fd6] mt-3 font-medium">ซื้อ: {review.product_name}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Placeholder reviews ถ้ายังไม่มีข้อมูลจาก database */}
              {[
                { name: 'คุณอริสา', comment: 'เสื้อสวยมากค่ะ ผ้านิ่มใส่สบาย จะกลับมาซื้ออีกแน่นอนค่ะ', rating: 5 },
                { name: 'คุณปราง', comment: 'จัดส่งเร็วมาก แพ็คเกจดี สินค้าตรงปก ประทับใจมากๆ', rating: 5 },
                { name: 'คุณนิชา', comment: 'ชอบสีสวยมาก ใส่แล้วดูดีมีสไตล์ แนะนำเลยค่ะ', rating: 5 },
              ].map((review, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#dc6fd6] to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{review.name}</p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">"{review.comment}"</p>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link 
              href="/reviews" 
              className="inline-flex items-center gap-2 text-[#dc6fd6] font-semibold text-sm hover:underline"
            >
              ดูรีวิวทั้งหมด
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}