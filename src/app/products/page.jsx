"use client";
import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { supabase } from '../../lib/supabase';
import { useSearchParams } from 'next/navigation';
import { Heart, ShoppingCart } from 'lucide-react';
import {
    ProductGridSkeleton,
    CategoryFilterSkeleton,
    LoadingSpinner
} from '../components/LoadingSkeletons';
import { ProductImage } from '../components/OptimizedImage';

// 📦 1. แยกเนื้อหาที่ใช้ useSearchParams มาไว้ใน Component ย่อย
function ProductsContent() {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [activeCategory, setActiveCategory] = useState('all');
    const [confirmRemove, setConfirmRemove] = useState(null);

    // useCallback เพื่อ optimize - ไม่สร้างฟังก์ชันใหม่ทุกครั้งที่ re-render
    const handleWishlistClick = useCallback((e, product) => {
        e.stopPropagation();
        e.preventDefault();
        if (isInWishlist(product.id)) {
            setConfirmRemove(product.id);
        } else {
            addToWishlist(product);
        }
    }, [isInWishlist, addToWishlist]);

    const confirmRemoveWishlist = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        if (confirmRemove) {
            removeFromWishlist(confirmRemove);
            setConfirmRemove(null);
        }
    }, [confirmRemove, removeFromWishlist]);

    // สร้าง State มารับข้อมูลสินค้าจาก Supabase และ State สำหรับ Loading
    const [productsData, setProductsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const searchParams = useSearchParams();
    const searchQuery = searchParams ? searchParams.get('search') : null;
    const categoryParam = searchParams ? searchParams.get('category') : null;

    // ตั้งค่า activeCategory จาก URL parameter
    useEffect(() => {
        if (categoryParam && ['shirt', 'dress', 'set'].includes(categoryParam)) {
            setActiveCategory(categoryParam);
        } else if (!categoryParam) {
            // ถ้าไม่มี category parameter ให้แสดงทั้งหมด
            setActiveCategory('all');
        }
    }, [categoryParam]);

    useEffect(() => {
        async function fetchProducts() {
            // ดึงข้อมูลจากตาราง products1 ของคุณ
            const { data, error } = await supabase
                .from('products1')
                .select('*');

            if (error) {
                console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
            } else {
                setProductsData(data); // เอาข้อมูลที่ดึงได้มาใส่ใน State
            }
            setIsLoading(false); // ปิดสถานะ Loading เมื่อดึงข้อมูลเสร็จ
        }

        fetchProducts();
    }, []);

    // useMemo เพื่อ optimize - ไม่คำนวณใหม่ถ้า dependencies ไม่เปลี่ยน
    const filteredProducts = useMemo(() => {
        return productsData.filter(product => {
            // 1. เช็คหมวดหมู่ (ถ้าไม่ได้เลือก 'all')
            const matchCategory = activeCategory === 'all' || product.category === activeCategory;

            // 2. เช็คคำค้นหา (ถ้ามีคนพิมพ์ค้นหามา)
            let matchSearch = true;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                matchSearch =
                    (product.nameEN && product.nameEN.toLowerCase().includes(q)) ||
                    (product.nameTH && product.nameTH.toLowerCase().includes(q)) ||
                    (product.category && product.category.toLowerCase().includes(q));
            }

            // สินค้าต้องตรงทั้งหมวดหมู่ และ คำค้นหา
            return matchCategory && matchSearch;
        });
    }, [productsData, activeCategory, searchQuery]);

    // คำนวณสินค้าที่จะแสดงในหน้าปัจจุบัน
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage]);

    // คำนวณจำนวนหน้าทั้งหมด
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // Reset เป็นหน้าแรกเมื่อ filter เปลี่ยน
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, searchQuery]);

    // Scroll ไปด้านบนเมื่อเปลี่ยนหน้า
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-12">
                {/* Category Filter Skeleton */}
                <aside className="w-full md:w-56 shrink-0">
                    <h2 className="text-lg font-bold text-zinc-900 mb-6 tracking-wide border-b border-gray-100 pb-4">หมวดหมู่สินค้า</h2>
                    <CategoryFilterSkeleton />
                </aside>

                {/* Product Grid Skeleton */}
                <div className="flex-1">
                    <div className="flex justify-between items-end mb-8">
                        <h1 className="text-3xl font-bold tracking-widest text-zinc-900">ALL PRODUCTS</h1>
                        <p className="text-sm text-gray-500">กำลังโหลด...</p>
                    </div>
                    <ProductGridSkeleton count={8} />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-12">

            {/* 🗂️ แถบเมนูกรองหมวดหมู่ด้านซ้าย (Sidebar) */}
            <aside className="w-full md:w-56 shrink-0">
                <h2 className="text-lg font-bold text-zinc-900 mb-6 tracking-wide border-b border-gray-100 pb-4">หมวดหมู่สินค้า</h2>
                <ul className="space-y-4 text-sm font-medium text-gray-600">
                    <li>
                        <button onClick={() => setActiveCategory('all')} className={`transition-colors cursor-pointer category-btn ${activeCategory === 'all' ? 'text-pink-400 font-bold' : 'hover:text-pink-400'}`}>
                            ทั้งหมด (All)
                        </button>
                    </li>
                    <li>
                        <button onClick={() => setActiveCategory('shirt')} className={`transition-colors cursor-pointer category-btn ${activeCategory === 'shirt' ? 'text-pink-400 font-bold' : 'hover:text-pink-400'}`}>
                            เสื้อ (Shirts)
                        </button>
                    </li>
                    <li>
                        <button onClick={() => setActiveCategory('dress')} className={`transition-colors cursor-pointer category-btn ${activeCategory === 'dress' ? 'text-pink-400 font-bold' : 'hover:text-pink-400'}`}>
                            เดรส (Dresses)
                        </button>
                    </li>
                    <li>
                        <button onClick={() => setActiveCategory('set')} className={`transition-colors cursor-pointer category-btn ${activeCategory === 'set' ? 'text-pink-400 font-bold' : 'hover:text-pink-400'}`}>
                            ชุดเซ็ต (Sets)
                        </button>
                    </li>
                </ul>
            </aside>

            {/* 🖼️ พื้นที่โชว์สินค้า (Product Grid) */}
            <div className="flex-1">
                <div className="flex justify-between items-end mb-8">
                    <h1 className="text-3xl font-bold tracking-widest text-zinc-900">
                        ALL PRODUCTS
                    </h1>
                    <p className="text-sm text-gray-500">พบ {filteredProducts.length} รายการ</p>
                </div>

                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-md">
                        <p className="text-gray-500">ไม่พบสินค้าในหมวดหมู่นี้</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
                            {paginatedProducts.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="group cursor-pointer card-hover relative animate-product-card-reveal"
                                    style={{ animationDelay: `${Math.min(index * 85, 680)}ms` }}
                                >
                                    {/* 🌟 Badges */}
                                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
                                        {product.is_new && (
                                            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                                NEW
                                            </span>
                                        )}
                                        {product.discount_percent > 0 && (
                                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                                -{product.discount_percent}%
                                            </span>
                                        )}
                                        {product.stock === 0 && (
                                            <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                                                หมด
                                            </span>
                                        )}
                                    </div>

                                    <Link href={`/product/${product.id}`}>
                                        <div className={`relative mb-4 rounded-2xl overflow-hidden product-card-img ${product.stock === 0 ? 'opacity-60' : ''}`}>
                                            <ProductImage
                                                src={product.image}
                                                alt={product.nameEN}
                                                className="rounded-2xl"
                                            />

                                            {/* ปุ่ม Wishlist */}
                                            <div className="absolute top-3 right-3 z-10">
                                                <div
                                                    className="flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                                                    style={{
                                                        width: confirmRemove === product.id ? '120px' : '34px',
                                                    }}
                                                >
                                                    {confirmRemove === product.id ? (
                                                        <div className="flex items-center gap-1 px-1.5 py-1 w-full animate-in fade-in duration-200">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    setConfirmRemove(null);
                                                                }}
                                                                className="px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors cursor-pointer whitespace-nowrap"
                                                            >
                                                                ยกเลิก
                                                            </button>
                                                            <button
                                                                onClick={confirmRemoveWishlist}
                                                                className="px-2.5 py-1 bg-red-500 text-white text-xs font-medium rounded-full hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap"
                                                            >
                                                                ลบ
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => handleWishlistClick(e, product)}
                                                            className="p-2 hover:bg-pink-50 transition-colors cursor-pointer group/btn"
                                                            title={isInWishlist(product.id) ? "ลบออกจากรายการโปรด" : "เพิ่มลงรายการโปรด"}
                                                        >
                                                            <Heart
                                                                size={18}
                                                                strokeWidth={1.5}
                                                                className={`transition-colors ${isInWishlist(product.id) ? 'text-[#dc6fd6] fill-[#dc6fd6]' : 'text-gray-500 group-hover/btn:text-[#dc6fd6]'}`}
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>

                                    <div>
                                        <Link href={`/product/${product.id}`}>
                                            <h3 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-[#dc6fd6] transition-colors">{product.nameEN}</h3>
                                            <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-1">{product.nameTH}</p>
                                        </Link>

                                        {/* 💰 ราคา (แสดงราคาลดถ้ามีส่วนลด) */}
                                        <div className="mb-3">
                                            {product.discount_percent > 0 ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-400 line-through">
                                                        ฿{(product.original_price || product.price).toLocaleString()}
                                                    </span>
                                                    <span className="text-sm text-red-500 font-bold">
                                                        ฿{Math.round(product.price * (1 - product.discount_percent / 100)).toLocaleString()}
                                                    </span>
                                                </div>
                                            ) : (
                                                <p className="text-sm font-semibold text-[#dc6fd6]">
                                                    ฿{product.price ? product.price.toLocaleString() : 0}
                                                </p>
                                            )}
                                        </div>

                                        {/* 🛒 ปุ่มเพิ่มลงตะกร้า */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                if (product.stock !== 0) {
                                                    addToCart({ ...product, quantity: 1 });
                                                }
                                            }}
                                            disabled={product.stock === 0}
                                            className={`w-full py-2 text-xs font-semibold tracking-widest rounded-lg transition-all cursor-pointer ${product.stock === 0
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                : 'border border-gray-300 text-gray-600 hover:bg-[#dc6fd6] hover:text-white hover:border-[#dc6fd6]'
                                                }`}
                                        >
                                            {product.stock === 0 ? 'SOLD OUT' : 'ADD TO CART'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-12">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-[#dc6fd6] hover:text-white hover:border-[#dc6fd6] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                    ก่อนหน้า
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 rounded-lg border transition-all cursor-pointer ${currentPage === page
                                            ? 'bg-[#dc6fd6] text-white border-[#dc6fd6]'
                                            : 'border-gray-300 text-gray-600 hover:bg-[#dc6fd6] hover:text-white hover:border-[#dc6fd6]'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-[#dc6fd6] hover:text-white hover:border-[#dc6fd6] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                    ถัดไป
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// 🏠 2. Export หน้าหลัก แล้วเอา <Suspense> มาครอบ Component ย่อย
export default function ProductsPage() {
    return (
        <main className="min-h-screen bg-white py-12">
            <Suspense fallback={<div className="w-full text-center py-20 text-gray-500 font-medium tracking-widest">LOADING...</div>}>
                <ProductsContent />
            </Suspense>
        </main>
    );
}
