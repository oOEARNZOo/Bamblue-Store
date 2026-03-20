"use client";
import { useState, useEffect } from 'react';
import { QrCode, Copy, Check, X, CheckCircle } from 'lucide-react';

/**
 * 🏦 PromptPay QR Code Generator Component
 * - สร้าง QR Code สำหรับชำระเงินผ่าน PromptPay
 * - ไม่ต้องอัปโหลดสลิป (ง่ายต่อการใช้งาน)
 */

export default function PromptPayQR({ 
  phoneNumber = '0917484417',
  amount = 0,
  orderNumber = '',
  onClose,
  onSuccess
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // สร้าง QR Code ด้วย PromptPay QR API
  useEffect(() => {
    if (amount > 0) {
      const qrUrl = `https://promptpay.io/${phoneNumber}/${amount.toFixed(2)}.png`;
      setQrDataUrl(qrUrl);
    }
  }, [phoneNumber, amount]);

  // Copy เบอร์ PromptPay
  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ยืนยันการชำระเงิน
  const handleConfirmPayment = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      if (onSuccess) {
        await onSuccess();
      }
      setConfirmed(true);
    } catch (error) {
      console.error('Error confirming payment:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
      setIsProcessing(false);
    }
  };

  // แสดงหน้าสำเร็จ
  if (confirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">สั่งซื้อสำเร็จ!</h3>
          <p className="text-gray-500 mb-4">
            เลขที่ออเดอร์: <span className="font-semibold">{orderNumber}</span>
          </p>
          <p className="text-sm text-gray-400">
            ขอบคุณที่อุดหนุน Bamblue Store<br/>
            กำลังนำคุณไปหน้าคำสั่งซื้อ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <QrCode className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">ชำระเงินผ่าน PromptPay</h3>
              <p className="text-xs text-gray-500">สแกน QR Code เพื่อชำระเงิน</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">เลขที่ออเดอร์</p>
            <p className="font-bold text-gray-900">{orderNumber}</p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            {qrDataUrl ? (
              <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-blue-100">
                <img 
                  src={qrDataUrl} 
                  alt="PromptPay QR Code" 
                  className="w-56 h-56"
                />
              </div>
            ) : (
              <div className="w-56 h-56 bg-gray-100 rounded-2xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Amount */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">ยอดที่ต้องชำระ</p>
              <p className="text-3xl font-bold text-[#dc6fd6]">฿{amount.toLocaleString()}</p>
            </div>
          </div>

          {/* PromptPay Number */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 mb-1">เบอร์ PromptPay</p>
                <p className="font-bold text-blue-900 text-lg tracking-wider">
                  {phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}
                </p>
              </div>
              <button
                onClick={handleCopyPhone}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors cursor-pointer"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span className="text-sm font-medium">{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 rounded-xl p-4 text-sm">
            <p className="font-semibold text-yellow-800 mb-2">� วิธีชำระเงิน</p>
            <ol className="text-yellow-700 space-y-1 list-decimal list-inside">
              <li>เปิดแอปธนาคารบนมือถือ</li>
              <li>เลือก "สแกน QR Code"</li>
              <li>สแกน QR Code ด้านบน</li>
              <li>ตรวจสอบยอดเงินและกดยืนยัน</li>
              <li>กดปุ่ม "ชำระเงินแล้ว" ด้านล่าง</li>
            </ol>
          </div>

          {/* Confirm Payment Button */}
          <button
            onClick={handleConfirmPayment}
            disabled={isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-white transition-colors ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#dc6fd6] hover:bg-[#c05ca8] cursor-pointer'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                กำลังดำเนินการ...
              </span>
            ) : (
              '✅ ชำระเงินแล้ว'
            )}
          </button>

          <p className="text-xs text-center text-gray-400">
            หลังจากโอนเงินแล้ว กดปุ่มด้านบนเพื่อยืนยัน<br/>
            ทางร้านจะตรวจสอบและจัดส่งสินค้าให้ภายใน 1-2 วัน
          </p>
        </div>
      </div>
    </div>
  );
}
