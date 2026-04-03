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
  Trash2,
  Search,
  Bell,
  ShoppingBag,
  AlertTriangle,
  CheckCircle,
  TrendingDown
} from 'lucide-react';
import { AdminDashboardSkeleton } from '../components/LoadingSkeletons';

export default function AdminDashboard() {
  const router = useRouter();
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
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All types');

  useEffect(() => {
    fetchDashboardStats();
  }, []);


  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // ดึงข้อมูลสถิติต่างๆ
      const [
        productsResult,
        ordersResult,
        reviewsResult,
        allProductsResult
      ] = await Promise.all([
        // นับจำนวนสินค้า
        supabase.from('products1').select('id', { count: 'exact' }).then(res => res || { count: 0, data: null, error: null }),

        // ดึงข้อมูลออเดอร์ (ใช้ result เดียว)
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5).then(res => res || { data: [], error: null }),

        // ดึงรีวิวล่าสุด
        supabase.from('reviews').select('*').order('created_at', { ascending: false }).limit(5).then(res => res || { data: [], error: null }),

        // ดึงสินค้าทั้งหมดสำหรับแสดงในตาราง
        supabase.from('products1').select('*').order('id', { ascending: true }).limit(10).then(res => res || { data: [], error: null })
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
        totalProducts: productsResult?.count || 0,
        totalOrders: ordersResult?.data?.length || 0,
        totalUsers: totalUsers,
        totalRevenue: totalRevenue,
        recentOrders: ordersResult?.data || [],
        topProducts: [],
        recentReviews: reviewsResult?.data || []
      });
      setProducts(allProductsResult?.data || []);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <AdminDashboardSkeleton />
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search products, orders, users..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dc6fd6] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 ml-6">
                <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell size={22} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#dc6fd6] to-[#c05ca8] text-white rounded-lg hover:shadow-lg transition-all">
                  <ShoppingBag size={18} />
                  <span className="font-medium">Stock</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
            <p className="text-sm text-gray-500 mt-1">PhoneShop System / Mobiles</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Package className="text-purple-600" size={24} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Active</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Star className="text-yellow-600" size={24} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Best Sellers</p>
                <p className="text-3xl font-bold text-gray-900">1</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Low Stock</p>
                <p className="text-3xl font-bold text-gray-900">1</p>
              </div>
            </div>
          </div>

        {/* Product Table */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dc6fd6] focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                  <button className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-[#dc6fd6] to-[#c05ca8] rounded-md">All types</button>
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">Best Seller</button>
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">Premium</button>
                  <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">Top Rated</button>
                </div>
                <button 
                  onClick={() => router.push('/admin/products')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#dc6fd6] to-[#c05ca8] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                >
                  <Package size={18} />
                  <span>Create Product</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Brand</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Color</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Units</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      ไม่มีสินค้าในระบบ
                    </td>
                  </tr>
                ) : (
                  products.filter(product => 
                    product.nameEN?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    product.nameTH?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.nameEN}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="text-gray-400" size={20} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{product.nameEN}</p>
                            <p className="text-xs text-gray-500">{product.nameTH || 'Unknown'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{product.category || 'Bamblue'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-gray-900 rounded-full border-2 border-gray-300"></div>
                          <span className="text-sm text-gray-600">–</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">฿{product.price?.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{product.stock || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-purple-600 font-medium">Trending</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => router.push(`/admin/products`)}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
      </div>
    </>
  );
}
