"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Sun, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString('th-TH');
};

const getSalePrice = (product) => {
  const price = Number(product.price || 0);
  const discount = Number(product.discount_percent || 0);
  return Math.round(price * (1 - discount / 100));
};

export default function PromotionsPage() {
  const productGridRef = useRef(null);
  const extraProductsRef = useRef(null);
  const [saleProducts, setSaleProducts] = useState([]);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [extraProductsHeight, setExtraProductsHeight] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products1')
          .select('id, nameEN, nameTH, price, original_price, image, images, discount_percent, category')
          .gt('discount_percent', 0)
          .order('discount_percent', { ascending: false })
          .order('id', { ascending: true });

        if (error) throw error;
        setSaleProducts(data || []);
      } catch (error) {
        console.error('Error fetching promotion products:', error);
        setSaleProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleProducts();
  }, []);

  const maxDiscount = saleProducts.reduce((max, product) => {
    return Math.max(max, Number(product.discount_percent || 0));
  }, 0);
  const previewSaleProducts = saleProducts.slice(0, 4);
  const extraSaleProducts = saleProducts.slice(4);
  const hasMoreProducts = saleProducts.length > 4;

  useEffect(() => {
    const updateExtraHeight = () => {
      setExtraProductsHeight(extraProductsRef.current?.scrollHeight || 0);
    };

    updateExtraHeight();
    window.addEventListener('resize', updateExtraHeight);

    return () => {
      window.removeEventListener('resize', updateExtraHeight);
    };
  }, [saleProducts]);

  const handleToggleProducts = () => {
    if (showAllProducts) {
      setShowAllProducts(false);
      window.setTimeout(() => {
        productGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      return;
    }

    setShowAllProducts(true);
    window.setTimeout(() => {
      const firstExtraProduct = extraProductsRef.current?.querySelector('[data-promo-extra="true"]');
      firstExtraProduct?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 280);
  };

  return (
    <main className="min-h-screen bg-[#f7faf9]">
      <section className="px-4 py-12 md:px-10 lg:px-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#dc6fd6]/20 bg-white px-4 py-2 text-sm font-semibold text-[#c05ca8]">
                <Sun size={16} />
                Summer Promotion
              </div>
              <h1 className="text-3xl font-bold text-gray-950 md:text-5xl">Summer Sale</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
                รวมสินค้าลดราคาสำหรับลุคซัมเมอร์ สดใส ใส่ง่าย และพร้อมช้อปจากสินค้าที่ติดแท็กส่วนลดจริงในร้าน
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              ดูสินค้าทั้งหมด
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
            <div className="grid gap-0 lg:grid-cols-[0.9fr_1.6fr]">
              <div className="relative overflow-hidden bg-[#dff7ee] p-8 md:p-10">
                <div className="relative z-10 flex h-full min-h-[320px] flex-col justify-between">
                  <div>
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-[#dc6fd6]">
                      <Sparkles size={14} />
                      Limited Summer Picks
                    </div>
                    <h2 className="max-w-sm text-4xl font-black leading-tight text-gray-950 md:text-5xl">
                      ลดรับซัมเมอร์
                      <span className="block text-[#dc6fd6]">
                        {maxDiscount > 0 ? `สูงสุด ${maxDiscount}%` : 'เฉพาะช่วงนี้'}
                      </span>
                    </h2>
                    <p className="mt-5 max-w-md text-sm leading-6 text-gray-700">
                      สินค้าในแคมเปญนี้ดึงจากรายการที่ตั้งค่า `discount_percent` ไว้ในระบบ จึงอัปเดตตามโปรโมชันจริงของร้าน
                    </p>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white/80 p-4">
                      <p className="text-gray-500">สินค้าโปรโมชัน</p>
                      <p className="mt-1 text-2xl font-bold text-gray-950">{saleProducts.length}</p>
                    </div>
                    <div className="rounded-xl bg-white/80 p-4">
                      <p className="text-gray-500">ส่วนลดสูงสุด</p>
                      <p className="mt-1 text-2xl font-bold text-gray-950">{maxDiscount}%</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 lg:p-8">
                {loading ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
                        <div className="h-56 animate-pulse bg-gray-100" />
                        <div className="space-y-3 p-4">
                          <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
                          <div className="h-8 w-full animate-pulse rounded bg-gray-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : saleProducts.length === 0 ? (
                  <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 text-center">
                    <Tag className="mb-4 text-gray-300" size={44} />
                    <h3 className="text-lg font-bold text-gray-900">ยังไม่มีสินค้าโปรโมชัน</h3>
                    <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
                      เมื่อแอดมินตั้งค่าส่วนลดให้สินค้า รายการนั้นจะแสดงใน Summer Sale อัตโนมัติ
                    </p>
                  </div>
                ) : (
                  <>
                  <div ref={productGridRef} className="grid scroll-mt-24 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {previewSaleProducts.map((product, index) => {
                      const salePrice = getSalePrice(product);
                      const originalPrice = Number(product.original_price || product.price || 0);
                      const productImage = product.images?.[0] || product.image;

                      return (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          data-promo-index={index}
                          style={{ animationDelay: `${Math.min(index, 7) * 45}ms` }}
                          className="promo-product-card group overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:-translate-y-1 hover:shadow-lg"
                        >
                          <div className="relative h-64 overflow-hidden bg-gray-100">
                            {productImage ? (
                              <img
                                src={productImage}
                                alt={product.nameEN}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                                No image
                              </div>
                            )}
                            <div className="absolute left-3 top-3 rounded-full bg-[#dc6fd6] px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                              -{product.discount_percent}%
                            </div>
                          </div>

                          <div className="p-4">
                            <p className="mb-1 text-xs font-medium text-gray-500">{product.nameTH || product.category || 'Bamblue'}</p>
                            <h3 className="line-clamp-2 min-h-[44px] text-sm font-bold text-gray-950 transition-colors group-hover:text-[#dc6fd6]">
                              {product.nameEN}
                            </h3>
                            <div className="mt-4 flex items-end justify-between gap-3">
                              <div>
                                <p className="text-xs text-gray-400 line-through">฿{formatPrice(originalPrice)}</p>
                                <p className="text-lg font-black text-[#dc6fd6]">฿{formatPrice(salePrice)}</p>
                              </div>
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-950">
                                ช้อปเลย
                                <ArrowRight size={14} />
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  {hasMoreProducts && (
                    <div
                      className={`overflow-hidden transition-[max-height,opacity,transform,margin-top] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${showAllProducts ? 'mt-4 opacity-100 translate-y-0' : 'mt-0 opacity-0 -translate-y-2'}`}
                      style={{ maxHeight: showAllProducts ? `${extraProductsHeight}px` : '0px' }}
                    >
                      <div ref={extraProductsRef} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {extraSaleProducts.map((product, extraIndex) => {
                          const index = extraIndex + 4;
                          const salePrice = getSalePrice(product);
                          const originalPrice = Number(product.original_price || product.price || 0);
                          const productImage = product.images?.[0] || product.image;

                          return (
                            <Link
                              key={product.id}
                              href={`/product/${product.id}`}
                              data-promo-extra="true"
                              data-promo-index={index}
                              style={{ animationDelay: `${Math.min(extraIndex, 7) * 55}ms` }}
                              className={`promo-product-card group overflow-hidden rounded-xl border border-gray-100 bg-white transition-all hover:-translate-y-1 hover:shadow-lg ${showAllProducts ? 'promo-extra-visible' : ''}`}
                            >
                              <div className="relative h-64 overflow-hidden bg-gray-100">
                                {productImage ? (
                                  <img
                                    src={productImage}
                                    alt={product.nameEN}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                                    No image
                                  </div>
                                )}
                                <div className="absolute left-3 top-3 rounded-full bg-[#dc6fd6] px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                                  -{product.discount_percent}%
                                </div>
                              </div>

                              <div className="p-4">
                                <p className="mb-1 text-xs font-medium text-gray-500">{product.nameTH || product.category || 'Bamblue'}</p>
                                <h3 className="line-clamp-2 min-h-[44px] text-sm font-bold text-gray-950 transition-colors group-hover:text-[#dc6fd6]">
                                  {product.nameEN}
                                </h3>
                                <div className="mt-4 flex items-end justify-between gap-3">
                                  <div>
                                    <p className="text-xs text-gray-400 line-through">฿{formatPrice(originalPrice)}</p>
                                    <p className="text-lg font-black text-[#dc6fd6]">฿{formatPrice(salePrice)}</p>
                                  </div>
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-950">
                                    ช้อปเลย
                                    <ArrowRight size={14} />
                                  </span>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {hasMoreProducts && (
                    <div className="mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={handleToggleProducts}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-950 px-6 py-3 text-sm font-bold text-gray-950 transition-colors hover:bg-gray-950 hover:text-white sm:w-auto"
                      >
                        {showAllProducts ? 'แสดงน้อยลง' : `ดูเพิ่มเติมอีก ${saleProducts.length - 4} ชิ้น`}
                        <ArrowRight size={16} className={`transition-transform ${showAllProducts ? '-rotate-90' : 'rotate-90'}`} />
                      </button>
                    </div>
                  )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <style jsx global>{`
        @keyframes promo-product-enter {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .promo-product-card {
          animation: promo-product-enter 420ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .promo-product-card {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}
