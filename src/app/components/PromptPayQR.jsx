"use client";
import { useState, useEffect, useCallback } from 'react';
import { QrCode, Copy, Check, X, CheckCircle, Clock, AlertCircle, Download } from 'lucide-react';
import limitedToast from '../../lib/toast';

/**
 * 🏦 PromptPay QR Code Generator Component (Professional Version)
 * - สร้าง QR Code สำหรับชำระเงินผ่าน PromptPay
 * - มี Countdown Timer 15 นาที
 * - แสดง Progress Steps
 * - แสดงชื่อผู้รับเงิน
 * - รองรับทุกธนาคาร
 */

const PAYMENT_TIMEOUT = 15 * 60; // 15 นาที (วินาที)
const MERCHANT_NAME = 'นายชนาธิป ต้นเงิน';

// โลโก้ธนาคารที่รองรับ
const BANK_LOGOS = [
  { name: 'SCB', color: '#4E2A84' },
  { name: 'KBANK', color: '#138F2D' },
  { name: 'KTB', color: '#1BA5E0' },
  { name: 'BBL', color: '#1E4598' },
  { name: 'TMB', color: '#1279BE' },
  { name: 'GSB', color: '#EB198D' },
];

export default function PromptPayQR({ 
  phoneNumber = '0917484417',
  amount = 0,
  orderNumber = '',
  onClose,
  onSuccess,
  onTimeout,
  mockMode = true // เปิด Mock Mode เป็นค่าเริ่มต้น (สำหรับ Portfolio)
}) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(PAYMENT_TIMEOUT);
  const [currentStep, setCurrentStep] = useState(1); // 1: สแกน, 2: โอน, 3: ยืนยัน
  const [transactionRef, setTransactionRef] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);

  // สร้าง QR Code ด้วย PromptPay QR API
  useEffect(() => {
    if (amount > 0) {
      const qrUrl = `https://promptpay.io/${phoneNumber}/${amount.toFixed(2)}.png`;
      setQrDataUrl(qrUrl);
    }
  }, [phoneNumber, amount]);

  // Countdown Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setIsExpired(true);
      if (onTimeout) onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeout]);

  // Format time เป็น MM:SS
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // คำนวณ progress percentage
  const progressPercent = ((PAYMENT_TIMEOUT - timeLeft) / PAYMENT_TIMEOUT) * 100;

  // Copy เบอร์ PromptPay
  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phoneNumber);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  // Copy ยอดเงิน
  const handleCopyAmount = () => {
    navigator.clipboard.writeText(amount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  // Download QR Code
  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `promptpay-${orderNumber}.png`;
    link.click();
  };

  // ยืนยันการชำระเงิน (Mock Mode + Real Mode)
  const handleConfirmPayment = async () => {
    if (isProcessing || isExpired) return;
    
    
    setIsProcessing(true);
    setIsVerifying(true);
    setCurrentStep(3);
    
    try {
      if (mockMode) {
        // 🎭 Mock Mode - จำลองการตรวจสอบแบบ real-time
        
        // Step 1: เชื่อมต่อระบบ (0-30%)
        for (let i = 0; i <= 30; i += 10) {
          setVerificationProgress(i);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // Step 2: ตรวจสอบธุรกรรม (30-70%)
        for (let i = 30; i <= 70; i += 10) {
          setVerificationProgress(i);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Step 3: ยืนยันการชำระเงิน (70-100%)
        for (let i = 70; i <= 100; i += 10) {
          setVerificationProgress(i);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        // จำลองความสำเร็จ 95% (5% จะแสดง error เพื่อความสมจริง)
        const isSuccess = Math.random() > 0.05;
        
        if (!isSuccess) {
          throw new Error('ไม่พบรายการโอนเงิน กรุณาลองใหม่อีกครั้ง');
        }
        
        // สำเร็จ - เรียก callback
        const paymentData = {
          transactionRef: transactionRef || `MOCK-${Date.now()}`,
          amount: amount,
          timestamp: new Date().toISOString(),
          mockMode: true
        };
        
        
        if (onSuccess) {
          await onSuccess(paymentData);
        }
        
      } else {
        // 🔍 Real Mode - ใช้ Payment Gateway API (Omise, 2C2P, etc.)
        // TODO: เพิ่มการเชื่อมต่อกับ Payment Gateway จริงตรงนี้
        if (onSuccess) {
          await onSuccess({
            transactionRef: transactionRef,
            mockMode: false
          });
        }
      }
      
      setConfirmed(true);
    } catch (error) {
      console.error('Error confirming payment:', error);
      limitedToast.error(error.message || 'ไม่สามารถยืนยันการชำระเงินได้', {
        id: 'payment-confirm-error',
        duration: 3000
      });
      setIsProcessing(false);
      setIsVerifying(false);
      setVerificationProgress(0);
      setCurrentStep(2);
    }
  };

  // แสดงหน้าหมดเวลา
  if (isExpired && !confirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-500" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">หมดเวลาชำระเงิน</h3>
          <p className="text-gray-500 mb-6">
            กรุณาทำรายการใหม่อีกครั้ง
          </p>
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    );
  }

  // แสดงหน้าสำเร็จ
  if (confirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">สั่งซื้อสำเร็จ! 🎉</h3>
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
        {/* Header with Timer */}
        <div className="sticky top-0 bg-white border-b z-10">
          {/* Countdown Timer */}
          <div className={`px-6 py-3 flex items-center justify-between ${timeLeft <= 60 ? 'bg-red-50' : 'bg-blue-50'}`}>
            <div className="flex items-center gap-2">
              <Clock size={18} className={timeLeft <= 60 ? 'text-red-500' : 'text-blue-600'} />
              <span className={`text-sm font-medium ${timeLeft <= 60 ? 'text-red-600' : 'text-blue-600'}`}>
                เหลือเวลา
              </span>
            </div>
            <span className={`text-lg font-bold ${timeLeft <= 60 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          {/* Progress Bar */}
          <div className="h-1 bg-gray-200">
            <div 
              className={`h-full transition-all duration-1000 ${timeLeft <= 60 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${100 - progressPercent}%` }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4">
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
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2">
            {[
              { step: 1, label: 'สแกน QR' },
              { step: 2, label: 'โอนเงิน' },
              { step: 3, label: 'ยืนยัน' }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    currentStep >= item.step 
                      ? 'bg-[#dc6fd6] text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > item.step ? <Check size={16} /> : item.step}
                  </div>
                  <span className={`text-xs mt-1 ${currentStep >= item.step ? 'text-[#dc6fd6] font-medium' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`w-8 h-0.5 mx-1 mb-5 ${currentStep > item.step ? 'bg-[#dc6fd6]' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Mock Mode Badge */}
          {mockMode && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-3 flex items-center gap-2">
              <span className="text-xl">🎭</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-yellow-900">Demo Mode</p>
                <p className="text-xs text-yellow-700">ระบบจำลองการตรวจสอบอัตโนมัติ (สำหรับ Portfolio)</p>
              </div>
            </div>
          )}

          {/* Order Info */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">เลขที่ออเดอร์</p>
            <p className="font-bold text-gray-900">{orderNumber}</p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            {qrDataUrl ? (
              <div className="relative">
                <div className="bg-white p-4 rounded-2xl shadow-lg border-2 border-blue-100">
                  <img 
                    src={qrDataUrl} 
                    alt="PromptPay QR Code" 
                    className="w-52 h-52"
                  />
                </div>
                {/* Download Button */}
                <button
                  onClick={handleDownloadQR}
                  className="absolute -bottom-3 -right-3 w-10 h-10 bg-white rounded-full shadow-lg border flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors cursor-pointer"
                  title="ดาวน์โหลด QR Code"
                >
                  <Download size={18} />
                </button>
              </div>
            ) : (
              <div className="w-52 h-52 bg-gray-100 rounded-2xl flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Amount */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">ยอดที่ต้องชำระ</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-3xl font-bold text-[#dc6fd6]">฿{amount.toLocaleString()}</p>
                <button
                  onClick={handleCopyAmount}
                  className="p-1.5 rounded-lg hover:bg-pink-50 text-gray-400 hover:text-[#dc6fd6] transition-colors cursor-pointer"
                  title="คัดลอกยอดเงิน"
                >
                  {copiedAmount ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Merchant Info */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-xs text-green-600 mb-1">ชื่อผู้รับเงิน</p>
                <p className="font-bold text-green-900">{MERCHANT_NAME}</p>
                <p className="text-xs text-green-600 mt-1">
                  ⚠️ กรุณาตรวจสอบชื่อผู้รับก่อนยืนยันการโอน
                </p>
              </div>
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
                {copiedPhone ? <Check size={16} /> : <Copy size={16} />}
                <span className="text-sm font-medium">{copiedPhone ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
              </button>
            </div>
          </div>

          {/* Transaction Reference (Optional) */}
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เลขอ้างอิงการโอน <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
            </label>
            <input
              type="text"
              value={transactionRef}
              onChange={(e) => {
                setTransactionRef(e.target.value);
                if (e.target.value) setCurrentStep(2);
              }}
              placeholder="กรอกเลขอ้างอิงจากสลิป"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dc6fd6] focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">
              เลขอ้างอิงช่วยให้ทางร้านตรวจสอบการชำระเงินได้เร็วขึ้น
            </p>
          </div>

          {/* Bank Logos */}
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-3">รองรับทุกธนาคาร</p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {BANK_LOGOS.map((bank) => (
                <div
                  key={bank.name}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: bank.color }}
                >
                  {bank.name.slice(0, 3)}
                </div>
              ))}
            </div>
          </div>

          {/* Verification Progress */}
          {isVerifying && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  🔍 กำลังตรวจสอบการชำระเงิน...
                </span>
                <span className="text-sm font-bold text-blue-600">{verificationProgress}%</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${verificationProgress}%` }}
                />
              </div>
              
              <p className="text-xs text-blue-600 text-center">
                {verificationProgress < 30 && '📡 เชื่อมต่อกับระบบธนาคาร...'}
                {verificationProgress >= 30 && verificationProgress < 70 && '🔎 ตรวจสอบรายการโอนเงิน...'}
                {verificationProgress >= 70 && '✅ ยืนยันการชำระเงิน...'}
              </p>
            </div>
          )}

          {/* Confirm Payment Button */}
          <button
            onClick={handleConfirmPayment}
            disabled={isProcessing || isExpired}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
              isProcessing || isExpired
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[#dc6fd6] hover:bg-[#c05ca8] cursor-pointer hover:shadow-lg'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                {mockMode ? 'กำลังตรวจสอบอัตโนมัติ...' : 'กำลังดำเนินการ...'}
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
