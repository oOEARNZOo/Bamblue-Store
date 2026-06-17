"use client";
import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useWishlist } from '@/frontend/context/WishlistContext';
import { supabasePublic } from '@/frontend/services/supabaseClient';
import { useSearchParams } from 'next/navigation';
import { ArrowUpDown, Heart, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';
import SupabaseRetryState from '@/frontend/components/SupabaseRetryState';
import { getSupabaseDataErrorState } from '@/frontend/utils/supabaseErrors';
import {
    ProductGridSkeleton,
    CategoryFilterSkeleton
} from '@/frontend/components/LoadingSkeletons';
import { ProductImage } from '@/frontend/components/OptimizedImage';
import { MotionCard, Reveal } from '@/frontend/components/motion/MotionPrimitives';

const PRODUCT_LIST_COLUMNS = 'id, nameEN, nameTH, category, price, original_price, image, images, is_new, discount_percent, stock, size_stock';
const ITEMS_PER_PAGE = 12;

const CATEGORIES = [
    { id: 'all', label: 'ทั้งหมด', labelEn: 'All' },
    { id: 'shirt', label: 'เสื้อ', labelEn: 'Shirts' },
    { id: 'dress', label: 'เดรส', labelEn: 'Dresses' },
    { id: 'set', label: 'ชุดเซ็ต', labelEn: 'Sets' }
];

const SORT_OPTIONS = [
    { id: 'featured', label: 'แนะนำ' },
    { id: 'newest', label: 'ใหม่ล่าสุด' },
    { id: 'price-low', label: 'ราคาต่ำ-สูง' },
    { id: 'price-high', label: 'ราคาสูง-ต่ำ' },
    { id: 'discount', label: 'ลดเยอะสุด' }
];

const normalizeSizeStock = (sizeStock) => sizeStock || {};
const formatPrice = (price) => Number(price || 0).toLocaleString('th-TH');
const getSalePrice = (product) => {
    const discount = Number(product.discount_percent || 0);
    const price = Number(product.price || 0);
    return discount > 0 ? Math.round(price * (1 - discount / 100)) : price;
};

const getTotalStock = (product) => {
    const sizeStock = normalizeSizeStock(product.size_stock);
    const stockFromSizes = Object.values(sizeStock).reduce((sum, value) => sum + Math.max(0, Number(value || 0)), 0);
    return stockFromSizes > 0 ? stockFromSizes : Math.max(0, Number(product.stock || 0));
};

function ProductCard({ product, confirmRemove, onWishlistClick, onCancelRemove, onConfirmRemove, isInWishlist, delay = 0 }) {
    const salePrice = getSalePrice(product);
    const originalPrice = Number(product.original_price || product.price || 0);
    const totalStock = getTotalStock(product);
    const isSoldOut = totalStock === 0;
    const wishlistActive = isInWishlist(product.id);

    return (
        <MotionCard
            as="article"
            className="group relative"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            <Link href={`/product/${product.id}`} className="block">
                <div className={`relative mb-4 overflow-hidden rounded-2xl bg-gray-100 transition-transform duration-300 group-hover:-translate-y-1 ${isSoldOut ? 'opacity-65' : ''}`}>
                    <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
                        {product.is_new && (
                            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                                NEW
                            </span>
                        )}
                        {product.discount_percent > 0 && (
                            <span className="rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                                -{product.discount_percent}%
                            </span>
                        )}
                        {isSoldOut && (
                            <span className="rounded-full bg-gray-700 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                                หมด
                            </span>
                        )}
                    </div>

                    <ProductImage
                        src={product.image}
                        alt={product.nameEN}
                        className="rounded-2xl transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
            </Link>

            <div className="absolute right-3 top-3 z-20">
                <div
                    className="flex items-center overflow-hidden rounded-full bg-white/95 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out"
                    style={{ width: confirmRemove === product.id ? '72px' : '36px' }}
                >
                    {confirmRemove === product.id ? (
                        <div className="flex w-full items-center gap-1 px-1 py-1">
                            <button
                                onClick={(e) => onCancelRemove(e)}
                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[0px] text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                aria-label="Cancel remove"
                            >
                                <X size={14} />
                                ยกเลิก
                            </button>
                            <button
                                onClick={onConfirmRemove}
                                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-red-500 text-[0px] text-white transition-colors hover:bg-red-600"
                                aria-label={`Confirm remove ${product.nameEN} from wishlist`}
                            >
                                <Trash2 size={14} />
                                ลบ
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => onWishlistClick(e, product)}
                            className="cursor-pointer p-2.5 transition-colors hover:bg-pink-50"
                            title={wishlistActive ? 'ลบออกจากรายการโปรด' : 'เพิ่มลงรายการโปรด'}
                        >
                            <Heart
                                size={18}
                                strokeWidth={1.5}
                                className={`transition-colors ${wishlistActive ? 'fill-[var(--bamblue-brand)] text-[var(--bamblue-brand)]' : 'text-gray-500 hover:text-[var(--bamblue-brand)]'}`}
                            />
                        </button>
                    )}
                </div>
            </div>

            <div>
                <Link href={`/product/${product.id}`}>
                    <h3 className="line-clamp-1 text-sm font-bold text-gray-950 transition-colors group-hover:text-[var(--bamblue-brand)]">
                        {product.nameEN}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-500">{product.nameTH}</p>
                </Link>

                <div className="mt-2 flex min-h-6 items-center gap-2">
                    {product.discount_percent > 0 ? (
                        <>
                            <span className="text-sm font-medium text-gray-400 line-through">฿{formatPrice(originalPrice)}</span>
                            <span className="text-sm font-black text-red-500">฿{formatPrice(salePrice)}</span>
                        </>
                    ) : (
                        <span className="text-sm font-black text-[var(--bamblue-brand)]">฿{formatPrice(salePrice)}</span>
                    )}
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-gray-500">
                    <span>{isSoldOut ? 'สินค้าหมด' : `พร้อมส่ง ${totalStock} ตัว`}</span>
                    {product.discount_percent > 0 && <span className="text-red-500">Sale</span>}
                </div>

                <Link
                    href={`/product/${product.id}`}
                    className={`mt-3 flex h-10 w-full items-center justify-center rounded-lg border text-xs font-bold tracking-widest transition-all ${
                        isSoldOut
                            ? 'border-gray-200 bg-gray-100 text-gray-400'
                            : 'border-gray-300 text-gray-700 hover:border-[var(--bamblue-brand)] hover:bg-[var(--bamblue-brand)] hover:text-white'
                    }`}
                >
                    {isSoldOut ? 'ดูรายละเอียด' : 'เลือกไซส์'}
                </Link>
            </div>
        </MotionCard>
    );
}

