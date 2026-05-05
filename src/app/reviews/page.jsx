"use client";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabasePublic } from '../../lib/supabase';
import { CheckCircle, MessageSquare, ShoppingBag, SlidersHorizontal, Star } from 'lucide-react';

const PUBLIC_REVIEW_COLUMNS = 'id, rating, title, comment, reviewer_name, created_at, is_verified';

const FILTERS = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'five', label: '5 ดาว' },
  { id: 'verified', label: 'ยืนยันแล้ว' }
];

const SORT_OPTIONS = [
  { id: 'latest', label: 'ล่าสุด' },
  { id: 'rating-high', label: 'คะแนนสูงสุด' },
  { id: 'rating-low', label: 'คะแนนต่ำสุด' }
];

const StarRating = ({ rating, size = 16 }) => (
  <div className="flex gap-0.5" aria-label={`${rating} stars`}>
    {[...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={size}
        className={index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ))}
  </div>
);

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('th-TH', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const getInitial = (name) => (name || 'ผู้ใช้').trim().charAt(0).toUpperCase();

function ReviewCard({ review }) {
  return (
    <article className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pink-50 text-sm font-black text-[#dc6fd6]">
            {getInitial(review.reviewer_name)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-gray-950">{review.reviewer_name || 'ผู้ใช้'}</h3>
            <p className="mt-0.5 text-xs text-gray-400">{formatDate(review.created_at)}</p>
          </div>
        </div>

        {review.is_verified && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
            <CheckCircle size={13} />
            ซื้อแล้ว
          </span>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <StarRating rating={Number(review.rating || 0)} />
        <span className="text-xs font-bold text-gray-400">{Number(review.rating || 0).toFixed(1)}</span>
      </div>

      {review.title && (
        <p className="mb-2 line-clamp-2 text-base font-black text-gray-950">{review.title}</p>
      )}

      <p className="line-clamp-4 text-sm leading-7 text-gray-600">
        “{review.comment}”
      </p>
    </article>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabasePublic
        .from('reviews')
        .select(PUBLIC_REVIEW_COLUMNS)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(24);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = reviews.length;
    const verified = reviews.filter((review) => review.is_verified).length;
    const average = total
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / total
      : 0;

    return {
      total,
      verified,
      average: average.toFixed(1)
    };
  }, [reviews]);

  const visibleReviews = useMemo(() => {
    const filtered = reviews.filter((review) => {
      if (activeFilter === 'five') return Number(review.rating || 0) === 5;
      if (activeFilter === 'verified') return review.is_verified;
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'rating-high') return Number(b.rating || 0) - Number(a.rating || 0);
      if (sortBy === 'rating-low') return Number(a.rating || 0) - Number(b.rating || 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [reviews, activeFilter, sortBy]);

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-4 py-10 md:px-8 md:py-12">
        <section className="mx-auto max-w-6xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h1 className="text-3xl font-black text-gray-950 md:text-4xl">รีวิวจากลูกค้า</h1>
            <p className="mt-3 text-sm text-gray-500">กำลังโหลดรีวิว...</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-11 w-11 animate-pulse rounded-full bg-gray-100" />
                  <div className="flex-1">
                    <div className="mb-2 h-3 w-28 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
                <div className="mb-4 h-4 w-32 animate-pulse rounded bg-gray-100" />
                <div className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 md:px-8 md:py-12">
      <section className="mx-auto max-w-6xl">
        <div className="mb-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-950 md:text-5xl">
              รีวิวจากลูกค้า
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-500 md:text-base">
              รวมเสียงตอบรับจากลูกค้าที่เคยใช้งาน Bamblue store ช่วยให้เลือกสินค้าได้มั่นใจขึ้น และทำให้ระบบรีวิวดูพร้อมใช้งานเมื่อมีข้อมูลมากขึ้น
            </p>
          </div>

          <div className="rounded-3xl border border-pink-100 bg-pink-50 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#dc6fd6]">Average rating</p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-4xl font-black text-gray-950">{stats.average}</span>
                  <span className="pb-1 text-sm font-bold text-gray-500">/ 5</span>
                </div>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-yellow-400 shadow-sm">
                <Star className="fill-yellow-400" size={28} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white p-3">
                <p className="font-black text-gray-950">{stats.total}</p>
                <p className="mt-1 text-xs text-gray-500">รีวิวทั้งหมด</p>
              </div>
              <div className="rounded-2xl bg-white p-3">
                <p className="font-black text-gray-950">{stats.verified}</p>
                <p className="mt-1 text-xs text-gray-500">ยืนยันแล้ว</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                  activeFilter === filter.id
                    ? 'bg-[#dc6fd6] text-white'
                    : 'bg-gray-50 text-gray-600 hover:bg-pink-50 hover:text-[#dc6fd6]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <label className="relative block min-w-52">
            <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm font-bold text-gray-700 outline-none transition-colors focus:border-[#dc6fd6]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        {visibleReviews.length === 0 ? (
          <div className="mx-auto flex min-h-80 max-w-xl flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <MessageSquare size={48} className="mb-4 text-gray-300" />
            <h2 className="text-xl font-black text-gray-950">ยังไม่มีรีวิวในตัวกรองนี้</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              เมื่อมีรีวิวจากลูกค้า ระบบจะแสดงที่หน้านี้อัตโนมัติ ลองดูสินค้าก่อนเพื่อทดสอบ flow รีวิวจากหน้าสินค้า
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-800"
            >
              <ShoppingBag size={17} />
              ดูสินค้าทั้งหมด
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
