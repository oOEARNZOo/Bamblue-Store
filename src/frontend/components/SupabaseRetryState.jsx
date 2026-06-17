"use client";

import { RefreshCcw } from 'lucide-react';

export default function SupabaseRetryState({
  title = 'โหลดข้อมูลไม่สำเร็จ',
  message = 'ระบบดึงข้อมูลจากฐานข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
  badge = 'SUPABASE',
  retryLabel = 'ลองโหลดใหม่',
  onRetry,
  className = ''
}) {
  return (
    <div className={`mx-auto flex max-w-xl flex-col items-center justify-center rounded-3xl border border-pink-100 bg-white px-6 py-10 text-center shadow-[0_18px_55px_rgba(31,18,36,0.08)] ${className}`}>
      <div className="mb-3 rounded-full border border-pink-100 bg-[var(--bamblue-brand-soft)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--bamblue-brand-ink)]">
        {badge}
      </div>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bamblue-brand-soft)] text-[var(--bamblue-brand)]">
        <RefreshCcw size={22} />
      </div>
      <h4 className="text-lg font-black text-gray-950">{title}</h4>
      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 rounded-full bg-[var(--bamblue-brand)] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-pink-200/70 transition-all hover:-translate-y-0.5 hover:bg-[var(--bamblue-brand-hover)]"
      >
        {retryLabel}
      </button>
    </div>
  );
}
