"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Star, CheckCircle, MessageSquare } from 'lucide-react';

const PUBLIC_REVIEW_COLUMNS = 'id, rating, title, comment, reviewer_name, created_at, is_verified';

// ⭐️ คอมโพเนนต์สำหรับแสดงดาว
const StarRating = ({ rating }) => {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">รีวิวจากลูกค้า</h1>
          <p className="text-gray-500">กำลังโหลดรีวิว...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 md:px-24">
      {/* 🎯 Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">รีวิวจากลูกค้า</h1>
        <p className="text-gray-500">
          ขอบคุณทุกเสียงตอบรับจากลูกค้าที่น่ารักของเรา Bamblue store ยินดีที่ได้เป็นส่วนหนึ่งในสไตล์ของคุณ 💖
        </p>
      </div>

      {/* Reviews Grid */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border max-w-md mx-auto">
          <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">ยังไม่มีรีวิวในขณะนี้</p>
          <p className="text-sm text-gray-400 mt-2">เป็นคนแรกที่รีวิวสินค้าของเรา!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              {/* ดาวและวันที่ */}
              <div className="flex justify-between items-center mb-4">
                <StarRating rating={review.rating} />
                <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
              </div>

              {/* ชื่อลูกค้าและ Badge */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-800">{review.reviewer_name || 'ผู้ใช้'}</h3>
                {review.is_verified && (
                  <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    <CheckCircle size={12} />
                    ซื้อแล้ว
                  </span>
                )}
              </div>
              
              {/* หัวข้อรีวิว */}
              {review.title && (
                <p className="text-sm font-medium text-gray-900 mb-2">{review.title}</p>
              )}

              {/* ข้อความรีวิว */}
              <p className="text-sm text-gray-600 leading-relaxed">
                "{review.comment}"
              </p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
