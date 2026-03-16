"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Star, ThumbsUp, User, Calendar, MessageSquare, Plus } from 'lucide-react';

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [user, setUser] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);

  // Form state
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
    checkUserReview();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkUserReview = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);
      
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setHasReviewed(true);
      }
    } catch (error) {
      // User hasn't reviewed yet
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนรีวิว');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          product_id: productId,
          user_id: user.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
          reviewer_name: user.user_metadata?.first_name || 'ผู้ใช้',
          reviewer_email: user.email
        }]);

      if (error) throw error;

      alert('รีวิวของคุณถูกส่งแล้ว!');
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      setHasReviewed(true);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('เกิดข้อผิดพลาดในการส่งรีวิว');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      return;
    }

    try {
      // ตรวจสอบว่ากด "ช่วยเหลือ" แล้วหรือยัง
      const { data: existing } = await supabase
        .from('review_helpful')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        // ลบการกด "ช่วยเหลือ"
        await supabase
          .from('review_helpful')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);

        // อัพเดต helpful_count
        await supabase.rpc('decrement_helpful_count', { review_id: reviewId });
      } else {
        // เพิ่มการกด "ช่วยเหลือ"
        await supabase
          .from('review_helpful')
          .insert([{
            review_id: reviewId,
            user_id: user.id
          }]);

        // อัพเดต helpful_count
        await supabase.rpc('increment_helpful_count', { review_id: reviewId });
      }

      fetchReviews();
    } catch (error) {
      console.error('Error updating helpful:', error);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  const renderRatingInput = () => {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setReviewForm(prev => ({ ...prev, rating: i + 1 }))}
            className="p-1"
          >
            <Star
              size={24}
              className={i < reviewForm.rating ? 'text-yellow-400 fill-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-yellow-400'}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dc6fd6] mx-auto mb-2"></div>
        <p className="text-gray-500">กำลังโหลดรีวิว...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ส่วนหัวรีวิว */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">รีวิวจากลูกค้า</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {renderStars(4.5)}
              <span className="ml-2 font-semibold">4.5</span>
            </div>
            <span className="text-gray-500">({reviews.length} รีวิว)</span>
          </div>
        </div>
        
        {user && !hasReviewed && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="flex items-center gap-2 bg-[#dc6fd6] text-white px-4 py-2 rounded-lg hover:bg-[#c05ca8] transition-colors"
          >
            <Plus size={16} />
            เขียนรีวิว
          </button>
        )}
      </div>

      {/* ฟอร์มเขียนรีวิว */}
      {showReviewForm && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">เขียนรีวิวสินค้า</h3>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">คะแนน</label>
              {renderRatingInput()}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อรีวิว</label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none"
                placeholder="เช่น สินค้าดีมากครับ"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียดรีวิว</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none h-24 resize-none"
                placeholder="บอกเล่าประสบการณ์ของคุณกับสินค้านี้..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#dc6fd6] text-white px-4 py-2 rounded-lg hover:bg-[#c05ca8] disabled:bg-gray-400 transition-colors"
              >
                {submitting ? 'กำลังส่ง...' : 'ส่งรีวิว'}
              </button>
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </form>
        </div>
      )}

      {/* รายการรีวิว */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <MessageSquare size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">ยังไม่มีรีวิวสำหรับสินค้านี้</p>
            {user && !hasReviewed && (
              <p className="text-sm text-gray-400 mt-2">เป็นคนแรกที่รีวิวสินค้านี้!</p>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h4 className="font-semibold text-gray-900">{review.reviewer_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                        {review.is_verified && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            ซื้อแล้ว
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={14} />
                      {new Date(review.created_at).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                  
                  {review.title && (
                    <h5 className="font-medium text-gray-900 mt-2">{review.title}</h5>
                  )}
                  
                  <p className="text-gray-600 mt-1">{review.comment}</p>
                  
                  <div className="flex items-center gap-4 mt-3">
                    <button
                      onClick={() => handleHelpful(review.id)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#dc6fd6] transition-colors"
                    >
                      <ThumbsUp size={14} />
                      ช่วยเหลือ ({review.helpful_count})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
