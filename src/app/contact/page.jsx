"use client";
import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, FileText, Home, Info, MessageSquareText, RotateCcw, Send, ShieldCheck } from 'lucide-react';

const DEFAULT_FORM = {
  name: '',
  phone: '',
  email: '',
  subject: 'สอบถามข้อมูลสินค้า',
  message: ''
};

const SUBJECT_OPTIONS = [
  'สอบถามข้อมูลสินค้า',
  'แจ้งปัญหาการสั่งซื้อ / การชำระเงิน',
  'ติดตามสถานะการจัดส่ง',
  'ข้อเสนอแนะเกี่ยวกับเว็บไซต์',
  'อื่นๆ'
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');

  const generateTicketNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `DEMO-${year}${month}${day}-${random}`;
  };

  const validateForm = (values) => {
    const nextErrors = {};

    if (values.name.trim().length < 2) {
      nextErrors.name = 'กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร';
    }

    if (!emailPattern.test(values.email.trim())) {
      nextErrors.email = 'กรุณากรอกอีเมลให้ถูกต้อง';
    }

    if (values.phone && values.phone.length !== 10) {
      nextErrors.phone = 'เบอร์โทรควรมี 10 หลัก';
    }

    if (values.message.trim().length < 10) {
      nextErrors.message = 'กรุณาใส่รายละเอียดอย่างน้อย 10 ตัวอักษร';
    }

    return nextErrors;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === 'name') {
      nextValue = value.replace(/[0-9]/g, '');
    }

    if (name === 'phone') {
      nextValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    setTicketNumber(generateTicketNumber());
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const handleNewTicket = () => {
    setFormData(DEFAULT_FORM);
    setErrors({});
    setTicketNumber('');
    setIsSubmitted(false);
  };

  return (
    <main className="min-h-screen bg-white px-4 py-10 md:px-8 md:py-12">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-sm font-bold text-[#dc6fd6]">Demo contact</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 md:text-5xl">
            ติดต่อเรา
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 md:text-base">
            หน้านี้เป็นแบบฟอร์มทดลองสำหรับโปรเจกต์ฝึกเขียนเว็บ Bamblue store ข้อความจะไม่ถูกส่งไปยังช่องทางจริง แต่จะแสดงผลลัพธ์จำลองให้ทดสอบ flow การกรอกฟอร์มและ validation ได้ครบ
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
          <aside className="rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 via-white to-purple-50 p-6 md:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dc6fd6] text-white shadow-lg shadow-pink-200">
              <MessageSquareText size={24} />
            </div>

            <h2 className="mt-6 text-2xl font-black text-gray-950">แบบฟอร์มทดลอง</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              ใช้หน้านี้เพื่อโชว์ประสบการณ์การติดต่อร้านโดยไม่ต้องสร้าง LINE, Instagram หรืออีเมลจริงก่อน เหมาะกับเว็บฝึกเขียนที่ต้องการแสดง UX ให้ครบ
            </p>

            <div className="mt-7 space-y-3">
              <div className="flex gap-3 rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                <ShieldCheck className="mt-0.5 shrink-0 text-[#dc6fd6]" size={20} />
                <div>
                  <p className="text-sm font-bold text-gray-900">ไม่ส่งข้อมูลออกจริง</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">ข้อมูลที่กรอกใช้สำหรับทดสอบหน้าฟอร์มเท่านั้น</p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                <FileText className="mt-0.5 shrink-0 text-[#dc6fd6]" size={20} />
                <div>
                  <p className="text-sm font-bold text-gray-900">มีเลขอ้างอิงจำลอง</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">หลังส่งฟอร์ม ระบบจะสร้าง ticket demo ให้ดูเหมือน flow จริง</p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-white bg-white/80 p-4 shadow-sm">
                <Info className="mt-0.5 shrink-0 text-[#dc6fd6]" size={20} />
                <div>
                  <p className="text-sm font-bold text-gray-900">ทดสอบ validation ได้</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">ลองเว้นช่องสำคัญหรือกรอกอีเมลผิดเพื่อดู error state</p>
                </div>
              </div>
            </div>
          </aside>

          <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm md:p-8">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-950">ฝากข้อความถึงเรา</h2>
                <p className="mt-2 text-sm text-gray-500">กรอกข้อมูลเพื่อทดลองส่งคำร้องในระบบ</p>
              </div>
              <span className="w-fit rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-[#dc6fd6]">
                Demo only
              </span>
            </div>

            {isSubmitted ? (
              <div className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-10 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-500 shadow-sm">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="mt-5 text-2xl font-black text-gray-950">รับข้อความตัวอย่างแล้ว</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-gray-600">
                  นี่เป็นผลลัพธ์จำลองสำหรับทดสอบหน้า Contact ข้อความไม่ได้ถูกส่งไปยังแอดมินหรือบริการภายนอก
                </p>

                <div className="mt-6 w-full max-w-sm rounded-2xl border border-emerald-100 bg-white p-4">
                  <p className="text-xs font-semibold text-gray-500">เลขอ้างอิงจำลอง</p>
                  <p className="mt-1 text-xl font-black tracking-wider text-emerald-600">{ticketNumber}</p>
                </div>

                <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
                  <button
                    onClick={handleNewTicket}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <RotateCcw size={17} />
                    ส่งใหม่
                  </button>
                  <Link
                    href="/"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-800"
                  >
                    <Home size={17} />
                    หน้าหลัก
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FieldErrorWrapper error={errors.name}>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-bold text-gray-700">ชื่อ-นามสกุล *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`h-12 w-full rounded-xl border px-4 text-sm outline-none transition-colors focus:border-[#dc6fd6] ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
                      placeholder="เช่น แพรวา"
                    />
                  </FieldErrorWrapper>

                  <FieldErrorWrapper error={errors.phone}>
                    <label htmlFor="phone" className="mb-1.5 block text-sm font-bold text-gray-700">เบอร์โทรศัพท์ (ถ้ามี)</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      inputMode="numeric"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={10}
                      className={`h-12 w-full rounded-xl border px-4 text-sm outline-none transition-colors focus:border-[#dc6fd6] ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
                      placeholder="0812345678"
                    />
                  </FieldErrorWrapper>
                </div>

                <FieldErrorWrapper error={errors.email}>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-bold text-gray-700">อีเมลติดต่อกลับ *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`h-12 w-full rounded-xl border px-4 text-sm outline-none transition-colors focus:border-[#dc6fd6] ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
                    placeholder="your@email.com"
                  />
                </FieldErrorWrapper>

                <div>
                  <label htmlFor="subject" className="mb-1.5 block text-sm font-bold text-gray-700">หัวข้อที่ต้องการติดต่อ</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="h-12 w-full cursor-pointer rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition-colors focus:border-[#dc6fd6]"
                  >
                    {SUBJECT_OPTIONS.map((subject) => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <FieldErrorWrapper error={errors.message}>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-bold text-gray-700">รายละเอียด *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:border-[#dc6fd6] ${errors.message ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
                    placeholder="พิมพ์ข้อความสำหรับทดสอบฟอร์มที่นี่..."
                  />
                </FieldErrorWrapper>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#dc6fd6] text-sm font-black tracking-wide text-white shadow-lg shadow-pink-200 transition-colors hover:bg-[#c95fc8] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      กำลังจำลองการส่ง...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      ส่งข้อความทดลอง
                    </>
                  )}
                </button>
              </form>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

function FieldErrorWrapper({ children, error }) {
  return (
    <div>
      {children}
      {error && <p className="mt-1.5 text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}