function ProductsContent() {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [activeCategory, setActiveCategory] = useState('all');
    const [confirmRemove, setConfirmRemove] = useState(null);
    const [productsData, setProductsData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('featured');
    const [saleOnly, setSaleOnly] = useState(false);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const searchParams = useSearchParams();
    const urlSearchQuery = searchParams ? searchParams.get('search') : null;
    const categoryParam = searchParams ? searchParams.get('category') : null;

    useEffect(() => {
        if (categoryParam && ['shirt', 'dress', 'set'].includes(categoryParam)) {
            setActiveCategory(categoryParam);
        } else if (!categoryParam) {
            setActiveCategory('all');
        }
    }, [categoryParam]);

    useEffect(() => {
        setSearchTerm(urlSearchQuery || '');
    }, [urlSearchQuery]);

    const fetchProducts = useCallback(async () => {
        try {
            setIsLoading(true);
            setFetchError('');
            const { data, error } = await supabasePublic
                .from('products1')
                .select(PRODUCT_LIST_COLUMNS)
                .order('id', { ascending: true });

            if (error) {
                throw error;
            } else {
                setProductsData(data || []);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProductsData([]);
            setFetchError(getSupabaseDataErrorState(error, 'สินค้า'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const categoryCounts = useMemo(() => {
        return CATEGORIES.reduce((counts, category) => {
            counts[category.id] = category.id === 'all'
                ? productsData.length
                : productsData.filter((product) => product.category === category.id).length;
            return counts;
        }, {});
    }, [productsData]);

    const filteredProducts = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        const filtered = productsData.filter((product) => {
            const matchCategory = activeCategory === 'all' || product.category === activeCategory;
            const matchSearch = !query ||
                product.nameEN?.toLowerCase().includes(query) ||
                product.nameTH?.toLowerCase().includes(query) ||
                product.category?.toLowerCase().includes(query);
            const matchSale = !saleOnly || Number(product.discount_percent || 0) > 0;
            const matchStock = !inStockOnly || getTotalStock(product) > 0;

            return matchCategory && matchSearch && matchSale && matchStock;
        });

        return [...filtered].sort((a, b) => {
            if (sortBy === 'newest') return Number(b.id || 0) - Number(a.id || 0);
            if (sortBy === 'price-low') return getSalePrice(a) - getSalePrice(b);
            if (sortBy === 'price-high') return getSalePrice(b) - getSalePrice(a);
            if (sortBy === 'discount') return Number(b.discount_percent || 0) - Number(a.discount_percent || 0);
            return Number(a.id || 0) - Number(b.id || 0);
        });
    }, [productsData, activeCategory, searchTerm, saleOnly, inStockOnly, sortBy]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const hasActiveFilters = activeCategory !== 'all' || searchTerm || saleOnly || inStockOnly || sortBy !== 'featured';

    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, searchTerm, saleOnly, inStockOnly, sortBy]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

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

    const cancelRemoveWishlist = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        setConfirmRemove(null);
    }, []);

    const clearFilters = useCallback(() => {
        setActiveCategory('all');
        setSearchTerm('');
        setSortBy('featured');
        setSaleOnly(false);
        setInStockOnly(false);
        setIsFilterOpen(false);
    }, []);

    const categoryFilter = (
        <div className="space-y-2">
            {CATEGORIES.map((category) => (
                <button
                    key={category.id}
                    onClick={() => {
                        setActiveCategory(category.id);
                        setIsFilterOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
                        activeCategory === category.id
                            ? 'bg-[var(--bamblue-brand)] text-white shadow-sm'
                            : 'text-[#4a3347] hover:bg-[var(--bamblue-brand-soft)] hover:text-[var(--bamblue-brand-ink)]'
                    }`}
                >
                    <span>{category.label} ({category.labelEn})</span>
                    <span className={`text-xs ${activeCategory === category.id ? 'text-white/80' : 'text-gray-400'}`}>
                        {categoryCounts[category.id] || 0}
                    </span>
                </button>
            ))}
        </div>
    );

    if (isLoading) {
        return (
            <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 md:flex-row md:gap-12">
                <aside className="hidden w-60 shrink-0 md:block">
                    <h2 className="mb-6 border-b border-gray-100 pb-4 text-lg font-bold tracking-wide text-zinc-900">หมวดหมู่สินค้า</h2>
                    <CategoryFilterSkeleton />
                </aside>

                <div className="flex-1">
                    <div className="mb-8 flex items-end justify-between">
                        <h1 className="text-3xl font-black tracking-widest text-zinc-900">ALL PRODUCTS</h1>
                        <p className="text-sm text-gray-500">กำลังโหลด...</p>
                    </div>
                    <ProductGridSkeleton count={8} />
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="mx-auto flex min-h-[420px] max-w-3xl items-center justify-center px-6">
                <SupabaseRetryState
                    title={fetchError.title}
                    message={fetchError.message}
                    badge={fetchError.badge}
                    retryLabel={fetchError.retryLabel}
                    onRetry={fetchProducts}
                />
            </div>
        );
    }

    return (
        <>
            <Reveal className="mx-auto flex max-w-7xl flex-col gap-8 px-6 md:flex-row md:gap-12">
                <aside className="hidden w-60 shrink-0 md:block">
                    <div className="sticky top-28">
                        <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
                            <h2 className="text-lg font-bold tracking-wide text-zinc-900">หมวดหมู่สินค้า</h2>
                            {hasActiveFilters && (
                                <button onClick={clearFilters} className="text-xs font-semibold text-[var(--bamblue-brand)] hover:text-[var(--bamblue-brand-hover)]">
                                    ล้าง
                                </button>
                            )}
                        </div>
                        {categoryFilter}
                    </div>
                </aside>

                <section className="min-w-0 flex-1">
                    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-black tracking-widest text-zinc-900 md:text-4xl">
                                ALL PRODUCTS
                            </h1>
                            <p className="mt-2 text-sm text-gray-500">
                                พบ {filteredProducts.length} รายการจากทั้งหมด {productsData.length} รายการ
                            </p>
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-bold text-gray-700 md:hidden"
                        >
                            <SlidersHorizontal size={18} />
                            ตัวกรอง
                        </button>
                    </div>

                    <div className="mb-8 grid gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm lg:grid-cols-[1fr_220px_auto_auto]">
                        <label className="relative block">
                            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ค้นหาสินค้า..."
                                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition-colors focus:border-[var(--bamblue-brand)]"
                            />
                        </label>

                        <label className="relative block">
                            <ArrowUpDown className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm font-semibold text-gray-700 outline-none transition-colors focus:border-[var(--bamblue-brand)]"
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <option key={option.id} value={option.id}>{option.label}</option>
                                ))}
                            </select>
                        </label>

                        <button
                            onClick={() => setSaleOnly((value) => !value)}
                            className={`h-11 rounded-xl px-4 text-sm font-bold transition-colors ${
                                saleOnly
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-50 text-[#4a3347] hover:bg-[var(--bamblue-brand-soft)] hover:text-[var(--bamblue-brand-ink)]'
                            }`}
                        >
                            ลดราคา
                        </button>

                        <button
                            onClick={() => setInStockOnly((value) => !value)}
                            className={`h-11 rounded-xl px-4 text-sm font-bold transition-colors ${
                                inStockOnly
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-gray-50 text-[#4a3347] hover:bg-[var(--bamblue-brand-soft)] hover:text-[var(--bamblue-brand-ink)]'
                            }`}
                        >
                            พร้อมส่ง
                        </button>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 text-center">
                            <p className="text-lg font-bold text-gray-900">ไม่พบสินค้าที่ตรงกับตัวกรอง</p>
                            <p className="mt-2 text-sm text-gray-500">ลองเปลี่ยนคำค้นหา หมวดหมู่ หรือปิดตัวกรองบางรายการ</p>
                            <button
                                onClick={clearFilters}
                                className="mt-5 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-800"
                            >
                                ล้างตัวกรอง
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {paginatedProducts.map((product, index) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        confirmRemove={confirmRemove}
                                        onWishlistClick={handleWishlistClick}
                                        onCancelRemove={cancelRemoveWishlist}
                                        onConfirmRemove={confirmRemoveWishlist}
                                        isInWishlist={isInWishlist}
                                        delay={Math.min(index * 0.085, 0.68)}
                                    />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:border-[var(--bamblue-brand)] hover:bg-[var(--bamblue-brand)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        ก่อนหน้า
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                                                currentPage === page
                                                    ? 'border-[var(--bamblue-brand)] bg-[var(--bamblue-brand)] text-white'
                                                    : 'border-gray-300 text-gray-600 hover:border-[var(--bamblue-brand)] hover:bg-[var(--bamblue-brand)] hover:text-white'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition-all hover:border-[var(--bamblue-brand)] hover:bg-[var(--bamblue-brand)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        ถัดไป
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </Reveal>

            {isFilterOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <button
                        className="absolute inset-0 bg-black/35"
                        onClick={() => setIsFilterOpen(false)}
                        aria-label="Close filters"
                    />
                    <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-black text-gray-950">ตัวกรองสินค้า</h2>
                            <button
                                onClick={() => setIsFilterOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600"
                                aria-label="Close filters"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        {categoryFilter}
                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setSaleOnly((value) => !value)}
                                className={`h-11 rounded-xl text-sm font-bold ${
                                    saleOnly ? 'bg-red-500 text-white' : 'bg-gray-100 text-[#4a3347]'
                                }`}
                            >
                                ลดราคา
                            </button>
                            <button
                                onClick={() => setInStockOnly((value) => !value)}
                                className={`h-11 rounded-xl text-sm font-bold ${
                                    inStockOnly ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-[#4a3347]'
                                }`}
                            >
                                พร้อมส่ง
                            </button>
                        </div>
                        <button
                            onClick={clearFilters}
                            className="mt-3 h-11 w-full rounded-xl border border-gray-200 text-sm font-bold text-gray-600"
                        >
                            ล้างตัวกรอง
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default function ProductsPage() {
    return (
        <main className="min-h-screen bg-white py-10 md:py-12">
            <Suspense fallback={<div className="w-full py-20 text-center font-medium tracking-widest text-gray-500">LOADING...</div>}>
                <ProductsContent />
            </Suspense>
        </main>
    );
}
