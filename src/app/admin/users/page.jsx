"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/frontend/services/supabaseClient';
import { checkIsAdminCached } from '@/frontend/auth/adminCheck';
import {
  Users,
  Search,
  Eye,
  ArrowLeft,
  Mail,
  Calendar,
  ShoppingCart,
  Shield,
  UserX,
  Ban,
  X
} from 'lucide-react';
import { OrderListSkeleton } from '@/frontend/components/LoadingSkeletons';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      const hasAccess = await checkAdminAccess();
      if (hasAccess) {
        fetchUsers();
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // ใช้ admin.listUsers จาก service role แต่ตอนนี้ใช้ข้อมูลจาก orders แทน
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          user_id,
          email,
          first_name,
          last_name,
          phone,
          total,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // จัดกลุ่มข้อมูลผู้ใช้และนับจำนวนออเดอร์
      const userMap = new Map();
      orders.forEach(order => {
        const userId = order.user_id;
        if (!userMap.has(userId)) {
          userMap.set(userId, {
            id: userId,
            email: order.email,
            firstName: order.first_name,
            lastName: order.last_name,
            phone: order.phone,
            createdAt: order.created_at,
            orderCount: 0,
            totalSpent: 0
          });
        }
        const user = userMap.get(userId);
        user.orderCount += 1;
        user.totalSpent += Number(order.total || 0);
      });

      // คำนวณยอดรวมที่ใช้
      setUsers(Array.from(userMap.values()));
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้', {
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

  const fetchUserOrders = async (userId) => {
    try {
      setLoadingOrders(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserOrders(data || []);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์', {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  // 🎯 ฟังก์ชันคำนวณ Customer Tier
  const getCustomerTier = (totalSpent, orderCount) => {
    if (totalSpent >= 10000 || orderCount >= 10) return { tier: 'VIP', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' };
    if (totalSpent >= 5000 || orderCount >= 5) return { tier: 'Gold', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    if (orderCount >= 1) return { tier: 'Silver', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    return { tier: 'New', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
  };

  const getOrderTotal = (order) => {
    return Number(order?.total || 0);
  };

  // 📅 ฟังก์ชันคำนวณวันที่ซื้อครั้งล่าสุด
  const getLastOrderDate = (orders) => {
    if (orders.length === 0) return null;
    return new Date(orders[0].created_at).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ⏰ ฟังก์ชันคำนวณวันที่ผ่านมาจากการซื้อครั้งล่าสุด
  const getDaysSinceLastOrder = (orders) => {
    if (orders.length === 0) return null;
    const lastOrderDate = new Date(orders[0].created_at);
    const today = new Date();
    const diffTime = Math.abs(today - lastOrderDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 💳 ฟังก์ชันหาวิธีการชำระเงินที่ใช้บ่อยที่สุด
  const getPreferredPaymentMethod = (orders) => {
    if (orders.length === 0) return null;
    const paymentMethods = {};
    orders.forEach(order => {
      const method = order.payment_method;
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });
    const mostUsed = Object.entries(paymentMethods).sort((a, b) => b[1] - a[1])[0]?.[0];

    const methodNames = {
      'qr': 'สแกนจ่าย (PromptPay)',
      'cod': 'เก็บเงินปลายทาง'
    };

    return methodNames[mostUsed] || mostUsed;
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    fetchUserOrders(user.id);
  };

  const filteredUsers = users.filter(user => {
    const matchSearch = !searchQuery ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        label: 'รอดำเนินการ',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200'
      },
      processing: {
        label: 'กำลังเตรียมสินค้า',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
      },
      shipped: {
        label: 'จัดส่งแล้ว',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200'
      },
      delivered: {
        label: 'จัดส่งสำเร็จ',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200'
      },
      cancelled: {
        label: 'ยกเลิก',
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-200'
      }
    };
    return configs[status] || configs.pending;
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
                <h1 className="text-2xl font-bold text-gray-900">จัดการผู้ใช้</h1>
                <p className="text-sm text-gray-500">ดูข้อมูลและประวัติการสั่งซื้อของผู้ใช้ทั้งหมด</p>
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
              placeholder="ค้นหาอีเมล, ชื่อลูกค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="text-[#dc6fd6]" size={20} />
              <span className="text-gray-600">พบผู้ใช้</span>
              <span className="font-bold text-gray-900">{filteredUsers.length}</span>
              <span className="text-gray-600">รายการ</span>
            </div>
            <div className="text-sm text-gray-500">
              ยอดรวมทั้งหมด: <span className="font-bold text-gray-900">
                ฿{filteredUsers.reduce((sum, user) => sum + (user.totalSpent || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Users List */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Users className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">ไม่พบผู้ใช้</p>
            <p className="text-gray-400 text-sm mt-2">ลองค้นหาด้วยคำอื่น</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const tierConfig = getCustomerTier(user.totalSpent, user.orderCount);
              return (
                <div key={user.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#dc6fd6] rounded-full flex items-center justify-center text-white font-bold">
                          {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {user.firstName} {user.lastName}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${tierConfig.bg} ${tierConfig.color} ${tierConfig.border} border`}>
                              {tierConfig.tier}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p className="flex items-center gap-1">
                              <Mail size={14} />
                              {user.email}
                            </p>
                            <p className="flex items-center gap-1">
                              <Calendar size={14} />
                              สมัครเมื่อ {formatDate(user.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-2">
                          <p>สั่งซื้อ <span className="font-bold text-gray-900">{user.orderCount}</span> ครั้ง</p>
                          <p>ใช้จ่าย <span className="font-bold text-[#dc6fd6]">฿{user.totalSpent?.toLocaleString() || 0}</span></p>
                        </div>
                        <button
                          onClick={() => viewUserDetails(user)}
                          className="flex items-center gap-1 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                        >
                          <Eye size={16} />
                          ดูรายละเอียด
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">รายละเอียดผู้ใช้</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">ข้อมูลส่วนตัว</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p><span className="font-medium">ชื่อ:</span> {selectedUser.firstName} {selectedUser.lastName}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCustomerTier(selectedUser.totalSpent, selectedUser.orderCount).bg} ${getCustomerTier(selectedUser.totalSpent, selectedUser.orderCount).color} ${getCustomerTier(selectedUser.totalSpent, selectedUser.orderCount).border} border`}>
                      {getCustomerTier(selectedUser.totalSpent, selectedUser.orderCount).tier}
                    </span>
                  </div>
                  <p><span className="font-medium">อีเมล:</span> {selectedUser.email}</p>
                  <p><span className="font-medium">เบอร์โทร:</span> {selectedUser.phone || 'ไม่ระบุ'}</p>
                  <p><span className="font-medium">สมัครเมื่อ:</span> {formatDate(selectedUser.createdAt)}</p>
                  <p><span className="font-medium">ซื้อครั้งล่าสุด:</span> {getLastOrderDate(userOrders) || 'ยังไม่เคยสั่งซื้อ'}</p>
                  <p><span className="font-medium">วิธีชำระที่ใช้บ่อย:</span> {getPreferredPaymentMethod(userOrders) || 'ไม่มีข้อมูล'}</p>
                </div>
              </div>

              {/* User Stats */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">สถิติการสั่งซื้อ</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <ShoppingCart className="mx-auto text-blue-600 mb-2" size={24} />
                    <p className="text-2xl font-bold text-blue-600">{selectedUser.orderCount}</p>
                    <p className="text-sm text-gray-600">จำนวนออเดอร์</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <span className="text-2xl font-bold text-green-600">฿{selectedUser.totalSpent?.toLocaleString() || 0}</span>
                    <p className="text-sm text-gray-600">ยอดรวมทั้งหมด</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <span className="text-2xl font-bold text-purple-600">
                      ฿{selectedUser.orderCount > 0 ? Math.round(selectedUser.totalSpent / selectedUser.orderCount).toLocaleString() : 0}
                    </span>
                    <p className="text-sm text-gray-600">ยอดเฉลี่ยต่อออเดอร์</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center">
                    <span className="text-2xl font-bold text-orange-600">
                      {getDaysSinceLastOrder(userOrders) || '-'}
                    </span>
                    <p className="text-sm text-gray-600">วันที่ผ่านมา</p>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">ประวัติการสั่งซื้อ</h3>
                {loadingOrders ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <ShoppingCart className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-gray-500">ไม่มีประวัติการสั่งซื้อ</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userOrders.map((order) => {
                      const statusConfig = getStatusConfig(order.status);
                      return (
                        <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{order.order_number}</p>
                              <p className="text-sm text-gray-600">
                                {formatDate(order.created_at)} • {order.order_items?.length || 0} รายการ
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-[#dc6fd6]">฿{getOrderTotal(order).toLocaleString()}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} border`}>
                                {statusConfig.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
