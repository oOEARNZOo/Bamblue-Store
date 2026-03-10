import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          
          {/* คอลัมน์ 1: โลโก้และข้อมูลแบรนด์ */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Bamblue <span className="text-[#dc6fd6]">store</span>
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              แต่งเติมความมั่นใจในทุกวันของคุณด้วยเสื้อผ้าสไตล์มินิมอล ที่ออกแบบมาเพื่อตอบโจทย์ทุกไลฟ์สไตล์
            </p>
          </div>

          {/* คอลัมน์ 2: หมวดหมู่ SHOP (ตามรูปเป๊ะๆ) */}
          <div>
            <h3 className="text-white font-bold tracking-wider mb-6">SHOP</h3>
            <ul className="space-y-4">
              {/* ลิงก์ไปหน้าสินค้าทั้งหมด */}
              <li>
                <Link href="/products" className="text-gray-400 hover:text-[#dc6fd6] transition-colors text-sm inline-block">
                  ทั้งหมด (All)
                </Link>
              </li>
              {/* ลิงก์ไปหน้าหมวดหมู่เสื้อ (คุณสามารถสร้างหน้า /products/shirts รับพารามิเตอร์ทีหลังได้) */}
              <li>
                <Link href="/products?category=shirts" className="text-gray-400 hover:text-[#dc6fd6] transition-colors text-sm inline-block">
                  เสื้อ (Shirts)
                </Link>
              </li>
              <li>
                <Link href="/products?category=dresses" className="text-gray-400 hover:text-[#dc6fd6] transition-colors text-sm inline-block">
                  BOTTOMS เดรส (Dresses)
                </Link>
              </li>
              <li>
                <Link href="/products?category=sets" className="text-gray-400 hover:text-[#dc6fd6] transition-colors text-sm inline-block">
                  ชุดเซ็ต (Sets)
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="text-gray-400 hover:text-[#dc6fd6] transition-colors text-sm inline-block">
                  โปรโมชั่น (Promotions)
                </Link>
              </li>
            </ul>
          </div>

          {/* คอลัมน์ 3: เมนูอื่นๆ (อิงจาก Navbar) */}
          <div>
            <h3 className="text-white font-bold tracking-wider mb-6">MENU</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-gray-400 hover:text-[#dc6fd6] transition-colors text-sm inline-block">
                  หน้าหลัก
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="text-gray-400 hover:text-[#dc6fd6] transition-colors text-sm inline-block">
                  รีวิวจากลูกค้า
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="text-gray-400 hover:text-[#dc6fd6] transition-colors text-sm inline-block">
                  ข่าวสารโปรโมชั่น
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-[#dc6fd6] transition-colors text-sm inline-block">
                  ติดต่อเรา
                </Link>
              </li>
            </ul>
          </div>

          {/* คอลัมน์ 4: ข้อมูลการติดต่อเพิ่มเติม */}
          <div>
            <h3 className="text-white font-bold tracking-wider mb-6">CUSTOMER CARE</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-[#dc6fd6] transition-colors text-sm inline-block">
                  เงื่อนไขการให้บริการ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-[#dc6fd6] transition-colors text-sm inline-block">
                  นโยบายความเป็นส่วนตัว
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-400 hover:text-[#dc6fd6] transition-colors text-sm inline-block">
                  การจัดส่งสินค้า
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* เส้นแบ่งด้านล่าง & Copyright */}
        <div className="pt-8 border-t border-gray-800 text-center flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Bamblue store. All rights reserved.
          </p>
          <div className="flex space-x-4">
            {/* คุณสามารถใส่ไอคอน Social Media ตรงนี้ได้ */}
            <span className="text-gray-500 hover:text-white cursor-pointer text-sm transition-colors">Instagram</span>
            <span className="text-gray-500 hover:text-white cursor-pointer text-sm transition-colors">Facebook</span>
            <span className="text-gray-500 hover:text-white cursor-pointer text-sm transition-colors">Line</span>
          </div>
        </div>
      </div>
    </footer>
  );
}