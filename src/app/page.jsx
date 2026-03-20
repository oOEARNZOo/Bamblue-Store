"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from './context/CartContext';

// 🌟 1. นำเข้า Supabase
import { supabase } from '@/lib/supabase';
import { 
  HeroBannerSkeleton, 
  ProductGridSkeleton 
} from './components/LoadingSkeletons';
import { ProductImage, BannerImage } from './components/OptimizedImage';

export default function Home() {
  const { addToCart } = useCart();

  // 🌟 2. สร้าง State สำหรับรับข้อมูลสินค้าใหม่จาก Supabase
  const [newArrivals, setNewArrivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ข้อมูลแบนเนอร์ (คงไว้เหมือนเดิม)
  const banners = [
    {
      id: 1,
      image: "/Picture/banner1.png",
      title: "YOUTH ELEVATED",
      subtitle: "SIMPLY STYLISH",
      btnText: "SHOP NOW"
    },
    {
      id: 2,
      image: "/Picture/banner2.png",
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

  // 🌟 3. ฟังก์ชันดึงข้อมูล New Arrivals จาก Supabase
  useEffect(() => {
    async function fetchNewArrivals() {
      try {
        setIsLoading(true);
        // ดึงข้อมูลจากตาราง products1 เรียงจาก id น้อยไปมาก (เพื่อให้ id 1 ขึ้นก่อน) และเอามาแค่ 4 ชิ้น
        const { data, error } = await supabase
          .from('products1')
          .select('*')
          .order('id', { ascending: true })
          .limit(4);

        if (error) {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
        } else {
          setNewArrivals(data || []);
        }
      } catch (err) {
        console.error("System Error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNewArrivals();
  }, []);

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
            <div className="absolute inset-0 h-full flex items-center px-8 md:px-24 z-20">
              <div className="max-w-xl text-center md:text-left mt-10 md:mt-0">
                <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg mb-2 tracking-wider">
                  {banner.title}
                </h1>
                <h2 className="text-3xl md:text-4xl font-light text-white drop-shadow-lg mb-8 tracking-wide">
                  {banner.subtitle}
                </h2>
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-2xl tracking-widest text-[#dc6fd6] border-gray-200 border-b font-medium">NEW ARRIVALS</h3>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {newArrivals.map((item) => (
                <div key={item.id} className="group flex flex-col text-center">
                  <Link href={`/product/${item.id}`} className="block">
                    {/* 🖼️ ใช้ ProductImage แทน img tag */}
                    <div className="w-full mb-4 rounded-md overflow-hidden cursor-pointer">
                      <ProductImage 
                        src={item.image} 
                        alt={item.nameEN}
                        className="rounded-md"
                      />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">{item.nameTH}</p>
                      <h4 className="text-sm font-semibold text-zinc-900 mb-1 tracking-wide group-hover:text-pink-400 transition-colors">{item.nameEN}</h4>
                      <p className="text-sm text-gray-700 mb-4 font-medium">
                        ฿{item.price ? item.price.toLocaleString() : 0}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => {
                      addToCart(item);
                    }}
                    className="w-full py-2 border border-gray-300 text-gray-600 text-xs font-semibold tracking-widest hover:border-zinc-900 hover:text-zinc-900 transition-colors cursor-pointer">
                    QUICK ADD
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}