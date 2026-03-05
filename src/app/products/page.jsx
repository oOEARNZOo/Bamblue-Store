"use client";
import { useState, Suspense } from 'react'; // 🌟 เพิ่มการ import Suspense เข้ามาตรงนี้
import Link from 'next/link';
import { useCart } from '../context/CartContext'; 
import { productsData } from '../../data/products'; 
import { useSearchParams } from 'next/navigation';

// 📦 1. แยกเนื้อหาที่ใช้ useSearchParams มาไว้ใน Component ย่อย
function ProductsContent() {
    const { addToCart } = useCart();
    const [activeCategory, setActiveCategory] = useState('all');

    const searchParams = useSearchParams();
    const searchQuery = searchParams ? searchParams.get('search') : null;

    // ฟังก์ชันกรองสินค้าตามหมวดหมู่ "และ" คำค้นหา
    const filteredProducts = productsData.filter(product => {
        // 1. เช็คหมวดหมู่ (ถ้าไม่ได้เลือก 'all')
        const matchCategory = activeCategory === 'all' || product.category === activeCategory;

        // 2. เช็คคำค้นหา (ถ้ามีคนพิมพ์ค้นหามา)
        let matchSearch = true;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            matchSearch =
                product.nameEN.toLowerCase().includes(q) ||
                product.nameTH.toLowerCase().includes(q) ||
                (product.category && product.category.toLowerCase().includes(q));
        }

        // สินค้าต้องตรงทั้งหมวดหมู่ และ คำค้นหา
        return matchCategory && matchSearch;
    });

    return (
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-12">

            {/* 🗂️ แถบเมนูกรองหมวดหมู่ด้านซ้าย (Sidebar) */}
            <aside className="w-full md:w-56 shrink-0">
                <h2 className="text-lg font-bold text-zinc-900 mb-6 tracking-wide border-b border-gray-100 pb-4">หมวดหมู่สินค้า</h2>
                <ul className="space-y-4 text-sm font-medium text-gray-600">
                    <li>
                        <button onClick={() => setActiveCategory('all')} className={`transition-colors cursor-pointer ${activeCategory === 'all' ? 'text-pink-400 font-bold' : 'hover:text-pink-400'}`}>
                            ทั้งหมด (All)
                        </button>
                    </li>
                    <li>
                        <button onClick={() => setActiveCategory('shirt')} className={`transition-colors cursor-pointer ${activeCategory === 'shirt' ? 'text-pink-400 font-bold' : 'hover:text-pink-400'}`}>
                            เสื้อ (Shirts)
                        </button>
                    </li>
                    <li>
                        <button onClick={() => setActiveCategory('dress')} className={`transition-colors cursor-pointer ${activeCategory === 'dress' ? 'text-pink-400 font-bold' : 'hover:text-pink-400'}`}>
                            เดรส (Dresses)
                        </button>
                    </li>
                    <li>
                        <button onClick={() => setActiveCategory('set')} className={`transition-colors cursor-pointer ${activeCategory === 'set' ? 'text-pink-400 font-bold' : 'hover:text-pink-400'}`}>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                    {filteredProducts.map(product => (
                        <Link key={product.id} href={`/product/${product.id}`} className="group cursor-pointer">
                            <div className="relative aspect-3/4 bg-gray-100 mb-4 overflow-hidden rounded-md">
                                <img
                                    src={product.image}
                                    alt={product.nameEN}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />

                                {/* 🌟 ปุ่ม ADD TO CART (จะโผล่มาตอนเอาเมาส์ชี้รูป) */}
                                <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation(); // กันไม่ให้กดปุ่มแล้วมองว่ากดรูป
                                            e.preventDefault(); // ป้องกันการนำทางเมื่อกดปุ่ม
                                            addToCart({ ...product, quantity: 1 });
                                        }}
                                        className="cursor-pointer w-full bg-white/95 backdrop-blur-sm text-zinc-900 hover:bg-zinc-900 hover:text-white py-3 rounded text-sm font-bold tracking-widest transition-colors shadow-lg"
                                    >
                                        ADD TO CART
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{product.nameEN}</h3>
                                <p className="text-xs text-gray-500 mt-1 mb-2 line-clamp-1">{product.nameTH}</p>
                                <p className="text-sm font-semibold text-pink-500">{product.price}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

// 🏠 2. Export หน้าหลัก แล้วเอา <Suspense> มาครอบ Component ย่อย
export default function ProductsPage() {
    return (
        <main className="min-h-screen bg-white py-12">
            {/* 🌟 Vercel จะไม่งอแงแล้วเพราะเรามี Suspense คอยรับจบตอนดึงข้อมูลให้ */}
            <Suspense fallback={<div className="w-full text-center py-20 text-gray-500 font-medium">กำลังโหลดข้อมูลสินค้า...</div>}>
                <ProductsContent />
            </Suspense>
        </main>
    );
}