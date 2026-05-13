import "./globals.css";
import SiteChrome from '@/frontend/components/SiteChrome';
import Providers from './providers';
// 🌟 1. นำเข้า Toaster จาก react-hot-toast
import { Toaster } from 'react-hot-toast'; 
import { Prompt } from 'next/font/google';

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

/*
// 🌟 ตั้งค่าฟอนต์ Prompt (รองรับทั้งภาษาไทยและอังกฤษ)
  weight: ['300', '400', '500', '600', '700'], // ดึงน้ำหนักตัวบางไปจนถึงตัวหนามาใช้

*/

export const metadata = {
  title: {
    default: 'Bamblue Store | K-Fashion Thailand',
    template: '%s | Bamblue Store',
  },
  description: 'YOUTH ELEVATED. SIMPLY STYLISH. ร้านเสื้อผ้าแฟชั่นเกาหลีสไตล์วัยรุ่น คุณภาพดี ราคาถูก จัดส่งฟรีทั่วไทย',
  keywords: ['เสื้อผ้าแฟชั่น', 'แฟชั่นเกาหลี', 'K-Fashion', 'เสื้อผ้าวัยรุ่น', 'Bamblue', 'ชุดเดรส', 'เสื้อครอป'],
  authors: [{ name: 'Bamblue Store' }],
  creator: 'Bamblue Store',
  publisher: 'Bamblue Store',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://bamblue.store'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Bamblue Store | K-Fashion Thailand',
    description: 'YOUTH ELEVATED. SIMPLY STYLISH. ร้านเสื้อผ้าแฟชั่นเกาหลีสไตล์วัยรุ่น',
    url: 'https://bamblue.store',
    siteName: 'Bamblue Store',
    locale: 'th_TH',
    type: 'website',
    images: [
      {
        url: '/Picture/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bamblue Store - K-Fashion Thailand',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bamblue Store | K-Fashion Thailand',
    description: 'YOUTH ELEVATED. SIMPLY STYLISH. ร้านเสื้อผ้าแฟชั่นเกาหลีสไตล์วัยรุ่น',
    images: ['/Picture/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={prompt.className}>
        <Providers>
          <SiteChrome>
            {children}
          </SiteChrome>
          
          {/* 🌟 2. เพิ่ม Toaster ไว้ล่างสุด และตั้งค่าสีให้เข้ากับธีมเว็บเรา */}
          <Toaster 
            position="top-center" /* แสดงกลางเว็บใต้ navbar */
            gutter={8}
            containerStyle={{
              top: 'clamp(76px, 9vw, 92px)',
              left: 16,
              right: 16,
            }}
            toastOptions={{
              duration: 3000, /* โชว์ 3 วินาทีแล้วหายไปเอง */
              style: {
                background: '#ffffff',
                color: '#27272a', /* สีตัวอักษรเทาเข้ม */
                border: '1px solid rgba(220, 111, 214, 0.32)', /* ขอบสีชมพู Bamblue */
                padding: '11px 16px', /* padding เล็กลง */
                fontSize: '13px', /* ฟอนต์เล็กลง */
                fontWeight: '600',
                lineHeight: '1.45',
                borderRadius: '16px', /* วงรี (pill shape) */
                boxShadow: '0 18px 45px -24px rgba(15, 23, 42, 0.45), 0 10px 22px -18px rgba(220, 111, 214, 0.45)',
                maxWidth: 'min(420px, calc(100vw - 32px))', /* จำกัดความกว้าง */
              },
              success: {
                iconTheme: {
                  primary: '#f472b6', /* ไอคอนติ๊กถูกสีชมพู */
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
