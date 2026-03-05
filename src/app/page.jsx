"use client"; // 🌟 สำคัญมาก: ต้องมีบรรทัดนี้อยู่บนสุด เพื่อให้ปุ่มกดทำงานได้

import { useCart } from './context/CartContext'; // ดึงระบบตะกร้ามาใช้
import Link from 'next/link';
import { productsData } from '../data/products'; // สมมติว่ามีไฟล์นี้เก็บข้อมูลสินค้า
import { useState, useEffect } from 'react';


export default function Home() {
  const { addToCart } = useCart(); // เรียกใช้ฟังก์ชันเพิ่มลงตะกร้า

  // ข้อมูลสินค้า
  const newArrivals = [
    {
      id: 1,
      nameTH: "เสื้อรูดข้างประดับผีเสื้อสีเลมอน",
      nameEN: "Butterfly Lemonade Ruched Top",
      price: "฿1,290",
      image: "/Picture/product/product1.jpg", // ⚠️ อย่าลืมแก้ชื่อไฟล์รูป
    },
    {
      id: 2,
      nameTH: "เดรสเกาะอกลายซันเซ็ทวินเทจ",
      nameEN: "Vintage Solstice Bodycon Dress",
      price: "฿1,290",
      image: "/Picture/product/product2.jpg", // ⚠️ อย่าลืมแก้ชื่อไฟล์รูป
    },
    {
      id: 3,
      nameTH: "เสื้อเกาะอกแต่งโบว์สีโกโก้",
      nameEN: "Choco Glaze Ribbon Tube",
      price: "฿1,290",
      image: "/Picture/product/product3.jpg", // ⚠️ อย่าลืมแก้ชื่อไฟล์รูป
    },
    {
      id: 4,
      nameTH: "เสื้อคล้องคอสีดำลุค Glam",
      nameEN: "Midnight Glam Halter Top",
      price: "฿1,290",
      image: "/Picture/product/product4.jpg", // ⚠️ อย่าลืมแก้ชื่อไฟล์รูป
    },
    {
      id: 5,
      nameTH: "เดรสสั้นเจ้าหญิงลายดอก",
      nameEN: "Fairy Blossom Mini Dress",
      price: "฿1,290",
      image: "/Picture/product/product5.jpg", // ⚠️ อย่าลืมแก้ชื่อไฟล์รูป
    },
    {
      id: 6,
      nameTH: "เดรสสายเดี่ยวชายระบายสีพาสเทล",
      nameEN: "Candy Floss Ruffle Dress",
      price: "฿1,290",
      image: "/Picture/product/product6.jpg", // ⚠️ อย่าลืมแก้ชื่อไฟล์รูป
    },
    {
      id: 7,
      nameTH: "เดรสขาวเลเยอร์นุ่มฟู",
      nameEN: "White Marshmallow Layered Dress",
      price: "฿1,290",
      image: "/Picture/product/product7.jpg", // ⚠️ อย่าลืมแก้ชื่อไฟล์รูป
    },
    {
      id: 8,
      nameTH: "ชุดเซ็ตสเวตเตอร์ครอปสีฟ้า",
      nameEN: "Blue Sky Cropped Set",
      price: "฿1,290",
      image: "/Picture/product/product8.jpg", // ⚠️ อย่าลืมแก้ชื่อไฟล์รูป
    },
  ];

  // 👇 1. สร้างข้อมูลแบนเนอร์ (ใส่รูปและข้อความของแต่ละสไลด์ตรงนี้) 👇
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
      image: "/Picture/banner2.png", // รูปโปรโมชั่นใหม่ของคุณ!
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  // 👇 2. ตั้งเวลาให้เลื่อนอัตโนมัติทุกๆ 5 วินาที 👇
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 10000); // 10000 มิลลิวินาที = 10 วินาที
    return () => clearInterval(timer); // เคลียร์เวลาเมื่อเปลี่ยนหน้า
  }, [banners.length]);

  // ฟังก์ชันกดเลื่อนซ้าย-ขวา
  const nextSlide = () => setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));

  return (
    <main className="min-h-screen flex flex-col">

      {/* 🌟 Section 1: Hero Banner Slider 🌟 */}
      <section className="relative w-full h-125 md:h-150 overflow-hidden bg-gray-100 group">

        {/* 🖼️ วนลูปแสดงรูปภาพ */}
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
          >
            {/* รูปพื้นหลัง */}
            <div
              className="absolute inset-0 bg-cover bg-top"
              style={{ backgroundImage: `url('${banner.image}')` }}
            ></div>

            {/* ข้อความบนแบนเนอร์ */}
            <div className="relative h-full flex items-center px-8 md:px-24 z-20">
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

            {/* ◀️ ปุ่มเลื่อนซ้าย (จะโผล่มาตอนเอาเมาส์ชี้) */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            {/* ▶️ ปุ่มเลื่อนขวา */}
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* 🔵 จุดบอกตำแหน่งสไลด์ (Dots) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all cursor-pointer shadow-md ${index === currentSlide ? "bg-white scale-110" : "bg-white/50 hover:bg-white/80"
                    }`}
                ></button>
              ))}
            </div>

            {/* ◀️ ปุ่มเลื่อนซ้าย (จะโผล่มาตอนเอาเมาส์ชี้) */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>

            {/* ▶️ ปุ่มเลื่อนขวา */}
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/30 hover:bg-white/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </section>


      {/* 🌟 Section 2: NEW ARRIVALS */}
          <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h3 className="text-2xl tracking-widest text-[#dc6fd6] border-gray-200 border-b font-medium">NEW ARRIVALS</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {newArrivals.map((item) => (
                <div key={item.id} className="group flex flex-col text-center">
                  {/* 🌟 เอา Link มาครอบรูปภาพและชื่อสินค้า เพื่อให้กดเข้าไปดูรายละเอียดได้ */}
                  <Link href={`/product/${item.id}`} className="block">
                    <div className="w-full bg-gray-100 aspect-3/4 mb-4 overflow-hidden rounded-md relative cursor-pointer">
                      <img src={item.image} alt={item.nameEN} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 mb-1">{item.nameTH}</p>
                      <h4 className="text-sm font-semibold text-zinc-900 mb-1 tracking-wide group-hover:text-pink-400 transition-colors">{item.nameEN}</h4>
                      <p className="text-sm text-gray-700 mb-4 font-medium">{item.price}</p>
                    </div>
                  </Link>
                  {/* 🌟 ปุ่ม QUICK ADD ที่แก้ไขให้ทำงานได้จริงแล้ว */}
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full py-2 border border-gray-300 text-gray-600 text-xs font-semibold tracking-widest hover:border-zinc-900 hover:text-zinc-900 transition-colors cursor-pointer">
                    QUICK ADD
                  </button>
                </div>
              ))}
            </div>
          </div>
      </section>
    </main>
  );
} 