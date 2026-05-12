"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/frontend/services/supabaseClient';
import {
  Package,
  ShoppingCart,
  Star,
  DollarSign,
  Search,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { AdminDashboardSkeleton } from '@/frontend/components/LoadingSkeletons';

const ADMIN_DASHBOARD_ORDER_COLUMNS = 'id, order_number, first_name, last_name, status, total, user_id, created_at';
const ADMIN_DASHBOARD_REVIEW_COLUMNS = 'id, reviewer_name, rating, comment, is_approved, created_at';
const ADMIN_DASHBOARD_PRODUCT_COLUMNS = 'id, nameEN, nameTH, category, price, image, stock, size_stock';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    lowStockCount: 0,
    soldOutCount: 0,
    pendingPaymentCount: 0,
    pendingReviewCount: 0,
    unitsSold: 0,
    recentOrders: [],
    topProducts: [],
    recentReviews: []
  });
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('low_stock');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const getProductStock = (product) => {
    const sizeStock = product?.size_stock;
    if (sizeStock && typeof sizeStock === 'object') {
      return Object.values(sizeStock).reduce((sum, value) => sum + Number(value || 0), 0);
    }

    return Number(product?.stock || 0);
  };

  const getStockBySizeText = (product) => {
    const sizeStock = product?.size_stock;
    if (!sizeStock || typeof sizeStock !== 'object') return '-';

    return Object.entries(sizeStock)
      .filter(([, value]) => Number(value || 0) > 0)
      .map(([size, value]) => `${size}: ${value}`)
      .join(' / ') || '-';
  };

  const isLowStock = (product) => {
    const sizeStock = product?.size_stock;
    if (sizeStock && typeof sizeStock === 'object') {
      return Object.values(sizeStock).some(value => {
        const stock = Number(value || 0);
        return stock > 0 && stock <= 5;
      });
    }

    const stock = getProductStock(product);
    return stock > 0 && stock <= 5;
  };

  const getProductType = (product) => {
    if (product?.discount_percent > 0) return 'Sale';
    if (product?.is_new) return 'New';
    return 'Regular';
  };

  const getOrderTotal = (order) => {
    return Number(order?.total || 0);
  };

  const stockFilters = [
    { value: 'all', label: 'All' },
    { value: 'in_stock', label: 'In stock' },
    { value: 'low_stock', label: 'Low stock' },
    { value: 'sold_out', label: 'Sold out' }
  ];

  const getOrderStatusStyle = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      pending_payment_verification: 'bg-orange-100 text-orange-700',
      paid: 'bg-emerald-100 text-emerald-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };

    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getOrderStatusLabel = (status) => {
    const labels = {
      pending: 'รอดำเนินการ',
      pending_payment_verification: 'รอตรวจชำระเงิน',
      paid: 'ชำระแล้ว',
      processing: 'เตรียมสินค้า',
      shipped: 'จัดส่งแล้ว',
      delivered: 'สำเร็จ',
      cancelled: 'ยกเลิก'
    };

    return labels[status] || status;
  };

  const matchesStockFilter = (product) => {
    const stock = getProductStock(product);

    if (filterType === 'in_stock') return stock > 0;
    if (filterType === 'low_stock') return isLowStock(product);
    if (filterType === 'sold_out') return stock <= 0;

    return true;
  };

  const filteredProducts = products.filter(product => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query ||
      product.nameEN?.toLowerCase().includes(query) ||
      product.nameTH?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query);

    return matchesSearch && matchesStockFilter(product);
  });

  const stockAlertProducts = products
    .filter(product => isLowStock(product) || getProductStock(product) <= 0)
    .slice(0, 5);

  const quickActions = [
    {
      label: 'รอตรวจชำระเงิน',
      value: stats.pendingPaymentCount,
      helper: 'ออเดอร์ที่ลูกค้าแนบหลักฐานแล้ว',
      icon: DollarSign,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      path: '/admin/orders'
    },
    {
      label: 'สินค้าใกล้หมด',
      value: stats.lowStockCount,
      helper: 'ไซส์ใดไซส์หนึ่งเหลือ 1-5 ตัว',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      path: '/admin/products'
    },
    {
      label: 'สินค้าหมดสต็อก',
      value: stats.soldOutCount,
      helper: 'ควรเติมสต็อกหรือซ่อนสินค้า',
      icon: Package,
      color: 'text-gray-700',
      bg: 'bg-gray-100',
      path: '/admin/products'
    },
    {
      label: 'รีวิวรอจัดการ',
      value: stats.pendingReviewCount,
      helper: 'รีวิวที่ยังไม่ได้อนุมัติ',
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      path: '/admin/reviews'
    }
  ];

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // ดึงข้อมูลสถิติต่างๆ
      const [
        productsResult,
        ordersResult,
        reviewsResult,
        orderItemsResult,
        allProductsResult
      ] = await Promise.all([
        // นับจำนวนสินค้า
        supabase.from('products1').select('id', { count: 'exact' }).then(res => res || { count: 0, data: null, error: null }),

        // ดึงข้อมูลออเดอร์ (ใช้ result เดียว)
        supabase.from('orders').select(ADMIN_DASHBOARD_ORDER_COLUMNS).order('created_at', { ascending: false }).then(res => res || { data: [], error: null }),

        // ดึงรีวิวล่าสุด
        supabase.from('reviews').select(ADMIN_DASHBOARD_REVIEW_COLUMNS).order('created_at', { ascending: false }).then(res => res || { data: [], error: null }),

        supabase.from('order_items').select('quantity').then(res => res || { data: [], error: null }),

        // ดึงสินค้าทั้งหมดสำหรับแสดงในตาราง
        supabase.from('products1').select(ADMIN_DASHBOARD_PRODUCT_COLUMNS).order('id', { ascending: true }).then(res => res || { data: [], error: null })
      ]);

      // พยายามดึงจำนวนผู้ใช้ (อาจไม่ได้ใน Production ถ้าไม่มี Service Role)
      const orders = ordersResult?.data || [];
      const allProducts = allProductsResult?.data || [];
      const reviews = reviewsResult?.data || [];
      const totalUsers = new Set(orders.map(order => order.user_id).filter(Boolean)).size;
      const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
      const unitsSold = (orderItemsResult?.data || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      const lowStockCount = allProducts.filter(product => isLowStock(product)).length;
      const soldOutCount = allProducts.filter(product => getProductStock(product) <= 0).length;
      const pendingPaymentCount = orders.filter(order => order.status === 'pending_payment_verification').length;
      const pendingReviewCount = reviews.filter(review => review.is_approved !== true).length;

      // คำนวณรายได้รวม
      setStats({
        totalProducts: productsResult?.count || 0,
        totalOrders: ordersResult?.data?.length || 0,
        totalUsers: totalUsers,
        totalRevenue: totalRevenue,
        lowStockCount,
        soldOutCount,
        pendingPaymentCount,
        pendingReviewCount,
        unitsSold,
        recentOrders: orders.slice(0, 5),
        topProducts: [],
        recentReviews: reviews.slice(0, 5)
      });
      setProducts(allProducts);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // ตั้งค่า default กรณีเกิด error
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalRevenue: 0,
        lowStockCount: 0,
        soldOutCount: 0,
        pendingPaymentCount: 0,
        pendingReviewCount: 0,
        unitsSold: 0,
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium text-[#dc6fd6]">Admin Dashboard</p>
              <h1 className="text-2xl font-bold text-gray-900">ภาพรวมร้าน Bamblue</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => router.push('/admin/orders')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <ShoppingCart size={18} />
                <span>จัดการออเดอร์</span>
              </button>
              <button
                onClick={() => router.push('/admin/products')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#dc6fd6] to-[#c05ca8] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
              >
                <Package size={18} />
                <span>จัดการสินค้า</span>
              </button>
            </div>
          </div>
        </div>
      </header>

        <div className="p-6">
          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">งานที่ควรจัดการก่อน</h2>
            <p className="text-sm text-gray-500 mt-1">รวมสถานะที่ต้องตรวจทุกวันไว้ในหน้าเดียว</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {quickActions.map((action) => {
              const ActionIcon = action.icon;

              return (
                <button
                  key={action.label}
                  onClick={() => router.push(action.path)}
                  className="bg-white rounded-xl shadow-sm p-6 border hover:shadow-md transition-shadow text-left"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${action.bg} rounded-lg flex items-center justify-center`}>
                      <ActionIcon className={action.color} size={24} />
                    </div>
                    <span className="text-xs font-medium text-gray-400">ดูรายละเอียด</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{action.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{action.value}</p>
                  <p className="text-xs text-gray-500 mt-2">{action.helper}</p>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <DollarSign className="text-green-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">รายได้รวม</p>
                  <p className="text-lg font-bold text-gray-900">฿{stats.totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <ShoppingCart className="text-blue-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">ออเดอร์ทั้งหมด</p>
                  <p className="text-lg font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Package className="text-purple-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">สินค้าทั้งหมด</p>
                  <p className="text-lg font-bold text-gray-900">{stats.totalProducts}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <CheckCircle className="text-yellow-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">ยอดขายสินค้า</p>
                  <p className="text-lg font-bold text-gray-900">{stats.unitsSold}</p>
                </div>
              </div>
            </div>
          </div>

        {/* Product Table */}
        <div className="bg-white rounded-xl shadow-sm border mb-8">
          <div className="p-6 border-b">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="max-w-lg">
                <h2 className="text-lg font-semibold text-gray-900">Stock Monitor</h2>
                <p className="text-sm text-gray-500 mt-1">เริ่มต้นที่สินค้าใกล้หมดเพื่อให้เติมสต็อกได้ทัน ({stockAlertProducts.length} รายการที่ควรตรวจ)</p>
              </div>
              <div className="flex w-full flex-col gap-3 xl:w-auto xl:flex-row xl:items-start">
                <div className="relative w-full xl:w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="ค้นหาสินค้า..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#dc6fd6] focus:border-transparent text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-50 p-1 sm:flex sm:items-center">
                  {stockFilters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setFilterType(filter.value)}
                      className={`min-w-[92px] rounded-md px-3 py-2 text-sm font-semibold transition-colors ${filterType === filter.value
                        ? 'bg-gradient-to-r from-[#dc6fd6] to-[#c05ca8] text-white shadow-sm'
                        : 'text-gray-600 hover:bg-white hover:text-gray-900'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock by Size</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Units</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      ไม่มีสินค้าในระบบ
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
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
                          <span className="text-sm text-gray-600">{getStockBySizeText(product)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">฿{product.price?.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{getProductStock(product)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-purple-600 font-medium">{getProductType(product)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getProductStock(product) > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getProductStock(product) > 0 ? 'bg-green-600' : 'bg-red-600'}`}></span>
                          {getProductStock(product) > 0 ? 'Active' : 'Sold out'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => router.push(`/admin/products`)}
                            className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium"
                          >
                            จัดการ
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
                        <p className="font-medium text-gray-900">฿{getOrderTotal(order).toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getOrderStatusStyle(order.status)}`}>
                          {getOrderStatusLabel(order.status)}
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
                        <button
                          onClick={() => router.push('/admin/reviews')}
                          className="text-xs text-[#dc6fd6] hover:text-[#c05ca8]"
                        >
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
