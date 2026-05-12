"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/frontend/services/supabaseClient';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  X,
  Upload,
  ArrowLeft
} from 'lucide-react';
import { ProductGridSkeleton } from '@/frontend/components/LoadingSkeletons';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Default form data เพื่อใช้ reset และป้องกัน undefined
const DEFAULT_FORM_DATA = {
  nameEN: '',
  nameTH: '',
  price: '',
  category: 'shirt',
  image: '',
  images: [],
  stock: 99,
  is_new: false,
  discount_percent: 0,
  original_price: '',
  size_stock: { S: 0, M: 0, L: 0, XL: 0 }
};

export default function ProductManagementPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [formData, setFormData] = useState({ ...DEFAULT_FORM_DATA });
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products1')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // คำนวณ stock รวมจาก size_stock อัตโนมัติ
      const sizeStock = formData.size_stock || { S: 0, M: 0, L: 0, XL: 0 };
      const totalStock = Object.values(sizeStock).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
      
      const productData = {
        nameEN: formData.nameEN,
        nameTH: formData.nameTH,
        price: parseFloat(formData.price),
        category: formData.category,
        image: formData.images[0] || formData.image,
        images: formData.images,
        stock: totalStock,
        is_new: formData.is_new,
        discount_percent: parseInt(formData.discount_percent) || 0,
        original_price: formData.discount_percent > 0 ? parseFloat(formData.original_price) || parseFloat(formData.price) : null,
        size_stock: formData.size_stock
      };

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products1')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('แก้ไขสินค้าสำเร็จ!', {
          duration: 3000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        });
      } else {
        // Insert new product
        const { error } = await supabase
          .from('products1')
          .insert([productData]);

        if (error) throw error;
        toast.success('เพิ่มสินค้าสำเร็จ!', {
          duration: 3000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        });
      }

      // Reset and refresh
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ ...DEFAULT_FORM_DATA });
      setNewImageUrl('');
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('เกิดข้อผิดพลาด: ' + error.message, {
        duration: 4000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      nameEN: product.nameEN || '',
      nameTH: product.nameTH || '',
      price: product.price || '',
      category: product.category || 'shirt',
      image: product.image || '',
      images: product.images || (product.image ? [product.image] : []),
      stock: product.stock ?? 99,
      is_new: product.is_new || false,
      discount_percent: product.discount_percent || 0,
      original_price: product.original_price || product.price || '',
      size_stock: product.size_stock || { S: 0, M: 0, L: 0, XL: 0 }
    });
    setNewImageUrl('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id, productName) => {
    // ป้องกันการแสดง toast ซ้ำกับสินค้าเดิม
    if (deletingProductId === id) return;
    
    // ตั้งค่า state ว่ากำลังแสดง confirmation ของสินค้านี้
    setDeletingProductId(id);
    
    // แสดง toast ยืนยันการลบ
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div>
          <p className="font-semibold text-gray-900">ยืนยันการลบสินค้า</p>
          <p className="text-sm text-gray-600 mt-1">คุณแน่ใจหรือไม่ว่าต้องการลบ "{productName}"?</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const { error } = await supabase
                  .from('products1')
                  .delete()
                  .eq('id', id);

                if (error) throw error;
                
                toast.success('ลบสินค้าสำเร็จ!', {
                  duration: 3000,
                  style: {
                    background: '#10b981',
                    color: '#fff',
                  },
                });
                fetchProducts();
              } catch (error) {
                console.error('Error deleting product:', error);
                toast.error('เกิดข้อผิดพลาด: ' + error.message, {
                  duration: 4000,
                  style: {
                    background: '#ef4444',
                    color: '#fff',
                  },
                });
              } finally {
                // Reset state เมื่อเสร็จสิ้น
                setDeletingProductId(null);
              }
            }}
            className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            ลบ
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              // Reset state เมื่อยกเลิก
              setDeletingProductId(null);
            }}
            className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      style: {
        background: '#fff',
        color: '#000',
        padding: '16px',
        maxWidth: '400px',
      },
    });
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ ...DEFAULT_FORM_DATA });
    setNewImageUrl('');
    setIsModalOpen(true);
  };

  const filteredProducts = products.filter(product => {
    const matchCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchSearch = !searchQuery || 
      product.nameEN?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameTH?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <ProductGridSkeleton count={8} />
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
                <h1 className="text-2xl font-bold text-gray-900">จัดการสินค้า</h1>
                <p className="text-sm text-gray-500">เพิ่ม แก้ไข และลบสินค้าในร้าน</p>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-[#dc6fd6] text-white px-4 py-2 rounded-lg hover:bg-[#c05ca8] transition-colors"
            >
              <Plus size={20} />
              เพิ่มสินค้าใหม่
            </button>
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
              placeholder="ค้นหาสินค้า..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none"
          >
            <option value="all">ทุกหมวดหมู่</option>
            <option value="shirt">เสื้อ</option>
            <option value="dress">เดรส</option>
            <option value="set">ชุดเซ็ต</option>
          </select>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="text-[#dc6fd6]" size={20} />
              <span className="text-gray-600">พบสินค้า</span>
              <span className="font-bold text-gray-900">{filteredProducts.length}</span>
              <span className="text-gray-600">รายการ</span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Package className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">ไม่พบสินค้า</p>
            <p className="text-gray-400 text-sm mt-2">ลองค้นหาด้วยคำอื่น หรือเพิ่มสินค้าใหม่</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-[3/4] bg-gray-100 relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.nameEN}
                    className={`w-full h-full object-cover ${product.stock === 0 ? 'opacity-50' : ''}`}
                  />
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.is_new && (
                      <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                    {product.discount_percent > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        -{product.discount_percent}%
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="bg-gray-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        หมด
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.nameEN}</h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-1">{product.nameTH}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {product.discount_percent > 0 ? (
                        <div className="flex items-center gap-1">
                          <p className="text-sm text-gray-400 line-through">
                            ฿{(product.original_price || product.price)?.toLocaleString()}
                          </p>
                          <p className="text-lg font-bold text-red-500">
                            ฿{Math.round(product.price * (1 - product.discount_percent / 100)).toLocaleString()}
                          </p>
                        </div>
                      ) : (
                        <p className="text-lg font-bold text-[#dc6fd6]">
                          ฿{product.price?.toLocaleString() || 0}
                        </p>
                      )}
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100 transition-colors text-sm"
                    >
                      <Edit size={16} />
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDelete(product.id, product.nameEN)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 transition-colors text-sm"
                    >
                      <Trash2 size={16} />
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && formData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อสินค้า (EN) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameEN}
                  onChange={(e) => setFormData({ ...formData, nameEN: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none"
                  placeholder="Basic White T-Shirt"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อสินค้า (TH) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nameTH}
                  onChange={(e) => setFormData({ ...formData, nameTH: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none"
                  placeholder="เสื้อยืดขาวเบสิค"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ราคา (บาท) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none"
                    placeholder="399"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    หมวดหมู่ *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none"
                  >
                    <option value="shirt">เสื้อ</option>
                    <option value="dress">เดรส</option>
                    <option value="set">ชุดเซ็ต</option>
                  </select>
                </div>
              </div>

              {/* 📦 ส่วนจัดการ Stock, Badges, Discount */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <h3 className="font-semibold text-gray-800 text-sm">จัดการสต็อกและโปรโมชั่น</h3>
                
                {/* 👕 Size Stock - จำนวนสต็อกของแต่ละไซส์ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จำนวนสต็อกแต่ละไซส์
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {['S', 'M', 'L', 'XL'].map((size) => (
                      <div key={size}>
                        <label className="block text-xs text-gray-600 mb-1 font-semibold text-center">
                          {size}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.size_stock?.[size] ?? 0}
                          onChange={(e) => {
                            const currentSizeStock = formData.size_stock || { S: 0, M: 0, L: 0, XL: 0 };
                            setFormData({ 
                              ...formData, 
                              size_stock: { 
                                ...currentSizeStock, 
                                [size]: parseInt(e.target.value) || 0 
                              }
                            });
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none text-center"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 สต็อกรวม: {Object.values(formData.size_stock || { S: 0, M: 0, L: 0, XL: 0 }).reduce((sum, val) => sum + (parseInt(val) || 0), 0)} ตัว
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">

                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ส่วนลด (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount_percent}
                      onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Original Price (แสดงเมื่อมีส่วนลด) */}
                {formData.discount_percent > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ราคาเดิม (ก่อนลด)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.original_price}
                      onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none"
                      placeholder={formData.price || 'ราคาเดิม'}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ราคาหลังลด: ฿{formData.price ? Math.round(formData.price * (1 - formData.discount_percent / 100)).toLocaleString() : 0}
                    </p>
                  </div>
                )}

                {/* Is New Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">สินค้าใหม่</label>
                    <p className="text-xs text-gray-500">แสดง badge "NEW" บนสินค้า</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_new: !formData.is_new })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${formData.is_new ? 'bg-emerald-500' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.is_new ? 'left-7' : 'left-1'}`}></span>
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, size_stock: { S: 10, M: 25, L: 15, XL: 5 } })}
                    className="text-xs px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    ตั้งสต็อกแต่ละไซส์ (default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, size_stock: { S: 0, M: 0, L: 0, XL: 0 } })}
                    className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    ล้างสต็อกทุกไซส์
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, discount_percent: 0, original_price: '' })}
                    className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    ยกเลิกส่วนลด
                  </button>
                </div>
              </div>

              {/* ส่วนจัดการรูปภาพหลายรูป */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รูปภาพสินค้า ({formData.images.length} รูป) *
                </label>
                
                {/* แสดงรูปภาพที่เพิ่มแล้ว */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Product ${index + 1}`}
                          className={`w-full h-24 object-cover rounded-lg border-2 ${index === 0 ? 'border-[#dc6fd6]' : 'border-gray-200'}`}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=Error';
                          }}
                        />
                        {index === 0 && (
                          <span className="absolute top-1 left-1 bg-[#dc6fd6] text-white text-[10px] px-1.5 py-0.5 rounded">
                            หลัก
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = formData.images.filter((_, i) => i !== index);
                            setFormData({ ...formData, images: newImages });
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...formData.images];
                              [newImages[0], newImages[index]] = [newImages[index], newImages[0]];
                              setFormData({ ...formData, images: newImages });
                            }}
                            className="absolute bottom-1 left-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ตั้งเป็นหลัก
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ช่องเพิ่มรูปภาพใหม่ */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#dc6fd6] focus:border-[#dc6fd6] outline-none"
                    placeholder="วาง URL รูปภาพที่นี่..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newImageUrl.trim()) {
                        setFormData({ 
                          ...formData, 
                          images: [...formData.images, newImageUrl.trim()] 
                        });
                        setNewImageUrl('');
                      }
                    }}
                    disabled={!newImageUrl.trim()}
                    className="px-4 py-2 bg-[#dc6fd6] text-white rounded-lg hover:bg-[#c05ca8] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Plus size={16} />
                    เพิ่ม
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  รูปแรกจะเป็นรูปหลักที่แสดงในหน้าสินค้า (ต้องมีอย่างน้อย 1 รูป)
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#dc6fd6] text-white rounded-lg hover:bg-[#c05ca8] transition-colors"
                >
                  {editingProduct ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
