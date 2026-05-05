"use client";
import { useState, useEffect } from 'react';
import { supabase, supabasePublic } from '../../lib/supabase';
import { Star, ThumbsUp, User, Calendar, MessageSquare, Plus, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PRODUCT_REVIEW_PRODUCT_COLUMNS = 'id, nameEN, nameTH, image';
const PRODUCT_REVIEW_COLUMNS = 'id, rating, title, comment, reviewer_name, created_at, is_verified, helpful_count';

export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [user, setUser] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);
  const [product, setProduct] = useState(null);

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
    checkUserPurchase();
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabasePublic
        .from('products1')
        .select(PRODUCT_REVIEW_PRODUCT_COLUMNS)
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabasePublic
        .from('reviews')
        .select(PRODUCT_REVIEW_COLUMNS)
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

  // ตรวจสอบว่าผู้ใช้ซื้อสินค้านี้แล้วหรือยัง
  const checkUserPurchase = async () => {
    try {
      setCheckingPurchase(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCheckingPurchase(false);
        return;
      }

      // ดึงออเดอร์ที่จัดส่งสำเร็จแล้ว
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          order_items (
            product_id
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'delivered');

      if (error) throw error;

      // ตรวจสอบว่ามีสินค้านี้ในออเดอร์ที่จัดส่งสำเร็จหรือไม่
      const purchased = orders?.some(order => 
        order.order_items?.some(item => item.product_id === parseInt(productId))
      );

      setHasPurchased(purchased || false);
    } catch (error) {
      console.error('Error checking purchase:', error);
      setHasPurchased(false);
    } finally {
      setCheckingPurchase(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนรีวิว', {
        duration: 3000,
        style: {
          background: '#fff',
          color: '#333',
          padding: '16px',
          borderRadius: '12px',
        },
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert([{
          product_id: parseInt(productId),
          user_id: user.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
          reviewer_name: user.user_metadata?.first_name || user.user_metadata?.name || 'ผู้ใช้',
          reviewer_email: user.email,
          is_verified: hasPurchased,
          is_approved: false,
          // ✅ เพิ่มข้อมูลสินค้าที่จำเป็น (NOT NULL columns)
          product_name_en: product?.nameEN || 'Unknown Product',
          product_name_th: product?.nameTH || '',
          product_image: product?.image || ''
        }]);

      if (error) throw error;

      toast.success(
        <div className="flex items-center gap-3">
          <CheckCircle className="text-green-500" size={20} />
          <div>
            <p className="font-semibold">ส่งรีวิวสำเร็จ! ✨</p>
            <p className="text-sm text-gray-500">รอการอนุมัติจากแอดมิน</p>
          </div>
        </div>,
        {
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        }
      );
      setShowReviewForm(false);
      setReviewForm({ rating: 5, title: '', comment: '' });
      setHasReviewed(true);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(
        <div>
          <p className="font-semibold">เกิดข้อผิดพลาด</p>
          <p className="text-sm">{error.message || 'ไม่สามารถส่งรีวิวได้'}</p>
        </div>,
        {
          duration: 4000,
          style: {
            background: '#fff',
            color: '#333',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        }
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อน', {
        duration: 3000,
        style: {
          background: '#fff',
          color: '#333',
          padding: '16px',
          borderRadius: '12px',
        },
      });
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
        
        {user && !hasReviewed && !checkingPurchase && (
          hasPurchased ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="flex items-center gap-2 bg-[#dc6fd6] text-white px-4 py-2 rounded-lg hover:bg-[#c05ca8] transition-colors"
            >
              <Plus size={16} />
              เขียนรีวิว
            </button>
          ) : (
            <div className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
              ซื้อสินค้านี้เพื่อเขียนรีวิว
            </div>
          )
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
