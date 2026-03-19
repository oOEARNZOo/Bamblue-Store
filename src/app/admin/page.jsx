"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Star,
  TrendingUp,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { AdminDashboardSkeleton } from '../components/LoadingSkeletons';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
    recentReviews: []
  });

  useEffect(() => {
    checkAdminAccess();
    fetchDashboardStats();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // ตรวจสอบว่าเป็น admin หรือไม่ (จาก user metadata หรือ email)
      const isAdminUser = user.email === 'admin@bamblue.com' ||
        user.email === 'earn.hcg32@gmail.com' ||
        user.user_metadata?.role === 'admin' ||
        user.email?.includes('admin');

      if (!isAdminUser) {
        router.push('/');
        return;
      }

      setUser(user);
      setIsAdmin(true);
    } catch (error) {
      console.error('Admin check error:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      // ดึงข้อมูลสถิติต่างๆ
      const [
        productsResult,
        ordersResult,
        reviewsResult
      ] = await Promise.all([
        // นับจำนวนสินค้า
        supabase.from('products1').select('id', { count: 'exact' }),

        // ดึงข้อมูลออเดอร์ (ใช้ result เดียว)
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),

        // ดึงรีวิวล่าสุด
        supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      // พยายามดึงจำนวนผู้ใช้ (อาจไม่ได้ใน Production ถ้าไม่มี Service Role)
      let totalUsers = 0;
      try {
        const { data: usersData } = await supabase.auth.admin.listUsers();
        totalUsers = usersData?.users?.length || 0;
      } catch (userError) {
        console.warn('Could not fetch user count (requires admin rights):', userError);
        totalUsers = 0;
      }

      // คำนวณรายได้รวม
      const { data: orders } = ordersResult;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

      setStats({
        totalProducts: productsResult.count || 0,
        totalOrders: ordersResult.data?.length || 0,
        totalUsers: totalUsers,
        totalRevenue: totalRevenue,
        recentOrders: ordersResult.data || [],
        topProducts: [], // จะเพิ่มต่อไป
        recentReviews: reviewsResult.data || []
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // ตั้งค่า default กรณีเกิด error
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        recentOrders: [],
        topProducts: [],
        recentReviews: []
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <AdminDashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // จะ redirect ไปหน้าอื่นแล้ว
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">จัดการร้านค้า Bamblue Store</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                ยินดีต้อนรับ, {user?.user_metadata?.first_name || 'Admin'}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">สินค้าทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">ออเดอร์ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">ผู้ใช้ทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">รายได้รวม</p>
                <p className="text-2xl font-bold text-gray-900">฿{stats.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <DollarSign className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">ออเดอร์ล่าสุด</h2>
            </div>
            <div className="p-6">
              {stats.recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ยังไม่มีออเดอร์</p>
              ) : (
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{order.order_number}</p>
                        <p className="text-sm text-gray-500">{order.first_name} {order.last_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">฿{order.total_amount?.toLocaleString() || 0}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                  'bg-red-100 text-red-700'
                          }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => router.push('/admin/orders')}
                className="mt-4 w-full text-center text-sm text-[#dc6fd6] hover:text-[#c05ca8] transition-colors"
              >
                ดูออเดอร์ทั้งหมด →
              </button>
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">รีวิวล่าสุด</h2>
            </div>
            <div className="p-6">
              {stats.recentReviews.length === 0 ? (
                <p className="text-gray-500 text-center py-4">ยังไม่มีรีวิว</p>
              ) : (
                <div className="space-y-4">
                  {stats.recentReviews.map((review) => (
                    <div key={review.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{review.reviewer_name}</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${review.is_approved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {review.is_approved ? 'อนุมัติ' : 'รออนุมัติ'}
                        </span>
                        <button className="text-xs text-[#dc6fd6] hover:text-[#c05ca8]">
                          จัดการ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => router.push('/admin/reviews')}
                className="mt-4 w-full text-center text-sm text-[#dc6fd6] hover:text-[#c05ca8] transition-colors"
              >
                จัดการรีวิวทั้งหมด →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">จัดการระบบ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/products')}
              className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <Package className="text-blue-600 mx-auto mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">จัดการสินค้า</p>
            </button>
            <button
              onClick={() => router.push('/admin/orders')}
              className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
            >
              <ShoppingCart className="text-green-600 mx-auto mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">จัดการออเดอร์</p>
            </button>
            <button
              onClick={() => router.push('/admin/users')}
              className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
            >
              <Users className="text-purple-600 mx-auto mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">จัดการผู้ใช้</p>
            </button>
            <button
              onClick={() => router.push('/admin/reviews')}
              className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors text-center"
            >
              <Star className="text-yellow-600 mx-auto mb-2" size={24} />
              <p className="text-sm font-medium text-gray-900">จัดการรีวิว</p>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
