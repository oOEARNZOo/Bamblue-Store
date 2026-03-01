import "./globals.css";
import Navbar from './components/Navbar'; 
import Footer from './components/Footer';
import { CartProvider } from './context/CartContext'; 
// 🌟 1. นำเข้า Toaster จาก react-hot-toast
import { Toaster } from 'react-hot-toast'; 
import { Prompt } from 'next/font/google';
import './globals.css';

// 🌟 ตั้งค่าฟอนต์ Prompt (รองรับทั้งภาษาไทยและอังกฤษ)
const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700'], // ดึงน้ำหนักตัวบางไปจนถึงตัวหนามาใช้
  display: 'swap',
});

export const metadata = {
  title: 'Bamblue Store | K-Fashion',
  description: 'YOUTH ELEVATED. SIMPLY STYLISH.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={prompt.className}>
        <CartProvider>
          <Navbar />
          {children}
          <Footer />
          
          {/* 🌟 2. เพิ่ม Toaster ไว้ล่างสุด และตั้งค่าสีให้เข้ากับธีมเว็บเรา */}
          <Toaster 
            position="bottom-right" /* ให้เด้งขึ้นมาจากมุมขวาล่าง */
            toastOptions={{
              duration: 3000, /* โชว์ 3 วินาทีแล้วหายไปเอง */
              style: {
                background: '#ffffff',
                color: '#27272a', /* สีตัวอักษรเทาเข้ม */
                border: '1px solid #f472b6', /* ขอบสีชมพู Bamblue */
                padding: '16px',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              },
              success: {
                iconTheme: {
                  primary: '#f472b6', /* ไอคอนติ๊กถูกสีชมพู */
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </CartProvider>
      </body>
    </html>
  )
}