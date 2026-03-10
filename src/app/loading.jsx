import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[70vh] w-full flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      {/* ไอคอนหมุนๆ สีชมพูแบรนด์ */}
      <Loader2 className="w-12 h-12 animate-spin text-[#dc6fd6] mb-4" strokeWidth={1.5} />
      
      {/* ข้อความ Loading แบบมีเอฟเฟกต์กระพริบเบาๆ */}
      <p className="text-zinc-600 font-medium tracking-[0.2em] text-sm animate-pulse">
        LOADING...
      </p>
    </div>
  );
}