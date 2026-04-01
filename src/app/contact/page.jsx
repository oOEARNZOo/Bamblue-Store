"use client"; // ต้องมีเพราะเราใช้ useState สำหรับฟอร์มครับ
import React, { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'สอบถามข้อมูลสินค้า',
    message: ''
  });

  // ฟังก์ชันจัดการ input พร้อมจำกัดประเภทข้อมูล
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'name') {
      // ชื่อ: ตัวอักษรเท่านั้น (ไทย/อังกฤษ/เว้นวรรค)
      const textValue = value.replace(/[0-9]/g, '');
      setFormData(prev => ({ ...prev, [name]: textValue }));
      return;
    }
    
    if (name === 'phone') {
      // เบอร์โทร: ตัวเลขเท่านั้น, สูงสุด 10 หลัก
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชันสร้างเลขคำร้อง (Ticket Number)
  const generateTicketNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `TK-${year}${month}${day}-${random}`;
  };

  // ฟังก์ชันจำลองตอนกดส่งข้อความ
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // จำลองการส่งข้อมูล (ใช้เวลา 1.5 วินาที)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newTicket = generateTicketNumber();
    setTicketNumber(newTicket);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  // ฟังก์ชันส่งคำร้องใหม่
  const handleNewTicket = () => {
    setIsSubmitted(false);
    setTicketNumber('');
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-24">
      {/* 🎯 Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">ติดต่อเรา</h1>
        <p className="text-gray-500">
          Bamblue store เป็นร้านค้าออนไลน์ 100% 💖<br/>
          หากมีข้อสงสัยเกี่ยวกับสินค้า ไซส์ หรือการจัดส่ง สามารถทักแชทหรือฝากข้อความไว้ได้เลย แอดมินยินดีให้บริการค่ะ
        </p>
      </div>

      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        
        {/* 📱 ฝั่งซ้าย: ข้อมูลการติดต่อออนไลน์ */}
        <div className="md:w-5/12 bg-zinc-900 text-white p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
          {/* ลายกราฟิกตกแต่งพื้นหลัง */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-pink-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-pink-500 rounded-full opacity-20 blur-3xl"></div>

          <h2 className="text-2xl font-bold mb-6 relative z-10">ช่องทางการติดต่อ</h2>
          
          <div className="space-y-6 relative z-10">
            {/* Line OA */}
            <div className="flex items-center gap-4 hover:text-pink-400 transition-colors cursor-pointer">
              <div className="bg-white/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">LINE Official</p>
                <p className="font-semibold text-lg">@bambluestore</p>
              </div>
            </div>

            {/* Instagram */}
            <div className="flex items-center gap-4 hover:text-pink-400 transition-colors cursor-pointer">
              <div className="bg-white/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm0 15a5.25 5.25 0 100-10.5 5.25 5.25 0 000 10.5zm3-10.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Instagram</p>
                <p className="font-semibold text-lg">bamblue.store</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 hover:text-pink-400 transition-colors cursor-pointer">
              <div className="bg-white/10 p-3 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-semibold text-lg">hello@bambluestore.com</p>
              </div>
            </div>
          </div>

          <div className="mt-12 relative z-10 border-t border-white/20 pt-6">
            <p className="text-sm text-gray-300">เวลาทำการแอดมิน: ทุกวัน 09:00 - 22:00 น.</p>
          </div>
        </div>

        {/* 📝 ฝั่งขวา: แบบฟอร์มส่งข้อความ */}
        <div className="md:w-7/12 p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">ฝากข้อความถึงเรา</h2>
          
          {isSubmitted ? (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 text-green-700 p-8 rounded-xl flex flex-col items-center justify-center text-center min-h-[380px]">
              <div className="bg-green-100 p-4 rounded-full mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-xl mb-2">ส่งข้อความสำเร็จ!</h3>
              <p className="text-sm mb-4">แอดมินได้รับข้อความของคุณแล้ว จะรีบติดต่อกลับโดยเร็วที่สุดค่ะ 💖</p>
              
              {/* เลขคำร้อง (Ticket Number) */}
              <div className="bg-white border border-green-200 rounded-lg px-6 py-4 mb-6 w-full max-w-xs">
                <p className="text-xs text-gray-500 mb-1">เลขคำร้องของคุณ</p>
                <p className="text-lg font-bold text-green-600 tracking-wider">{ticketNumber}</p>
                <p className="text-xs text-gray-400 mt-1">กรุณาเก็บเลขนี้ไว้อ้างอิง</p>
              </div>

              {/* ปุ่มกลับหน้าหลัก / ส่งคำร้องใหม่ */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <Link 
                  href="/" 
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors text-center"
                >
                  กลับหน้าหลัก
                </Link>
                <button 
                  onClick={handleNewTicket}
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg font-semibold text-sm transition-colors cursor-pointer"
                >
                  ส่งคำร้องใหม่
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ชื่อ */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล *</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required 
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-sm" 
                    placeholder="เช่น แพรวา" 
                  />
                </div>
                {/* เบอร์โทรศัพท์ (เป็นออปชั่นเผื่อโทรกลับ) */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">เบอร์โทรศัพท์ (ถ้ามี)</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone"
                    inputMode="numeric"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={10}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-sm" 
                    placeholder="0812345678" 
                  />
                </div>
              </div>

              {/* อีเมล */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">อีเมลติดต่อกลับ *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-sm" 
                  placeholder="your@email.com" 
                />
              </div>

              {/* หัวข้อ */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">หัวข้อที่ต้องการติดต่อ</label>
                <select 
                  id="subject" 
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-sm bg-white"
                >
                  <option value="สอบถามข้อมูลสินค้า">สอบถามข้อมูลสินค้า</option>
                  <option value="แจ้งปัญหาการสั่งซื้อ / การชำระเงิน">แจ้งปัญหาการสั่งซื้อ / การชำระเงิน</option>
                  <option value="ติดตามสถานะการจัดส่ง">ติดตามสถานะการจัดส่ง</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>

              {/* ข้อความ */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด *</label>
                <textarea 
                  id="message" 
                  name="message"
                  rows="4" 
                  value={formData.message}
                  onChange={handleChange}
                  required 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-sm resize-none" 
                  placeholder="พิมพ์ข้อความของคุณที่นี่..."
                ></textarea>
              </div>

              {/* ปุ่มส่ง */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold tracking-wider transition-colors shadow-md shadow-pink-500/30 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    กำลังส่ง...
                  </>
                ) : (
                  'ส่งข้อความ'
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </main>
  );
}