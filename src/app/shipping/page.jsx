"use client";
import React from 'react';
import Link from 'next/link';
import { Truck, Package, Clock, MapPin, Shield, CreditCard, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ShippingPage() {
  const shippingMethods = [
    {
      icon: <Truck className="w-8 h-8" />,
      title: "จัดส่งมาตรฐาน",
      duration: "3-5 วันทำการ",
      price: "฿50",
      description: "จัดส่งผ่าน Kerry Express หรือ Flash Express",
      freeAbove: "ฟรี! เมื่อสั่งซื้อครบ ฿2,000"
    },
    {
      icon: <Package className="w-8 h-8" />,
      title: "จัดส่งด่วน",
      duration: "1-2 วันทำการ",
      price: "฿100",
      description: "จัดส่งผ่าน Kerry Express (EMS)",
      freeAbove: null
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "จัดส่งในวันเดียว",
      duration: "ภายใน 24 ชม.",
      price: "฿150",
      description: "เฉพาะกรุงเทพฯ และปริมณฑล (สั่งก่อน 12:00 น.)",
      freeAbove: null
    }
  ];

  const deliveryAreas = [
    { area: "กรุงเทพฯ และปริมณฑล", standard: "2-3 วัน", express: "1 วัน" },
    { area: "ภาคกลาง", standard: "2-3 วัน", express: "1-2 วัน" },
    { area: "ภาคเหนือ", standard: "3-4 วัน", express: "2 วัน" },
    { area: "ภาคตะวันออกเฉียงเหนือ", standard: "3-4 วัน", express: "2 วัน" },
    { area: "ภาคใต้", standard: "4-5 วัน", express: "2-3 วัน" }
  ];

  const faqs = [
    {
      question: "สั่งซื้อแล้วจะได้รับสินค้าเมื่อไหร่?",
      answer: "หลังจากชำระเงินเรียบร้อย ทางร้านจะจัดส่งสินค้าภายใน 1-2 วันทำการ และใช้เวลาจัดส่งตามประเภทที่เลือก"
    },
    {
      question: "สามารถติดตามพัสดุได้อย่างไร?",
      answer: "หลังจัดส่ง ทางร้านจะส่งเลข Tracking ให้ทางอีเมลและ LINE เพื่อติดตามสถานะพัสดุได้ตลอด 24 ชม."
    },
    {
      question: "หากสินค้าเสียหายระหว่างจัดส่งต้องทำอย่างไร?",
      answer: "กรุณาถ่ายรูปสินค้าและบรรจุภัณฑ์ แล้วติดต่อทางร้านภายใน 24 ชม. หลังรับพัสดุ เราจะดำเนินการเปลี่ยนสินค้าใหม่ให้ฟรี"
    },
    {
      question: "รับสินค้าไม่ได้ตามนัดหมายต้องทำอย่างไร?",
      answer: "ขนส่งจะนำส่งซ้ำอีก 1-2 ครั้ง หากยังไม่สามารถรับได้ สินค้าจะถูกส่งกลับมาที่ร้าน และลูกค้าต้องชำระค่าจัดส่งใหม่"
    }
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500 rounded-full opacity-10 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500 rounded-full opacity-10 blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link href="/" className="inline-flex items-center text-sm text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-2" /> กลับหน้าหลัก
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-pink-500/20 p-3 rounded-xl">
              <Truck className="w-8 h-8 text-pink-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">การจัดส่งสินค้า</h1>
          </div>
          <p className="text-gray-400 max-w-2xl">
            Bamblue Store ใส่ใจทุกขั้นตอนการจัดส่ง เพื่อให้คุณได้รับสินค้าอย่างปลอดภัยและรวดเร็วที่สุด 💖
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Shipping Methods */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Package className="text-pink-500" />
            รูปแบบการจัดส่ง
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {shippingMethods.map((method, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-pink-200 transition-all group"
              >
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 text-pink-500 p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  {method.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{method.title}</h3>
                <p className="text-pink-500 font-semibold text-sm mb-2">{method.duration}</p>
                <p className="text-gray-500 text-sm mb-4">{method.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-2xl font-bold text-gray-900">{method.price}</span>
                  {method.freeAbove && (
                    <span className="bg-green-100 text-green-600 text-xs font-semibold px-3 py-1 rounded-full">
                      {method.freeAbove}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Free Shipping Banner */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-full">
                  <Truck className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">ส่งฟรีทั่วประเทศ!</h3>
                  <p className="text-pink-100">เมื่อสั่งซื้อสินค้าครบ ฿2,000 ขึ้นไป</p>
                </div>
              </div>
              <Link 
                href="/products" 
                className="bg-white text-pink-500 px-8 py-3 rounded-full font-bold hover:bg-pink-50 transition-colors shadow-lg"
              >
                ช้อปเลย
              </Link>
            </div>
          </div>
        </section>

        {/* Delivery Time by Area */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <MapPin className="text-pink-500" />
            ระยะเวลาจัดส่งตามพื้นที่
          </h2>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">พื้นที่</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">จัดส่งมาตรฐาน</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-700">จัดส่งด่วน</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deliveryAreas.map((item, index) => (
                    <tr key={index} className="hover:bg-pink-50/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-gray-900">{item.area}</td>
                      <td className="py-4 px-6 text-center text-gray-600">{item.standard}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-medium">
                          {item.express}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Packaging & Care */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Shield className="text-pink-500" />
            การบรรจุภัณฑ์และดูแลสินค้า
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">บรรจุภัณฑ์คุณภาพ</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    สินค้าทุกชิ้นจะถูกห่อด้วยกระดาษทิชชู่นุ่ม ใส่ถุงซิปล็อคกันน้ำ 
                    และบรรจุในกล่องพัสดุแข็งแรง พร้อมกระดาษกันกระแทก
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">ตรวจสอบก่อนจัดส่ง</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    ทีมงานจะตรวจสอบสินค้าทุกชิ้นก่อนจัดส่ง ทั้งขนาด สี และคุณภาพ 
                    เพื่อให้มั่นใจว่าคุณจะได้รับสินค้าที่สมบูรณ์แบบ
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">ประกันการจัดส่ง</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    หากสินค้าเสียหายหรือสูญหายระหว่างจัดส่ง ทางร้านรับผิดชอบ 100% 
                    พร้อมจัดส่งสินค้าใหม่ให้ฟรีทันที
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 text-green-600 p-3 rounded-xl">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">แจ้งเตือนทุกขั้นตอน</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    รับการแจ้งเตือนผ่านอีเมลและ LINE ตั้งแต่ยืนยันออเดอร์ 
                    จัดส่งสินค้า จนถึงสินค้าถึงมือคุณ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <CreditCard className="text-pink-500" />
            ช่องทางการชำระเงิน
          </h2>
          
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 rounded-xl hover:bg-pink-50 transition-colors">
                <div className="bg-gray-100 w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-gray-600" />
                </div>
                <p className="font-medium text-gray-900 text-sm">บัตรเครดิต/เดบิต</p>
              </div>
              <div className="text-center p-4 rounded-xl hover:bg-pink-50 transition-colors">
                <div className="bg-blue-100 w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">PP</span>
                </div>
                <p className="font-medium text-gray-900 text-sm">PromptPay</p>
              </div>
              <div className="text-center p-4 rounded-xl hover:bg-pink-50 transition-colors">
                <div className="bg-green-100 w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">โอน</span>
                </div>
                <p className="font-medium text-gray-900 text-sm">โอนผ่านธนาคาร</p>
              </div>
              <div className="text-center p-4 rounded-xl hover:bg-pink-50 transition-colors">
                <div className="bg-orange-100 w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Truck className="w-8 h-8 text-orange-600" />
                </div>
                <p className="font-medium text-gray-900 text-sm">เก็บเงินปลายทาง</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <AlertCircle className="text-pink-500" />
            คำถามที่พบบ่อย
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-2 flex items-start gap-3">
                  <span className="bg-pink-100 text-pink-500 w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  {faq.question}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed pl-9">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section>
          <div className="bg-zinc-900 rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-pink-500 rounded-full opacity-10 blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-pink-500 rounded-full opacity-10 blur-3xl translate-y-1/2 translate-x-1/2"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-3">มีคำถามเพิ่มเติม?</h3>
              <p className="text-gray-400 mb-6">ทีมงาน Bamblue Store พร้อมให้บริการคุณทุกวัน 09:00 - 22:00 น.</p>
              <Link 
                href="/contact" 
                className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-bold transition-colors"
              >
                ติดต่อเรา
              </Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
