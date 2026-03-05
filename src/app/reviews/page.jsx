import React from 'react';

// 🌟 1. สร้าง Mock Data (ข้อมูลรีวิวจำลอง)
// เดี๋ยวอนาคตเราค่อยดึงข้อมูลนี้มาจากฐานข้อมูล (Database) จริงๆ ครับ
const reviewsData = [
  {
    id: 1,
    customerName: "คุณแพรวา ม.",
    rating: 5,
    date: "12 มีนาคม 2024",
    productName: "เสื้อเดรสซัมเมอร์สีเหลือง",
    reviewText: "ชุดสวยตรงปกมากค่ะ! เนื้อผ้าใส่สบาย ไม่ร้อนเลย เหมาะกับใส่ออกไปคาเฟ่หรือไปทะเลสุดๆ แพ็คของมาดีมาก ประทับใจค่ะ 💛",
    // สมมติว่ามีรูปรีวิว (ถ้าไม่มีให้ใส่ null)
    image: "/Picture/product/product1.jpg" // ดึงรูปที่มีอยู่มาเทสก่อนได้ครับ
  },
  {
    id: 2,
    customerName: "คุณจินนี่ K.",
    rating: 5,
    date: "5 มีนาคม 2024",
    productName: "เสื้อครอปสีดำ (Youth Elevated)",
    reviewText: "ทรงสวยมากก ใส่แล้วดูผอม แมทช์กับกางเกงยีนส์เอวสูงคือปัง! แอดมินตอบแชทไว แนะนำไซส์ได้เป๊ะมากค่ะ เดี๋ยวมาอุดหนุนอีกแน่นอน",
    image: null
  },
  {
    id: 3,
    customerName: "คุณ Nooknik",
    rating: 4,
    date: "28 กุมภาพันธ์ 2024",
    productName: "กระเป๋าสะพายข้าง มินิมอล",
    reviewText: "กระเป๋าน่ารักมาก จุของได้เยอะกว่าที่คิด เสียอย่างเดียวคือสายสะพายยาวไปนิดนึงสำหรับคนตัวเล็ก นอกนั้นเพอร์เฟกต์ค่ะ",
    image: null
  },
  {
    id: 4,
    customerName: "คุณมายด์",
    rating: 5,
    date: "14 กุมภาพันธ์ 2024",
    productName: "เสื้อไหมพรมคาร์ดิแกน",
    reviewText: "สีชมพูละมุนมากกก ใส่คลุมไปเรียนคือได้ลุคคุณหนูสุดๆ ผ้าไม่หนาเกินไป เหมาะกับอากาศประเทศไทยค่ะ เลิฟเลย 🌸",
    image: null
  }
];

// ⭐️ คอมโพเนนต์สำหรับแสดงดาว
const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-1 text-pink-400">
      {[...Array(5)].map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={i < rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385c.148.621-.531 1.121-1.097.82l-4.816-2.568a.563.563 0 00-.538 0l-4.816 2.568c-.566.301-1.245-.199-1.097-.82l1.285-5.385a.563.563 0 00-.182-.557l-4.204-3.602c-.38-.325-.178-.95.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ))}
    </div>
  );
};

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-24">
      {/* 🎯 Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">รีวิวจากลูกค้า</h1>
        <p className="text-gray-500">
          ขอบคุณทุกเสียงตอบรับจากลูกค้าที่น่ารักของเรา Bamblue store ยินดีที่ได้เป็นส่วนหนึ่งในสไตล์ของคุณ 💖
        </p>
      </div>

      {/* 📝 Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {reviewsData.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            {/* ดาวและวันที่ */}
            <div className="flex justify-between items-center mb-4">
              <StarRating rating={review.rating} />
              <span className="text-xs text-gray-400">{review.date}</span>
            </div>

            {/* ชื่อลูกค้า */}
            <h3 className="font-semibold text-gray-800 mb-1">{review.customerName}</h3>
            
            {/* สินค้าที่ซื้อ */}
            <p className="text-xs text-pink-500 font-medium mb-3">ซื้อสินค้า: {review.productName}</p>

            {/* ข้อความรีวิว */}
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              "{review.reviewText}"
            </p>

            {/* รูปรีวิว (ถ้ามี) */}
            {review.image && (
              <div className="mt-4 rounded-lg overflow-hidden h-40 bg-gray-100">
                <img 
                  src={review.image} 
                  alt={`รีวิวจาก ${review.customerName}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ➕ ปุ่มโหลดเพิ่มเติม (อนาคต) */}
      <div className="text-center mt-12">
        <button className="border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white px-8 py-2.5 rounded shadow-sm transition-all text-sm font-semibold">
          ดูรีวิวเพิ่มเติม
        </button>
      </div>
    </main>
  );
}