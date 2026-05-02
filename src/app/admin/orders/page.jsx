"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { checkIsAdminCached } from '../../../lib/adminCheck';
import {
  ShoppingCart,
  Search,
  Eye,
  X,
  ArrowLeft,
  Clock,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  CreditCard,
  Image as ImageIcon
} from 'lucide-react';
import { OrderListSkeleton } from '../../components/LoadingSkeletons';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function OrderManagementPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    const initializePage = async () => {
      const hasAccess = await checkAdminAccess();
      if (hasAccess) {
        fetchOrders();
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์', {
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

  const handleStatusChange = async (orderId, newStatus) => {
    // ป้องกันการอัปเดตซ้ำ
    if (updatingOrderId === orderId) return;

    // ถ้าเป็นการยกเลิกออเดอร์ ให้แสดง confirmation
    if (newStatus === 'cancelled') {
      toast((t) => (
        <div className="flex flex-col gap-3">
          <div>
            <p className="font-semibold text-gray-900">ยืนยันการยกเลิกออเดอร์</p>
            <p className="text-sm text-gray-600 mt-1">คุณแน่ใจหรือไม่ว่าต้องการยกเลิกออเดอร์นี้?</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                await updateOrderStatus(orderId, newStatus);
              }}
              className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
            >
              ยกเลิกออเดอร์
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
            >
              ไม่ใช่
            </button>
          </div>
        </div>
      ), {
        duration: 10000,
      });
      return;
    }

    // สำหรับสถานะอื่นๆ อัปเดตทันที
    await updateOrderStatus(orderId, newStatus);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    console.log('Updating order status:', orderId, 'to:', newStatus);
    setUpdatingOrderId(orderId);

    try {
      // ตรวจสอบว่ามีออเดอร์นี้อยู่จริงหรือไม่
      const { data: existingOrder, error: fetchError } = await supabase
        .from('orders')
        .select('id, status')
        .eq('id', orderId)
        .single();

      console.log('Existing order:', existingOrder);

      if (fetchError) {
        console.error('Error fetching existing order:', fetchError);
        throw fetchError;
      }

      if (!existingOrder) {
        console.error('Order not found:', orderId);
        throw new Error('ไม่พบออเดอร์ที่ต้องการอัปเดต');
      }

      // อัปเดตสถานะ
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select();

      console.log('Update result:', { data, error });

      if (error) {
        console.error('Supabase update error:', error);
        if (error.code === '42501') {
          throw new Error('ไม่มีสิทธิ์อัปเดตออเดอร์ (RLS Policy) - ต้องเพิ่ม Policy สำหรับ Admin');
        }
        throw error;
      }

      if (!data || data.length === 0) {
        console.error('No rows updated');
        throw new Error('ไม่สามารถอัปเดตออเดอร์ได้');
      }

      const successMessage = newStatus === 'cancelled'
        ? 'ยกเลิกออเดอร์สำเร็จ!'
        : `เปลี่ยนสถานะออเดอร์เป็น "${getStatusLabel(newStatus)}" สำเร็จ!`;

      toast.success(successMessage, {
        duration: 3000,
        style: {
          background: '#10b981',
          color: '#fff',
        },
      });

      // ดึงข้อมูลใหม่และอัปเดต state
      const { data: updatedOrders } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      setOrders(updatedOrders || []);

      if (selectedOrder?.id === orderId) {
        const updatedOrder = updatedOrders?.find(o => o.id === orderId);
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      }

      // Force re-render
      setForceUpdate(prev => prev + 1);

      console.log('Order status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('เกิดข้อผิดพลาด: ' + error.message, {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // ฟังก์ชันอนุมัติการชำระเงิน
  const handleApprovePayment = async (order) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div>
          <p className="font-semibold text-gray-900">อนุมัติการชำระเงิน</p>
          <p className="text-sm text-gray-600 mt-1">
            ออเดอร์: {order.order_number}<br />
            ยอดเงิน: ฿{order.total?.toLocaleString() || order.total_amount?.toLocaleString() || 0}<br />
            ลูกค้ายืนยันเมื่อ: {order.payment_confirmed_at ? new Date(order.payment_confirmed_at).toLocaleString('th-TH') : 'ไม่ระบุ'}
          </p>
          <p className="text-xs text-orange-600 mt-2">⚠️ กรุณาตรวจสอบ Statement ธนาคารก่อนอนุมัติ</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await approvePayment(order.id);
            }}
            className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            ✅ ยืนยันอนุมัติ
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
      duration: 30000,
    });
  };

  const approvePayment = async (orderId) => {
    setUpdatingOrderId(orderId);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_verified_at: new Date().toISOString(),
          payment_verified_by: user?.id
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('อนุมัติการชำระเงินสำเร็จ! ✅', {
        duration: 3000,
        style: { background: '#10b981', color: '#fff' },
      });

      // อัปเดต state
      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, status: 'paid', payment_verified_at: new Date().toISOString() }
          : order
      ));
    } catch (error) {
      console.error('Error approving payment:', error);
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'รอดำเนินการ',
        icon: Clock,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200'
      },
      pending_payment_verification: {
        label: 'รอตรวจสอบการชำระเงิน',
        icon: CreditCard,
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200'
      },
      paid: {
        label: 'ชำระเงินแล้ว',
        icon: CheckCircle,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200'
      },
      processing: {
        label: 'กำลังเตรียมสินค้า',
        icon: Package,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
      },
      shipped: {
        label: 'จัดส่งแล้ว',
        icon: Truck,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200'
      },
      delivered: {
        label: 'จัดส่งสำเร็จ',
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200'
      },
      cancelled: {
        label: 'ยกเลิก',
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200'
      }
    };
    return configs[status] || configs.pending;
  };

  const getStatusLabel = (status) => {
    return getStatusConfig(status).label;
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchSearch = !searchQuery ||
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchQuery.toLowerCase());
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
                <h1 className="text-2xl font-bold text-gray-900">จัดการออเดอร์</h1>
                <p className="text-sm text-gray-500">ดูและจัดการสถานะออเดอร์ทั้งหมด</p>
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
              placeholder="ค้นหาเลขออเดอร์, ชื่อลูกค้า, อีเมล..."
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
            <option value="all">ทุกสถานะ</option>
            <option value="pending">รอดำเนินการ</option>
            <option value="pending_payment_verification">รอตรวจสอบการชำระเงิน</option>
            <option value="paid">ชำระเงินแล้ว</option>
            <option value="processing">กำลังเตรียมสินค้า</option>
            <option value="shipped">จัดส่งแล้ว</option>
            <option value="delivered">จัดส่งสำเร็จ</option>
            <option value="cancelled">ยกเลิก</option>
          </select>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-[#dc6fd6]" size={20} />
              <span className="text-gray-600">พบออเดอร์</span>
              <span className="font-bold text-gray-900">{filteredOrders.length}</span>
              <span className="text-gray-600">รายการ</span>
            </div>
            <div className="text-sm text-gray-500">
              รายได้รวม: <span className="font-bold text-gray-900">
                ฿{filteredOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">ไม่พบออเดอร์</p>
            <p className="text-gray-400 text-sm mt-2">ลองค้นหาด้วยคำอื่น หรือเปลี่ยนฟิลเตอร์</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{order.order_number}</h3>
                          <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}>
                            <StatusIcon size={16} />
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>ลูกค้า: {order.first_name} {order.last_name}</p>
                          <p>อีเมล: {order.email}</p>
                          <p>วันที่สั่ง: {formatDate(order.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#dc6fd6]">
                          ฿{order.total_amount?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {order.order_items?.length || 0} รายการ
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        <Eye size={16} />
                        ดูรายละเอียด
                      </button>

                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <select
                          key={`${order.id}-${order.status}-${forceUpdate}`}
                          value={order.status}
                          onChange={(e) => {
                            console.log('Dropdown changed:', order.id, 'to:', e.target.value);
                            handleStatusChange(order.id, e.target.value);
                          }}
                          disabled={updatingOrderId === order.id}
                          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="pending">รอดำเนินการ</option>
                          <option value="pending_payment_verification">รอตรวจสอบการชำระเงิน</option>
                          <option value="paid">ชำระเงินแล้ว</option>
                          <option value="processing">กำลังเตรียมสินค้า</option>
                          <option value="shipped">จัดส่งแล้ว</option>
                          <option value="delivered">จัดส่งสำเร็จ</option>
                          <option value="cancelled">ยกเลิก</option>
                        </select>
                      )}

                      {/* ปุ่มอนุมัติการชำระเงิน (สำหรับออเดอร์ที่รอตรวจสอบ) */}
                      {order.status === 'pending_payment_verification' && (
                        <button
                          onClick={() => handleApprovePayment(order)}
                          className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                        >
                          <CheckCircle size={16} />
                          อนุมัติการชำระเงิน
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

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">รายละเอียดออเดอร์ {selectedOrder.order_number}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">ข้อมูลลูกค้า</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <p><span className="font-medium">ชื่อ:</span> {selectedOrder.first_name} {selectedOrder.last_name}</p>
                  <p><span className="font-medium">อีเมล:</span> {selectedOrder.email}</p>
                  <p><span className="font-medium">เบอร์โทร:</span> {selectedOrder.phone}</p>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">ที่อยู่จัดส่ง</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <p>{selectedOrder.address}</p>
                  <p>{selectedOrder.district}, {selectedOrder.province} {selectedOrder.postal_code}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">รายการสินค้า</h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                      <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {item.product_image && (
                          <img src={item.product_image} alt={item.product_name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product_name}</p>
                        <p className="text-sm text-gray-600">ขนาด: {item.size || 'ไม่ระบุ'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">x{item.quantity}</p>
                        <p className="text-sm text-gray-600">฿{item.price?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">สรุปการชำระเงิน</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>วิธีชำระเงิน:</span>
                    <span className="font-medium">{selectedOrder.payment_method === 'cod' ? 'เก็บเงินปลายทาง' : 'โอนเงิน'}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">ยอดรวมทั้งหมด:</span>
                    <span className="font-bold text-lg text-[#dc6fd6]">฿{selectedOrder.total_amount?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">เปลี่ยนสถานะออเดอร์</h3>
                  <select
                    key={`${selectedOrder.id}-${selectedOrder.status}-${forceUpdate}`}
                    value={selectedOrder.status}
                    onChange={(e) => {
                      console.log('Modal dropdown changed:', selectedOrder.id, 'to:', e.target.value);
                      handleStatusChange(selectedOrder.id, e.target.value);
                    }}
                    disabled={updatingOrderId === selectedOrder.id}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="pending">รอดำเนินการ</option>
                    <option value="processing">กำลังเตรียมสินค้า</option>
                    <option value="shipped">จัดส่งแล้ว</option>
                    <option value="delivered">จัดส่งสำเร็จ</option>
                    <option value="cancelled">ยกเลิก</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
