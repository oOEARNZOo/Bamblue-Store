"use client";
import { useToaster, toast } from 'react-hot-toast';
import { useEffect } from 'react';

const MAX_TOASTS = 3;

export default function CustomToaster() {
  const { toasts, handlers } = useToaster();
  const { startPause, endPause } = handlers;

  // จำกัดจำนวน toast ที่แสดงพร้อมกัน
  useEffect(() => {
    const visibleToasts = toasts.filter(t => t.visible);
    if (visibleToasts.length > MAX_TOASTS) {
      // ลบ toast เก่าสุดออก (อันแรกที่เข้ามา)
      const oldestToast = visibleToasts[visibleToasts.length - 1];
      toast.dismiss(oldestToast.id);
    }
  }, [toasts]);

  return (
    <>
      {/* CSS Animation Keyframes */}
      <style jsx global>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOutToLeft {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(-100%);
          }
        }
        .toast-enter {
          animation: slideInFromLeft 0.3s ease-out forwards;
        }
        .toast-exit {
          animation: slideOutToLeft 0.3s ease-out forwards;
        }
      `}</style>

      <div
        className="fixed bottom-5 left-5 z-[9999] flex flex-col gap-2"
        onMouseEnter={startPause}
        onMouseLeave={endPause}
      >
        {toasts
          .filter(t => t.visible)
          .slice(0, MAX_TOASTS)
          .map((t) => (
            <div
              key={t.id}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border
                bg-white text-zinc-800 border-pink-400
                text-sm font-medium max-w-xs
                ${t.visible ? 'toast-enter' : 'toast-exit'}
              `}
              style={{
                boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.15)',
              }}
            >
            {/* Icon */}
            {t.type === 'success' && (
              <span className="text-pink-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            {t.type === 'error' && (
              <span className="text-red-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            {t.type !== 'success' && t.type !== 'error' && (
              <span className="text-pink-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            
            {/* Message */}
            <span className="flex-1">{t.message}</span>
            
            {/* Close button */}
            <button 
              onClick={() => toast.dismiss(t.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
