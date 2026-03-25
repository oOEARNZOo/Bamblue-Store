"use client";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * 🎬 PageTransition Component
 * - ทำให้การเปลี่ยนหน้ามี animation fade in smooth
 * - ใช้ครอบ content ในแต่ละหน้า
 */
export default function PageTransition({ children }) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Reset animation เมื่อเปลี่ยนหน้า
    setIsVisible(false);
    
    // Trigger animation หลังจาก mount
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div 
      className={`transition-all duration-400 ease-out ${
        isVisible 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-2'
      }`}
    >
      {children}
    </div>
  );
}
