import React from 'react';

// 🌟 1. สร้าง Mock Data (ข้อมูลบทความ/โปรโมชั่นจำลอง)
const newsData = [
  {
    id: 1,
    title: "🔥 ฉลองเปิดร้านใหม่ GRAND OPENING ลดสูงสุด 60%!",
    category: "Promotion",
    date: "15 มีนาคม 2024",
    excerpt: "ต้อนรับการเปิดตัวเว็บ Bamblue store อย่างเป็นทางการ แจกโค้ดส่วนลดจุกๆ สำหรับลูกค้าใหม่ทุกคน พร้อมโปรส่งฟรีไม่มีขั้นต่ำ!",
    image: "/Picture/banner2.png", // รูปแบนเนอร์ที่คุณเพิ่งทำไป
  },
  {
    id: 2,
    title: "👗 5 ทริคแมทช์เสื้อครอปยังไงให้ดู 'Simply Stylish'",
    category: "Fashion Tips",
    date: "10 มีนาคม 2024",
    excerpt: "หมดปัญหาคิดไม่ออกว่าจะใส่อะไรดี! วันนี้ Bamblue มีไอเดียแมทช์เสื้อครอปตัวเก่งให้เข้ากับกางเกงและกระโปรงทรงต่างๆ มาฝากสาวๆ กันค่ะ",
    image: "/Picture/banner1.png", // ใช้รูปแบนเนอร์1 เป็นตัวอย่างไปก่อน
  },
  {
    id: 3,
    title: "✨ คอลเลกชันใหม่ 'Summer Breeze' สดใสรับซัมเมอร์",
    category: "New Arrival",
    date: "1 มีนาคม 2024",
    excerpt: "เตรียมพบกับคอลเลกชันใหม่ล่าสุดที่จะทำให้ซัมเมอร์นี้ของคุณไม่น่าเบื่ออีกต่อไป ด้วยโทนสีพาสเทลและเนื้อผ้าที่ระบายอากาศได้ดีเยี่ยม",
    image: "/Picture/banner1.png",
  }
];

export default function PromotionsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-24">
      {/* 🎯 Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">ข่าวสาร & โปรโมชั่น</h1>
        <p className="text-gray-500">
          อัปเดตเทรนด์แฟชั่นใหม่ๆ และไม่พลาดทุกโปรโมชั่นสุดคุ้มจาก Bamblue store ก่อนใคร!
        </p>
      </div>

      {/* 📰 Blog/News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {newsData.map((item) => (
          <article key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group cursor-pointer flex flex-col">
            
            {/* 🖼️ รูปภาพหน้าปกบทความ */}
            <div className="relative h-56 w-full overflow-hidden bg-gray-200">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* ป้าย Category มุมขวาบน */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-pink-500 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                {item.category}
              </div>
            </div>

            {/* 📝 เนื้อหาบทความ */}
            <div className="p-6 flex flex-col grow">
              <span className="text-sm text-gray-400 mb-2 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                {item.date}
              </span>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pink-500 transition-colors line-clamp-2">
                {item.title}
              </h3>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                {item.excerpt}
              </p>

              {/* ปุ่มอ่านต่อ (จะถูกดันไปอยู่ล่างสุดเสมอด้วย mt-auto) */}
              <div className="mt-auto">
                <span className="text-zinc-900 font-semibold text-sm border-b-2 border-transparent group-hover:border-pink-500 transition-colors pb-1 inline-flex items-center gap-1">
                  อ่านเพิ่มเติม
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* ➕ ปุ่มโหลดเพิ่มเติม */}
      <div className="text-center mt-12">
        <button className="border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white px-8 py-2.5 rounded shadow-sm transition-all text-sm font-semibold">
          ดูข่าวสารทั้งหมด
        </button>
      </div>
    </main>
  );
}