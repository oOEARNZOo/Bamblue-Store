"use client";
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
        
        {/* Header */}
        <Link 
          href="/register" 
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#dc6fd6] transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft size={16} />
          กลับไปหน้าสมัครสมาชิก
        </Link>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center">
            <Shield size={24} className="text-[#dc6fd6]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">นโยบายความเป็นส่วนตัว</h1>
            <p className="text-sm text-gray-500 mt-1">Privacy Policy</p>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
          <p>อัปเดตล่าสุด: มีนาคม 2026</p>
          <p className="mt-1">บริษัท Bamblue Store จำกัด</p>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">บทนำ</h2>
            <p>
              Bamblue Store (&ldquo;เรา&rdquo;, &ldquo;พวกเรา&rdquo;, &ldquo;ของเรา&rdquo;) ให้ความสำคัญกับความเป็นส่วนตัวของคุณ
              นโยบายความเป็นส่วนตัวนี้อธิบายว่าเราเก็บรวบรวม ใช้งาน เปิดเผย และปกป้องข้อมูลส่วนบุคคลของคุณอย่างไร 
              เมื่อคุณใช้งานเว็บไซต์ bambluestore.com และบริการต่างๆ ของเรา
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. ข้อมูลที่เราเก็บรวบรวม</h2>
            
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">1.1 ข้อมูลที่คุณให้เรา</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>ข้อมูลการสมัครสมาชิก:</strong> ชื่อ, นามสกุล, อีเมล, รหัสผ่าน</li>
              <li><strong>ข้อมูลการสั่งซื้อ:</strong> ชื่อ-ที่อยู่ผู้รับ, หมายเลขโทรศัพท์, ข้อมูลการชำระเงิน</li>
              <li><strong>ข้อมูลการติดต่อ:</strong> ข้อความที่คุณส่งผ่านฟอร์มติดต่อหรืออีเมล</li>
              <li><strong>รีวิวและความคิดเห็น:</strong> รีวิวสินค้า, คะแนน, ความคิดเห็น</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">1.2 ข้อมูลที่เก็บโดยอัตโนมัติ</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>ข้อมูลอุปกรณ์:</strong> IP address, ประเภทเบราว์เซอร์, ระบบปฏิบัติการ</li>
              <li><strong>ข้อมูลการใช้งาน:</strong> หน้าที่เข้าชม, เวลาที่ใช้, คลิกและการนำทาง</li>
              <li><strong>คุกกี้:</strong> เราใช้คุกกี้เพื่อปรับปรุงประสบการณ์การใช้งาน</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. วัตถุประสงค์การใช้ข้อมูล</h2>
            <p>เราใช้ข้อมูลของคุณเพื่อ:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>ดำเนินการตามคำสั่งซื้อและจัดส่งสินค้าให้คุณ</li>
              <li>สร้างและจัดการบัญชีของคุณ</li>
              <li>ติดต่อสื่อสารเกี่ยวกับคำสั่งซื้อ โปรโมชั่น และข่าวสาร</li>
              <li>ปรับปรุงและพัฒนาเว็บไซต์และบริการของเรา</li>
              <li>วิเคราะห์พฤติกรรมการใช้งานเพื่อปรับปรุงประสบการณ์</li>
              <li>ป้องกันการฉ้อโกง และรักษาความปลอดภัย</li>
              <li>ปฏิบัติตามกฎหมายและข้อบังคับที่เกี่ยวข้อง</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. การเปิดเผยข้อมูล</h2>
            <p>เราอาจเปิดเผยข้อมูลของคุณให้กับ:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>ผู้ให้บริการ:</strong> บริษัทขนส่ง, ผู้ให้บริการชำระเงิน, บริการโฮสติ้ง</li>
              <li><strong>หน่วยงานราชการ:</strong> เมื่อกฎหมายกำหนดหรือมีคำสั่งศาล</li>
              <li><strong>คู่ค้าทางธุรกิจ:</strong> สำหรับโปรโมชั่นหรือกิจกรรมทางการตลาดร่วมกัน (เมื่อได้รับความยินยอม)</li>
            </ul>
            <p className="mt-3 font-semibold">
              เราจะไม่ขาย เช่า หรือแบ่งปันข้อมูลส่วนบุคคลของคุณให้กับบุคคลที่สามเพื่อการตลาดโดยไม่ได้รับความยินยอมจากคุณ
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. การเก็บรักษาข้อมูล</h2>
            <p>
              เราจะเก็บรักษาข้อมูลส่วนบุคคลของคุณไว้เท่าที่จำเป็นเพื่อบรรลุวัตถุประสงค์ที่ระบุไว้ในนโยบายนี้ 
              หรือตามที่กฎหมายกำหนด ข้อมูลการสั่งซื้อจะเก็บไว้อย่างน้อย 7 ปีตามกฎหมายภาษี
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. ความปลอดภัยของข้อมูล</h2>
            <p>เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลของคุณ รวมถึง:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li>การเข้ารหัสข้อมูล (SSL/TLS) สำหรับการส่งข้อมูล</li>
              <li>การจำกัดการเข้าถึงข้อมูลเฉพาะพนักงานที่จำเป็น</li>
              <li>การอัปเดตระบบความปลอดภัยอย่างสมำ่เสมอ</li>
              <li>การสำรองข้อมูลเป็นประจำ</li>
            </ul>
            <p className="mt-3 text-sm">
              <em>หมายเหตุ: แม้เราจะใช้มาตรการรักษาความปลอดภัยที่เหมาะสม แต่ไม่มีระบบใดที่ปลอดภัย 100%</em>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. สิทธิของคุณ</h2>
            <p>คุณมีสิทธิ์ดังต่อไปนี้:</p>
            <ul className="list-disc pl-6 space-y-2 mt-3">
              <li><strong>สิทธิในการเข้าถึง:</strong> ขอดูข้อมูลส่วนบุคคลที่เราเก็บไว้</li>
              <li><strong>สิทธิในการแก้ไข:</strong> แก้ไขข้อมูลที่ไม่ถูกต้องหรือไม่สมบูรณ์</li>
              <li><strong>สิทธิในการลบ:</strong> ขอลบข้อมูลของคุณ (ภายใต้เงื่อนไขบางประการ)</li>
              <li><strong>สิทธิในการคัดค้าน:</strong> คัดค้านการใช้ข้อมูลเพื่อการตลาด</li>
              <li><strong>สิทธิในการถอนความยินยอม:</strong> ถอนความยินยอมที่เคยให้ไว้ได้ตลอดเวลา</li>
              <li><strong>สิทธิในการพกพาข้อมูล:</strong> ขอรับข้อมูลในรูปแบบที่สามารถนำไปใช้ได้</li>
            </ul>
            <p className="mt-3">
              หากต้องการใช้สิทธิ์ใดๆ กรุณาติดต่อเราที่ privacy@bambluestore.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. คุกกี้ (Cookies)</h2>
            <p>
              เราใช้คุกกี้และเทคโนโลยีที่คล้ายกันเพื่อปรับปรุงประสบการณ์การใช้งาน วิเคราะห์การใช้งาน และแสดงโฆษณา 
              คุณสามารถปรับตั้งค่าเบราว์เซอร์ให้ปฏิเสธคุกกี้ได้ แต่อาจส่งผลต่อการใช้งานบางฟังก์ชัน
            </p>
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm"><strong>ประเภทคุกกี้ที่เราใช้:</strong></p>
              <ul className="list-disc pl-6 space-y-1 mt-2 text-sm">
                <li><strong>คุกกี้จำเป็น:</strong> สำหรับการทำงานพื้นฐานของเว็บไซต์</li>
                <li><strong>คุกกี้การวิเคราะห์:</strong> เพื่อเข้าใจพฤติกรรมการใช้งาน</li>
                <li><strong>คุกกี้การตลาด:</strong> เพื่อแสดงโฆษณาที่เกี่ยวข้อง</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. เด็กและผู้เยาว์</h2>
            <p>
              บริการของเราไม่ได้มุ่งเป้าไปที่เด็กอายุต่ำกว่า 18 ปี 
              เราจะไม่เก็บรวบรวมข้อมูลส่วนบุคคลจากเด็กโดยเจตนา 
              หากคุณเป็นผู้ปกครองและพบว่าบุตรหลานของคุณให้ข้อมูลแก่เรา กรุณาติดต่อเรา
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. การเปลี่ยนแปลงนโยบาย</h2>
            <p>
              เราอาจแก้ไขนโยบายความเป็นส่วนตัวนี้เป็นครั้งคราว 
              การเปลี่ยนแปลงจะมีผลทันทีที่เผยแพร่บนเว็บไซต์ 
              เราขอแนะนำให้คุณตรวจสอบนโยบายนี้เป็นระยะๆ
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. ติดต่อเรา</h2>
            <p>หากคุณมีคำถามหรือข้อกังวลเกี่ยวกับนโยบายความเป็นส่วนตัว กรุณาติดต่อเราที่:</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p><strong>เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)</strong></p>
              <p className="mt-2"><strong>บริษัท Bamblue Store จำกัด</strong></p>
              <p className="mt-2">อีเมล: privacy@bambluestore.com</p>
              <p>โทรศัพท์: 02-XXX-XXXX</p>
              <p>เวลาทำการ: จันทร์-ศุกร์ 9:00-18:00 น.</p>
            </div>
          </section>

          <section className="mt-8 p-6 bg-pink-50 border border-pink-200 rounded-lg">
            <h3 className="text-lg font-bold text-gray-900 mb-3">⚖️ ข้อมูลสำหรับผู้บริโภคในไทย</h3>
            <p className="text-sm">
              นโยบายนี้จัดทำขึ้นตาม <strong>พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)</strong> 
              คุณมีสิทธิ์ตามที่กฎหมายกำหนด และสามารถยื่นเรื่องร้องเรียนต่อคณะกรรมการคุ้มครองข้อมูลส่วนบุคคล 
              หากเห็นว่าเราละเมิดสิทธิของคุณ
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            การใช้งานเว็บไซต์นี้ แสดงว่าคุณได้อ่านและยอมรับ{' '}
            <Link href="/terms" className="text-[#dc6fd6] hover:underline">
              เงื่อนไขการให้บริการ
            </Link>
            {' '}และนโยบายความเป็นส่วนตัวนี้
          </p>
        </div>

      </div>
    </main>
  );
}
