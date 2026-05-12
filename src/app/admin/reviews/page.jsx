"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/frontend/services/supabaseClient';
import { checkIsAdminCached } from '@/frontend/auth/adminCheck';
import { 
  Star, 
  Search,
  Eye,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  User,
  Calendar,
  X,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { OrderListSkeleton } from '@/frontend/components/LoadingSkeletons';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ReviewManagementPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingReviewId, setUpdatingReviewId] = useState(null);

  useEffect(() => {
    const initializePage = async () => {
      const hasAccess = await checkAdminAccess();
      if (hasAccess) {
        fetchReviews();
      }
    };

    initializePage();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return false;
      }

      const isAdminUser = await checkIsAdminCached(user);

      if (!isAdminUser) {
        router.push('/');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Admin check error:', error);
      router.push('/login');
      return false;
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลรีวิว', {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReview = async (reviewId) => {
    if (updatingReviewId === reviewId) return;
    setUpdatingReviewId(reviewId);

    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('อนุมัติรีวิวสำเร็จ!', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });

      fetchReviews();
      if (selectedReview?.id === reviewId) {
        setSelectedReview({ ...selectedReview, is_approved: true });
      }
    } catch (error) {
      console.error('Error approving review:', error);
      toast.error('เกิดข้อผิดพลาด: ' + error.message, {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setUpdatingReviewId(null);
    }
  };

  const handleRejectReview = async (reviewId) => {
    if (updatingReviewId === reviewId) return;

    toast((t) => (
      <div className="flex flex-col gap-3">
        <div>
          <p className="font-semibold text-gray-900">ยืนยันการปฏิเสธรีวิว</p>
          <p className="text-sm text-gray-600 mt-1">คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธรีวิวนี้?</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await rejectReview(reviewId);
            }}
            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            ปฏิเสธรีวิว
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
    });
  };

  const rejectReview = async (reviewId) => {
    setUpdatingReviewId(reviewId);

    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: false })
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('ปฏิเสธรีวิวสำเร็จ!', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });

      fetchReviews();
      if (selectedReview?.id === reviewId) {
        setSelectedReview({ ...selectedReview, is_approved: false });
      }
    } catch (error) {
      console.error('Error rejecting review:', error);
      toast.error('เกิดข้อผิดพลาด: ' + error.message, {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setUpdatingReviewId(null);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (updatingReviewId === reviewId) return;

    toast((t) => (
      <div className="flex flex-col gap-3">
        <div>
          <p className="font-semibold text-gray-900">ยืนยันการลบรีวิว</p>
          <p className="text-sm text-gray-600 mt-1">คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวนี้? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await deleteReview(reviewId);
            }}
            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            ลบรีวิว
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    ), {
      duration: 10000,
    });
  };

  const deleteReview = async (reviewId) => {
    setUpdatingReviewId(reviewId);

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast.success('ลบรีวิวสำเร็จ!', {
        duration: 3000,
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });

      fetchReviews();
      if (selectedReview?.id === reviewId) {
        setIsModalOpen(false);
        setSelectedReview(null);
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('เกิดข้อผิดพลาด: ' + error.message, {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setUpdatingReviewId(null);
    }
  };

  const viewReviewDetails = (review) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  const getStatusConfig = (isApproved) => {
    if (isApproved === true) {
      return {
        label: 'อนุมัติแล้ว',
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200'
      };
    } else if (isApproved === false) {
      return {
        label: 'ถูกปฏิเสธ',
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200'
      };
    } else {
      return {
        label: 'รอตรวจสอบ',
        icon: Clock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200'
      };
    }
  };

  const filteredReviews = reviews.filter(review => {
    let matchStatus = true;
    if (selectedStatus === 'approved') {
      matchStatus = review.is_approved === true;
    } else if (selectedStatus === 'rejected') {
      matchStatus = review.is_approved === false;
    } else if (selectedStatus === 'pending') {
      matchStatus = review.is_approved === null;
    }

    const matchSearch = !searchQuery || 
      review.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.user_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchStatus && matchSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  // Stats
  const totalReviews = reviews.length;
  const approvedReviews = reviews.filter(r => r.is_approved === true).length;
  const pendingReviews = reviews.filter(r => r.is_approved === null).length;
  const rejectedReviews = reviews.filter(r => r.is_approved === false).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <OrderListSkeleton count={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">จัดการรีวิว</h1>
                <p className="text-sm text-gray-500">อนุมัติ ปฏิเสธ หรือลบรีวิวจากลูกค้า</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ค้นหารีวิว, ชื่อผู้ใช้..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none"
          >
            <option value="all">ทั้งหมด ({totalReviews})</option>
            <option value="pending">รอตรวจสอบ ({pendingReviews})</option>
            <option value="approved">อนุมัติแล้ว ({approvedReviews})</option>
            <option value="rejected">ถูกปฏิเสธ ({rejectedReviews})</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
            <MessageSquare className="mx-auto text-[#dc6fd6] mb-2" size={24} />
            <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
            <p className="text-sm text-gray-500">รีวิวทั้งหมด</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
            <Clock className="mx-auto text-yellow-500 mb-2" size={24} />
            <p className="text-2xl font-bold text-yellow-600">{pendingReviews}</p>
            <p className="text-sm text-gray-500">รอตรวจสอบ</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
            <CheckCircle className="mx-auto text-green-500 mb-2" size={24} />
            <p className="text-2xl font-bold text-green-600">{approvedReviews}</p>
            <p className="text-sm text-gray-500">อนุมัติแล้ว</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4 text-center">
            <XCircle className="mx-auto text-red-500 mb-2" size={24} />
            <p className="text-2xl font-bold text-red-600">{rejectedReviews}</p>
            <p className="text-sm text-gray-500">ถูกปฏิเสธ</p>
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <MessageSquare className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">ไม่พบรีวิว</p>
            <p className="text-gray-400 text-sm mt-2">ลองค้นหาด้วยคำอื่น หรือเปลี่ยนฟิลเตอร์</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => {
              const statusConfig = getStatusConfig(review.is_approved);
              const StatusIcon = statusConfig.icon;

              return (
                <div key={review.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-[#dc6fd6] rounded-full flex items-center justify-center text-white font-bold">
                            {review.user_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{review.user_name || 'ผู้ใช้'}</h3>
                            <div className="flex items-center gap-2">
                              {renderStars(review.rating)}
                              <span className="text-sm text-gray-500">({review.rating}/5)</span>
                            </div>
                          </div>
                          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border ml-auto`}>
                            <StatusIcon size={16} />
                            {statusConfig.label}
                          </span>
                        </div>

                        {review.title && (
                          <h4 className="font-semibold text-gray-800 mb-2">{review.title}</h4>
                        )}
                        
                        <p className="text-gray-600 line-clamp-2">{review.comment}</p>
                        
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {formatDate(review.created_at)}
                          </span>
                          {review.product_id && (
                            <span className="flex items-center gap-1">
                              สินค้า ID: {review.product_id}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t">
                      <button
                        onClick={() => viewReviewDetails(review)}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        <Eye size={16} />
                        ดูรายละเอียด
                      </button>

                      {review.is_approved !== true && (
                        <button
                          onClick={() => handleApproveReview(review.id)}
                          disabled={updatingReviewId === review.id}
                          className="flex items-center gap-1 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <ThumbsUp size={16} />
                          อนุมัติ
                        </button>
                      )}

                      {review.is_approved !== false && (
                        <button
                          onClick={() => handleRejectReview(review.id)}
                          disabled={updatingReviewId === review.id}
                          className="flex items-center gap-1 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                          <ThumbsDown size={16} />
                          ปฏิเสธ
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Details Modal */}
      {isModalOpen && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">รายละเอียดรีวิว</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Reviewer Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">ข้อมูลผู้รีวิว</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#dc6fd6] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedReview.user_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">{selectedReview.user_name || 'ผู้ใช้'}</p>
                      <p className="text-gray-500">{selectedReview.user_email || 'ไม่ระบุอีเมล'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">เนื้อหารีวิว</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">คะแนน:</span>
                    {renderStars(selectedReview.rating)}
                    <span className="text-gray-600">({selectedReview.rating}/5)</span>
                  </div>
                  {selectedReview.title && (
                    <div>
                      <span className="font-medium">หัวข้อ:</span>
                      <p className="text-gray-700 mt-1">{selectedReview.title}</p>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">ความคิดเห็น:</span>
                    <p className="text-gray-700 mt-1 whitespace-pre-wrap">{selectedReview.comment}</p>
                  </div>
                  <div>
                    <span className="font-medium">วันที่รีวิว:</span>
                    <p className="text-gray-600">{formatDate(selectedReview.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">สถานะ</h3>
                <div className="flex items-center gap-2">
                  {(() => {
                    const statusConfig = getStatusConfig(selectedReview.is_approved);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <span className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}>
                        <StatusIcon size={18} />
                        {statusConfig.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedReview.is_approved !== true && (
                  <button
                    onClick={() => handleApproveReview(selectedReview.id)}
                    disabled={updatingReviewId === selectedReview.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50"
                  >
                    <ThumbsUp size={18} />
                    อนุมัติรีวิว
                  </button>
                )}

                {selectedReview.is_approved !== false && (
                  <button
                    onClick={() => handleRejectReview(selectedReview.id)}
                    disabled={updatingReviewId === selectedReview.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50"
                  >
                    <ThumbsDown size={18} />
                    ปฏิเสธรีวิว
                  </button>
                )}

                <button
                  onClick={() => handleDeleteReview(selectedReview.id)}
                  disabled={updatingReviewId === selectedReview.id}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
                >
                  <XCircle size={18} />
                  ลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
