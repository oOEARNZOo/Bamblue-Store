"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useWishlist } from './context/WishlistContext';
import { Heart, MessageSquare, RefreshCcw, Ruler, ShieldCheck, Trash2, Truck, X } from 'lucide-react';

// 🌟 1. นำเข้า Supabase
import { supabasePublic } from '@/lib/supabase';
import { 
  HeroBannerSkeleton, 
  ProductGridSkeleton 
} from './components/LoadingSkeletons';
import { ProductImage } from './components/OptimizedImage';

const PRODUCT_CARD_COLUMNS = 'id, nameEN, nameTH, price, original_price, image, images, is_new, discount_percent, stock, size_stock, category';
const HOME_REVIEW_COLUMNS = 'id, reviewer_name, rating, title, comment, created_at, is_verified, product_name_en, product_name_th';

export default function Home() {
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const [confirmRemove, setConfirmRemove] = useState(null);

  // ตรวจสอบว่าสินค้าอยู่ใน wishlist หรือไม่ (useCallback เพื่อ optimize)
  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item.id === productId);
  }, [wishlistItems]);

  // Toggle wishlist (useCallback เพื่อ optimize)
  const toggleWishlist = useCallback((item) => {
    if (wishlistItems.some(i => i.id === item.id)) {
      setConfirmRemove(item.id);
    } else {
      addToWishlist(item);
      setConfirmRemove(null);
    }
  }, [wishlistItems, addToWishlist]);

  const cancelRemoveWishlist = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setConfirmRemove(null);
  }, []);

  const confirmRemoveWishlist = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    if (confirmRemove) {
      removeFromWishlist(confirmRemove);
      setConfirmRemove(null);
    }
  }, [confirmRemove, removeFromWishlist]);

  // 🌟 2. สร้าง State สำหรับรับข้อมูลสินค้าใหม่จาก Supabase
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newArrivalPage, setNewArrivalPage] = useState(0);
  const [newArrivalVisibleCount, setNewArrivalVisibleCount] = useState(4);
  const newArrivalCarouselRef = useRef(null);

  // ข้อมูลแบนเนอร์ (ปรับปรุงให้ครบถ้วน)
  const banners = [
    {
      id: 1,
      image: "/Picture/banner1.png",
      title: "YOUTH\nELEVATED",
      subtitle: "SIMPLY STYLISH",
      description: "คอลเลกชันโทนพาสเทล ใส่ง่าย ถ่ายรูปขึ้น และแต่งได้ทุกวัน",
      btnText: "SHOP THE DROP",
      link: "/products",
      accent: "from-[#f779c9] to-[#c18cff]",
      bg: "from-[#4b2451] via-[#c86bb2] to-[#ffe4f2]",
      showcase: [
        "/Picture/product 2/Candy Floss Ruffle Dress/product 1.1.png",
        "/Picture/product 2/White Marshmallow Layered Dress/product 1.1.png",
        "/Picture/product 2/Fairy Blossom Mini Dress/product 1.1.png",
        "/Picture/product 2/Blue Sky Cropped Set/product 1.1.png"
      ]
    },
    {
      id: 2,
      image: "/Picture/banner2.png",
      title: "NEW COLLECTION",
      subtitle: "SPRING 2026",
      description: "เดรสและเสื้อครอปดีเทลหวาน พร้อมโปรเปิดตัวสำหรับลุคใหม่ของคุณ",
      btnText: "EXPLORE NOW",
      link: "/products?category=dress",
      accent: "from-[#ff7fbd] to-[#ffc27e]",
      bg: "from-[#55304e] via-[#df7fb1] to-[#fff1df]",
      showcase: [
        "/Picture/product 2/Pearl Kiss Ribbon Camisole/product 9.1.jpg",
        "/Picture/product 2/Butterfly Lemonade Ruched Top/product 1.1.png",
        "/Picture/product 2/Vintage Solstice Bodycon Dress/product 1.1.png",
        "/Picture/product 2/Choco Glaze Ribbon Tube/product 1.1.jpg"
      ]
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

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setNewArrivalVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setNewArrivalVisibleCount(2);
      } else {
        setNewArrivalVisibleCount(4);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const newArrivalTotalPages = Math.ceil(newArrivals.length / newArrivalVisibleCount);
  const newArrivalMaxPage = Math.max(newArrivalTotalPages - 1, 0);
  const showNewArrivalControls = newArrivals.length > newArrivalVisibleCount;

  useEffect(() => {
    setNewArrivalPage((prev) => Math.min(prev, newArrivalMaxPage));
  }, [newArrivalMaxPage]);

  useEffect(() => {
    const carousel = newArrivalCarouselRef.current;
    const firstCard = carousel?.querySelector('[data-new-arrival-card="true"]');

    if (!carousel || !firstCard) return;

    const styles = window.getComputedStyle(carousel);
    const gap = parseFloat(styles.columnGap || styles.gap || '0');
    const cardWidth = firstCard.getBoundingClientRect().width;
    const targetCardIndex = Math.min(
      newArrivalPage * newArrivalVisibleCount,
      Math.max(newArrivals.length - newArrivalVisibleCount, 0)
    );

    carousel.scrollTo({
      left: targetCardIndex * (cardWidth + gap),
      behavior: 'smooth'
    });
  }, [newArrivalPage, newArrivalVisibleCount, newArrivals.length]);

  const nextNewArrival = () => {
    setNewArrivalPage((prev) => Math.min(prev + 1, newArrivalMaxPage));
  };

  const prevNewArrival = () => {
    setNewArrivalPage((prev) => Math.max(prev - 1, 0));
  };

  // 🌟 3. ฟังก์ชันดึงข้อมูลทั้งหมดจาก Supabase (Optimized with Promise.all)
  useEffect(() => {
    async function fetchAllData() {
      try {
        setIsLoading(true);
        
        // 🚀 ดึงข้อมูลทั้งหมดพร้อมกัน (Parallel Fetching)
        const [newArrivalsRes, bestSellersRes, reviewsRes] = await Promise.all([
          // ดึง New Arrivals (4 ชิ้นแรก)
          supabasePublic.from('products1').select(PRODUCT_CARD_COLUMNS).eq('is_new', true).order('id', { ascending: true }).limit(12),
          // ดึง Best Sellers (4 ชิ้นสุ่ม)
          supabasePublic.from('products1').select(PRODUCT_CARD_COLUMNS).order('id', { ascending: false }).limit(4),
          // ดึงรีวิวล่าสุด (3 รีวิว)
          supabasePublic.from('reviews').select(HOME_REVIEW_COLUMNS).eq('is_approved', true).order('created_at', { ascending: false }).limit(3)
        ]);

        // Set ข้อมูลสินค้า
        setNewArrivals(newArrivalsRes.data || []);
        setBestSellers(bestSellersRes.data || []);
        setReviews((reviewsRes.data || []).map((review) => ({
          ...review,
          name: review.reviewer_name,
          product_name: review.product_name_th || review.product_name_en
        })));

      } catch (err) {
        console.error("System Error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAllData();
  }, []);

  return (
    <main className="min-h-screen flex flex-col">

      {/* 🌟 Section 1: Hero Banner Slider (แก้ไขความสูงตรงนี้) 🌟 */}
      <section className="group relative isolate h-[520px] w-full overflow-hidden bg-[#fbf7fb] md:h-[600px]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
          >
            {/* 🖼️ ใช้ BannerImage แทน background-image */}
            <div className={`absolute inset-0 bg-gradient-to-br ${banner.bg}`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_26%,rgba(255,255,255,0.42),transparent_25%),radial-gradient(circle_at_48%_86%,rgba(255,196,226,0.42),transparent_32%),radial-gradient(circle_at_18%_78%,rgba(193,140,255,0.24),transparent_30%)]" />
            <div className="absolute inset-y-0 right-0 hidden w-[64%] lg:block">
              <div className="absolute right-[7%] top-[9%] h-[460px] w-[460px] rounded-full bg-white/18 blur-3xl" />
              <div className="absolute right-[18%] top-[16%] h-[360px] w-[360px] rounded-full bg-[#ffd8ec]/30 blur-2xl" />
              {banner.showcase.map((image, imageIndex) => (
                <div
                  key={image}
                  className={`absolute rounded-[2.2rem] border border-white/45 bg-white/24 p-2 shadow-[0_28px_90px_rgba(28,15,36,0.24)] backdrop-blur-md ${[
                    'right-[28%] top-[9%] w-52 -rotate-6',
                    'right-[7%] top-[19%] w-48 rotate-5',
                    'right-[34%] bottom-[8%] w-44 rotate-3',
                    'right-[10%] bottom-[12%] w-40 -rotate-6'
                  ][imageIndex]}`}
                >
                  <ProductImage
                    src={image}
                    alt={`${banner.title} product ${imageIndex + 1}`}
                    className="rounded-[1.6rem]"
                    showZoom={false}
                  />
                </div>
              ))}
            </div>
            
            {/* 🌟 Gradient Overlay เพื่อให้อ่านข้อความง่ายขึ้น */}
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#2d1633]/72 via-[#7a3b6c]/24 to-transparent" />
            <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_18%_28%,rgba(247,121,201,0.32),transparent_28%),radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.28),transparent_25%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0))]" />
            <div className="hero-noise absolute inset-0 z-10 opacity-[0.12]" />
            
            <div className="absolute inset-0 z-20 flex items-center px-6 sm:px-10 lg:px-24">
              <div className={`mt-8 max-w-[620px] text-left md:mt-0 ${index === currentSlide ? 'animate-hero-copy' : ''}`}>
                <div className={`mb-6 h-1.5 w-24 rounded-full bg-gradient-to-r ${banner.accent}`} />
                {banner.subtitle && (
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.38em] text-white/75 md:text-sm">
                    {banner.subtitle}
                  </p>
                )}
                <h1 className="whitespace-pre-line text-[3.7rem] font-black uppercase leading-[0.88] tracking-[-0.055em] text-white drop-shadow-[0_12px_38px_rgba(0,0,0,0.34)] sm:text-7xl lg:text-[6.8rem]">
                  {banner.title}
                </h1>
                <p className="hidden">
                  ค้นพบคอลเลกชันใหม่ล่าสุด สไตล์มินิมอลที่เหมาะกับทุกโอกาส
                </p>
                <p className="mt-7 max-w-md text-sm font-medium leading-7 text-white/84 md:text-base">
                  {banner.description}
                </p>
                <div className="mt-9 flex flex-wrap items-center gap-4">
                {banner.btnText && (
                  <Link 
                    href={banner.link || '/products'}
                    className={`inline-flex items-center gap-3 rounded-full bg-gradient-to-r ${banner.accent} px-8 py-3.5 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_18px_42px_rgba(220,111,214,0.34)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(220,111,214,0.42)]`}
                  >
                    {banner.btnText}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.4} stroke="currentColor" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                )}
                  <Link
                    href="/products?category=dress"
                    className="inline-flex items-center rounded-full border border-white/35 bg-white/12 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md transition-all hover:bg-white hover:text-[#2b2030]"
                  >
                    View Dresses
                  </Link>
                </div>
                </div>
            </div>

            <div className="absolute bottom-8 left-6 z-20 hidden text-[10px] font-bold uppercase tracking-[0.28em] text-white/60 md:left-24 md:block">
              Bamblue Store / K-Fashion Thailand
            </div>
          </div>
        ))}

        <button onClick={prevSlide} aria-label="Previous banner" className="absolute left-4 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/35 bg-white/16 text-white opacity-0 shadow-lg backdrop-blur-xl transition-all hover:-translate-x-1 hover:bg-white hover:text-[#302238] group-hover:opacity-100 md:left-7">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.3} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        </button>
        <button onClick={nextSlide} aria-label="Next banner" className="absolute right-4 top-1/2 z-30 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/35 bg-white/16 text-white opacity-0 shadow-lg backdrop-blur-xl transition-all hover:translate-x-1 hover:bg-white hover:text-[#302238] group-hover:opacity-100 md:right-7">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.3} stroke="currentColor" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        </button>

        <div className="absolute bottom-8 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/30 bg-white/18 px-3 py-2 backdrop-blur-xl">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to banner ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${index === currentSlide ? "w-10 bg-white" : "w-2.5 bg-white/45 hover:bg-white/80"}`}
            />
          ))}
        </div>
      </section>


      {/* 🌟 Section 2: NEW ARRIVALS */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-6 py-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Truck, title: 'จัดส่งฟรี', text: 'สำหรับทุกออเดอร์ในไทย' },
            { icon: Ruler, title: 'เลือกไซส์ก่อนซื้อ', text: 'ผูกกับสต็อกตามไซส์จริง' },
            { icon: RefreshCcw, title: 'คืนสินค้า 14 วัน', text: 'ตามเงื่อนไขของร้าน' },
            { icon: ShieldCheck, title: 'ชำระเงินปลอดภัย', text: 'ตรวจสอบคำสั่งซื้อได้' }
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#dc6fd6] shadow-sm">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-sm font-black text-gray-950">{title}</p>
                <p className="mt-0.5 text-xs text-gray-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl tracking-widest text-[#dc6fd6] border-gray-200 border-b font-medium">NEW ARRIVALS</h3>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : newArrivals.length === 0 ? (
            <p className="text-center text-sm text-gray-500">ยังไม่มีสินค้าใหม่ในตอนนี้</p>
          ) : (
            <div className="relative">
              {showNewArrivalControls && (
                <>
                  <button
                    onClick={prevNewArrival}
                    disabled={newArrivalPage === 0}
                    aria-label="Previous new arrival"
                    className="absolute -left-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg ring-1 ring-gray-200 transition-all hover:bg-[#dc6fd6] hover:text-white disabled:pointer-events-none disabled:opacity-30 lg:flex"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={nextNewArrival}
                    disabled={newArrivalPage === newArrivalMaxPage}
                    aria-label="Next new arrival"
                    className="absolute -right-3 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg ring-1 ring-gray-200 transition-all hover:bg-[#dc6fd6] hover:text-white disabled:pointer-events-none disabled:opacity-30 lg:flex"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </>
              )}

              <div
                ref={newArrivalCarouselRef}
                className="flex snap-x snap-mandatory gap-6 overflow-hidden scroll-smooth"
              >
              {newArrivals.map((item) => (
                <div key={item.id} data-new-arrival-card="true" className="group relative flex shrink-0 snap-start flex-col text-center transition-transform duration-500 ease-out basis-full sm:basis-[calc((100%_-_1.5rem)/2)] lg:basis-[calc((100%_-_4.5rem)/4)]">
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
                  <div className="absolute top-2 right-2 z-10">
                    <div
                      className="flex items-center overflow-hidden rounded-full bg-white/95 shadow-md backdrop-blur-sm transition-all duration-300 ease-out"
                      style={{ width: confirmRemove === item.id ? '72px' : '32px' }}
                    >
                      {confirmRemove === item.id ? (
                        <div className="flex w-full items-center gap-1 px-1 py-1">
                          <button
                            onClick={cancelRemoveWishlist}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[0px] text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Cancel remove from wishlist"
                          >
                            <X size={14} />
                            ยกเลิก
                          </button>
                          <button
                            onClick={confirmRemoveWishlist}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-red-500 text-[0px] text-white transition-colors hover:bg-red-600"
                            aria-label={`Confirm remove ${item.nameEN} from wishlist`}
                          >
                            <Trash2 size={14} />
                            ลบ
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(item); }}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-white"
                          aria-label={isInWishlist(item.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart
                            size={16}
                            className={isInWishlist(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}
                          />
                        </button>
                      )}
                    </div>
                  </div>

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
                  
                  {/* เลือกไซส์ก่อนซื้อเพื่อให้ตรงกับสต็อกตามไซส์ */}
                  <Link
                    href={`/product/${item.id}`}
                    className={`flex h-10 w-full items-center justify-center rounded-lg text-xs font-semibold tracking-widest transition-all ${
                      item.stock === 0
                        ? 'bg-gray-200 text-gray-400'
                        : 'border border-gray-300 text-gray-600 hover:border-[#dc6fd6] hover:bg-[#dc6fd6] hover:text-white'
                    }`}
                  >
                    {item.stock === 0 ? 'ดูรายละเอียด' : 'เลือกไซส์'}
                  </Link>
                </div>
              ))}
              </div>

              {showNewArrivalControls && (
                <div className="mt-8 flex items-center justify-center gap-3 lg:hidden">
                  <button
                    onClick={prevNewArrival}
                    disabled={newArrivalPage === 0}
                    aria-label="Previous new arrival"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-md ring-1 ring-gray-200 transition-all hover:bg-[#dc6fd6] hover:text-white disabled:pointer-events-none disabled:opacity-30"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={nextNewArrival}
                    disabled={newArrivalPage === newArrivalMaxPage}
                    aria-label="Next new arrival"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-md ring-1 ring-gray-200 transition-all hover:bg-[#dc6fd6] hover:text-white disabled:pointer-events-none disabled:opacity-30"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 🌟 Section 4: BEST SELLERS */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm text-[#dc6fd6] font-medium tracking-widest uppercase mb-2 block">สินค้ายอดนิยม</span>
            <h3 className="text-2xl tracking-widest text-gray-800 font-bold">BEST SELLERS</h3>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <div className="absolute top-2 right-2 z-10">
                    <div
                      className="flex items-center overflow-hidden rounded-full bg-white/95 shadow-md backdrop-blur-sm transition-all duration-300 ease-out"
                      style={{ width: confirmRemove === item.id ? '72px' : '32px' }}
                    >
                      {confirmRemove === item.id ? (
                        <div className="flex w-full items-center gap-1 px-1 py-1">
                          <button
                            onClick={cancelRemoveWishlist}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[0px] text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                            aria-label="Cancel remove from wishlist"
                          >
                            <X size={14} />
                            ยกเลิก
                          </button>
                          <button
                            onClick={confirmRemoveWishlist}
                            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-red-500 text-[0px] text-white transition-colors hover:bg-red-600"
                            aria-label={`Confirm remove ${item.nameEN} from wishlist`}
                          >
                            <Trash2 size={14} />
                            ลบ
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(item); }}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all hover:scale-110 hover:bg-white"
                          aria-label={isInWishlist(item.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                          <Heart
                            size={16}
                            className={isInWishlist(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}
                          />
                        </button>
                      )}
                    </div>
                  </div>

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
                  
                  {/* เลือกไซส์ก่อนซื้อเพื่อให้ตรงกับสต็อกตามไซส์ */}
                  <Link
                    href={`/product/${item.id}`}
                    className={`flex h-10 w-full items-center justify-center rounded-lg text-xs font-semibold tracking-widest transition-all shadow-sm ${
                      item.stock === 0
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-[#dc6fd6] text-white hover:bg-[#c55fc6]'
                    }`}
                  >
                    {item.stock === 0 ? 'ดูรายละเอียด' : 'เลือกไซส์'}
                  </Link>
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
      <section className="py-16 bg-white">
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
                      {(review.reviewer_name || 'U').charAt(0).toUpperCase()}
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
            <div className="mx-auto flex max-w-xl flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
              <MessageSquare size={42} className="mb-4 text-gray-300" />
              <h4 className="text-lg font-black text-gray-950">ยังไม่มีรีวิวจริงในตอนนี้</h4>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                เมื่อมีรีวิวที่อนุมัติจากระบบ รีวิวล่าสุดจะแสดงในส่วนนี้อัตโนมัติ
              </p>
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
