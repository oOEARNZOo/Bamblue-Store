"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/frontend/services/supabaseClient';
import Link from 'next/link';
import { Package, Clock, Truck, CheckCircle, XCircle, ChevronRight, ShoppingBag, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { OrderListSkeleton, LoadingSpinner } from '@/frontend/components/LoadingSkeletons';

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      // ตรวจสอบว่าล็อกอินหรือยัง
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        setError('กรุณาเข้าสู่ระบบเพื่อดูประวัติการสั่งซื้อ');
        setIsLoading(false);
        return;
      }

      // ดึงข้อมูล orders ของ user
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      setOrders(ordersData || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์');
    } finally {
      setIsLoading(false);
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
        label: 'ยกเลิกแล้ว',
        icon: XCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200'
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ประวัติการสั่งซื้อ</h1>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
          <OrderListSkeleton count={3} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="text-center max-w-md">
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/login"
            className="inline-block bg-[#dc6fd6] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#c05ca8] transition-colors"
          >
            ไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ประวัติการสั่งซื้อ</h1>
          <p className="text-gray-600">ดูและจัดการคำสั่งซื้อทั้งหมดของคุณ</p>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">ยังไม่มีประวัติการสั่งซื้อ</h3>
            <p className="text-gray-600 mb-6">เริ่มช้อปปิ้งกับเราวันนี้!</p>
            <Link 
              href="/products"
              className="inline-block bg-[#dc6fd6] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#c05ca8] transition-colors"
            >
              เริ่มช้อปปิ้ง
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div 
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {order.order_number}
                          </h3>
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}>
                            <StatusIcon size={14} />
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          สั่งซื้อเมื่อ {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-sm text-gray-500 mb-1">ยอดชำระทั้งหมด</p>
                        <p className="text-2xl font-bold text-[#dc6fd6]">
                          ฿{Number(order.total).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.order_items?.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <img 
                            src={item.product_image} 
                            alt={item.product_name_en}
                            className="w-16 h-20 object-cover rounded bg-gray-100"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {item.product_name_en}
                            </h4>
                            <p className="text-xs text-gray-500">{item.product_name_th}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              ไซส์ {item.size} × {item.quantity}
                            </p>
                            {/* ปุ่มรีวิวสินค้า - แสดงเฉพาะเมื่อจัดส่งสำเร็จ */}
                            {order.status === 'delivered' && (
                              <button
                                onClick={() => router.push(`/product/${item.product_id}#reviews`)}
                                className="flex items-center gap-1 text-xs text-[#dc6fd6] hover:text-[#c05ca8] mt-2 font-medium transition-colors"
                              >
                                <Star size={12} />
                                รีวิวสินค้า
                              </button>
                            )}
                          </div>
                          <p className="font-semibold text-gray-900">
                            ฿{(Number(item.price) * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                      
                      {order.order_items?.length > 3 && (
                        <p className="text-sm text-gray-500 text-center pt-2 border-t">
                          และอีก {order.order_items.length - 3} รายการ
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">จัดส่งไปที่:</span> {order.shipping_address}, {order.shipping_province} {order.shipping_zipcode}
                    </div>
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="text-sm font-semibold text-[#dc6fd6] hover:text-[#c05ca8] flex items-center gap-1 transition-colors"
                    >
                      {selectedOrder?.id === order.id ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียด'}
                      <ChevronRight size={16} className={`transition-transform ${selectedOrder?.id === order.id ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {selectedOrder?.id === order.id && (
                    <div className="px-6 py-6 border-t border-gray-100 bg-gray-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">ข้อมูลการจัดส่ง</h4>
                          <div className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-medium">ชื่อผู้รับ:</span> {order.first_name} {order.last_name}</p>
                            <p><span className="font-medium">เบอร์โทร:</span> {order.phone}</p>
                            <p><span className="font-medium">อีเมล:</span> {order.email}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">สรุปยอดชำระ</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">ยอดรวมสินค้า</span>
                              <span className="font-medium">฿{Number(order.subtotal).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">ค่าจัดส่ง</span>
                              <span className="font-medium">฿{Number(order.shipping_fee).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-200">
                              <span className="font-semibold">รวมทั้งหมด</span>
                              <span className="font-bold text-[#dc6fd6]">฿{Number(order.total).toLocaleString()}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-500">
                                ชำระเงินผ่าน: {order.payment_method === 'credit' ? 'บัตรเครดิต/เดบิต' : order.payment_method === 'qr' ? 'QR Code' : 'เก็บเงินปลายทาง'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
