"use client";
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
            <FileText size={24} className="text-[#dc6fd6]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">เงื่อนไขการให้บริการ</h1>
            <p className="text-sm text-gray-500 mt-1">Terms of Service</p>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-8 pb-6 border-b border-gray-200">
          <p>อัปเดตล่าสุด: มีนาคม 2026</p>
          <p className="mt-1">บริษัท Bamblue Store จำกัด</p>
        </div>

        {/* Content */}
        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. การยอมรับเงื่อนไข</h2>
            <p>
              เมื่อคุณเข้าใช้งานเว็บไซต์ Bamblue Store หรือทำการสั่งซื้อสินค้าผ่านเว็บไซต์ของเรา 
              ถือว่าคุณได้ยอมรับและตกลงปฏิบัติตามเงื่อนไขการให้บริการนี้ทั้งหมด 
              หากคุณไม่ยอมรับเงื่อนไขใดๆ กรุณาอย่าใช้งานเว็บไซต์หรือบริการของเรา
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. การสมัครสมาชิก</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>คุณต้องมีอายุอย่างน้อย 18 ปี หรือมีความสามารถในการทำนิติกรรม</li>
              <li>ข้อมูลที่ให้แก่เราต้องถูกต้อง ครบถ้วน และเป็นปัจจุบัน</li>
              <li>คุณมีหน้าที่รักษาความปลอดภัยของบัญชีและรหัสผ่านของคุณ</li>
              <li>ห้ามใช้บัญชีของผู้อื่นโดยไม่ได้รับอนุญาต</li>
              <li>เราขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีที่ละเมิดเงื่อนไขการใช้งาน</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. การสั่งซื้อและการชำระเงิน</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>ราคาสินค้าที่แสดงบนเว็บไซต์เป็นราคาเป็นเงินบาทไทย (THB) รวมภาษีมูลค่าเพิ่ม (VAT)</li>
              <li>การสั่งซื้อจะสมบูรณ์เมื่อได้รับการยืนยันการชำระเงินจากระบบแล้วเท่านั้น</li>
              <li>เราขอสงวนสิทธิ์ในการปฏิเสธหรือยกเลิกคำสั่งซื้อใดๆ โดยไม่ต้องแจ้งเหตุผล</li>
              <li>สินค้าที่จำหน่ายอาจมีจำนวนจำกัด และจะจัดส่งตามลำดับการสั่งซื้อ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. การจัดส่งสินค้า</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>ระยะเวลาการจัดส่งโดยประมาณคือ 3-7 วันทำการ (ขึ้นอยู่กับพื้นที่จัดส่ง)</li>
              <li>ค่าจัดส่งฟรีสำหรับคำสั่งซื้อที่มีมูลค่า 2,000 บาทขึ้นไป</li>
              <li>กรุณาตรวจสอบสินค้าทันทีที่ได้รับ หากพบความเสียหายกรุณาแจ้งภายใน 48 ชั่วโมง</li>
              <li>เราไม่รับผิดชอบต่อความล่าช้าที่เกิดจากบริษัทขนส่ง หรือเหตุสุดวิสัย</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. นโยบายการคืนสินค้าและเงิน</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>สามารถขอคืนสินค้าได้ภายใน 14 วันนับจากวันที่ได้รับสินค้า</li>
              <li>สินค้าต้องอยู่ในสภาพเดิม ไม่ผ่านการใช้งาน และมีป้ายราคาครบถ้วน</li>
              <li>สินค้าลดราคา สินค้าโปรโมชั่น หรือสินค้าตัดเย็บ ไม่สามารถคืนได้</li>
              <li>ค่าจัดส่งในการคืนสินค้าเป็นภาระของผู้ซื้อ</li>
              <li>เงินจะถูกโอนคืนภายใน 7-14 วันทำการหลังจากได้รับสินค้าคืน</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. ทรัพย์สินทางปัญญา</h2>
            <p>
              เนื้อหา รูปภาพ โลโก้ ชื่อทางการค้า และทรัพย์สินทางปัญญาอื่นๆ ที่แสดงบนเว็บไซต์นี้
              เป็นลิขสิทธิ์ของ Bamblue Store ห้ามนำไปใช้โดยไม่ได้รับอนุญาตเป็นลายลักษณ์อักษร
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. ข้อจำกัดความรับผิด</h2>
            <p>
              Bamblue Store จะไม่รับผิดชอบต่อความเสียหายใดๆ ที่เกิดจากการใช้งานเว็บไซต์ 
              การไม่สามารถใช้งานเว็บไซต์ การสูญหายของข้อมูล หรือกำไรที่สูญเสียไป 
              แม้ว่าเราจะได้รับการแจ้งเตือนถึงความเป็นไปได้ของความเสียหายดังกล่าว
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. การแก้ไขเงื่อนไข</h2>
            <p>
              เราขอสงวนสิทธิ์ในการแก้ไขเงื่อนไขการให้บริการนี้ได้ตลอดเวลา 
              การเปลี่ยนแปลงจะมีผลทันทีที่ได้รับการเผยแพร่บนเว็บไซต์ 
              การใช้งานเว็บไซต์ต่อไปถือว่าคุณยอมรับเงื่อนไขที่แก้ไขแล้ว
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. กฎหมายที่ใช้บังคับ</h2>
            <p>
              เงื่อนไขการให้บริการนี้อยู่ภายใต้กฎหมายไทย 
              และข้อพิพาทใดๆ จะอยู่ในเขตอำนาจศาลไทยเท่านั้น
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. ติดต่อเรา</h2>
            <p>หากคุณมีคำถามเกี่ยวกับเงื่อนไขการให้บริการนี้ กรุณาติดต่อเราที่:</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p><strong>บริษัท Bamblue Store จำกัด</strong></p>
              <p className="mt-2">อีเมล: support@bambluestore.com</p>
              <p>โทรศัพท์: 02-XXX-XXXX</p>
              <p>เวลาทำการ: จันทร์-ศุกร์ 9:00-18:00 น.</p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            การใช้งานเว็บไซต์นี้ แสดงว่าคุณได้อ่านและยอมรับเงื่อนไขการให้บริการและ{' '}
            <Link href="/privacy" className="text-[#dc6fd6] hover:underline">
              นโยบายความเป็นส่วนตัว
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
