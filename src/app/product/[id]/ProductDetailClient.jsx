"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/frontend/context/CartContext';
import { useWishlist } from '@/frontend/context/WishlistContext';
import { ArrowRight, Heart, Share2, Truck, RefreshCcw, Minus, Plus, X } from 'lucide-react'; // เพิ่ม X ไอคอน
import Link from 'next/link';
import ProductReviews from '@/frontend/components/ProductReviews';
import { supabase, supabasePublic } from '@/frontend/services/supabaseClient';
import { limitedToast, shopToast } from '@/frontend/utils/toast';
import { MotionButton, Reveal } from '@/frontend/components/motion/MotionPrimitives';

const PRODUCT_SIZES = ['S', 'M', 'L', 'XL'];
const DEFAULT_SIZE_STOCK = { S: 0, M: 0, L: 0, XL: 0 };
const PRODUCT_DETAIL_COLUMNS = 'id, nameEN, nameTH, price, original_price, image, images, category, discount_percent, stock, size_stock';
const RELATED_PRODUCT_COLUMNS = 'id, nameEN, nameTH, price, original_price, image, images, category, discount_percent, stock, size_stock';

const SIZE_GUIDES = {
  shirt: [
    { size: 'S', bust: '78-84', waist: '62-68', hip: '-', length: '40-46' },
    { size: 'M', bust: '84-90', waist: '68-74', hip: '-', length: '42-48' },
    { size: 'L', bust: '90-96', waist: '74-80', hip: '-', length: '44-50' },
    { size: 'XL', bust: '96-104', waist: '80-88', hip: '-', length: '46-52' },
  ],
  dress: [
    { size: 'S', bust: '78-84', waist: '62-68', hip: '84-90', length: '78-84' },
    { size: 'M', bust: '84-90', waist: '68-74', hip: '90-96', length: '80-88' },
    { size: 'L', bust: '90-96', waist: '74-82', hip: '96-104', length: '84-92' },
    { size: 'XL', bust: '96-104', waist: '82-90', hip: '104-112', length: '88-96' },
  ],
  set: [
    { size: 'S', bust: '78-84', waist: '62-68', hip: '84-90', length: 'เสื้อ 38-44 / กระโปรง 36-40' },
    { size: 'M', bust: '84-90', waist: '68-74', hip: '90-96', length: 'เสื้อ 40-46 / กระโปรง 38-42' },
    { size: 'L', bust: '90-96', waist: '74-82', hip: '96-104', length: 'เสื้อ 42-48 / กระโปรง 40-44' },
    { size: 'XL', bust: '96-104', waist: '82-90', hip: '104-112', length: 'เสื้อ 44-50 / กระโปรง 42-46' },
  ],
};

const normalizeSizeStock = (sizeStock) => ({
  ...DEFAULT_SIZE_STOCK,
  ...(sizeStock || {})
});

const getTotalSizeStock = (sizeStock) => PRODUCT_SIZES.reduce((total, size) => {
  const stock = Number(sizeStock?.[size] ?? 0);
  return total + (Number.isFinite(stock) ? Math.max(0, stock) : 0);
}, 0);

const getEffectiveSizeStock = (product) => {
  const normalizedStock = normalizeSizeStock(product?.size_stock);

  if (getTotalSizeStock(normalizedStock) > 0) {
    return normalizedStock;
  }

  const fallbackStock = Number(product?.stock ?? 0);
  if (!Number.isFinite(fallbackStock) || fallbackStock <= 0) {
    return normalizedStock;
  }

  return PRODUCT_SIZES.reduce((stockBySize, size) => ({
    ...stockBySize,
    [size]: Math.max(0, fallbackStock)
  }), {});
};

const getStockForSize = (sizeStock, size) => {
  const stock = Number(sizeStock?.[size] ?? 0);
  return Number.isFinite(stock) ? Math.max(0, stock) : 0;
};

const formatPrice = (price) => Number(price || 0).toLocaleString('th-TH');

const copyTextToClipboard = async (text) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
};

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id;
  const router = useRouter();

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [mainImage, setMainImage] = useState(null);

  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // State สำหรับเปิด/ปิด Pop-up แจ้งเตือนให้ Login
  const [showLoginModal, setShowLoginModal] = useState(false);
  // State สำหรับเปิด/ปิด Pop-up แสดงขนาดเสื้อ
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    async function fetchSingleProduct() {
      try {
        setIsLoading(true);
        const { data, error } = await supabasePublic
          .from('products1')
          .select(PRODUCT_DETAIL_COLUMNS)
          .eq('id', productId)
          .single();

        if (error) {
          console.error("หาข้อมูลไม่เจอ:", error);
          setProduct(null);
        } else {
          setProduct(data);
          setMainImage(data.image);
        }
      } catch (err) {
        console.error("System Error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (productId) {
      fetchSingleProduct();
      
      // Subscribe to real-time updates for this product
      const channel = supabase
        .channel(`product-${productId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'products1',
            filter: `id=eq.${productId}`
          },
          (payload) => {
            setProduct(payload.new);
          }
        )
        .subscribe();

      // Cleanup: Unsubscribe when component unmounts
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [productId]);

  useEffect(() => {
    if (!product) return;

    const stockBySize = getEffectiveSizeStock(product);
    const currentStock = getStockForSize(stockBySize, selectedSize);

    if (currentStock > 0 && quantity > currentStock) {
      setQuantity(currentStock);
      return;
    }

    if (currentStock <= 0) {
      const firstAvailableSize = PRODUCT_SIZES.find((size) => getStockForSize(stockBySize, size) > 0);

      if (firstAvailableSize && firstAvailableSize !== selectedSize) {
        setSelectedSize(firstAvailableSize);
        setQuantity(1);
      }
    }
  }, [product, selectedSize, quantity]);

  useEffect(() => {
    if (!product?.id) return;

    const fetchRelatedProducts = async () => {
      try {
        let query = supabasePublic
          .from('products1')
          .select(RELATED_PRODUCT_COLUMNS)
          .neq('id', product.id)
          .limit(4);

        if (product.category) {
          query = query.eq('category', product.category);
        }

        const { data, error } = await query;
        if (error) throw error;

        setRelatedProducts(data || []);
      } catch (error) {
        console.error('Error fetching related products:', error);
        setRelatedProducts([]);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  // ฟังก์ชันจัดการ Wishlist (เชื่อมกับ WishlistContext)
  const handleAddWishlist = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // ถ้าไม่ล็อกอิน ให้เปิด Pop-up แจ้งเตือน
        setShowLoginModal(true);
        return;
      }

      // ถ้าอยู่ใน wishlist แล้ว ให้ลบออก / ถ้ายังไม่มี ให้เพิ่มเข้าไป
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
      } else {
        addToWishlist(product);
      }

    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[#dc6fd6] font-medium tracking-widest animate-pulse">
          กำลังโหลดข้อมูลสินค้า... ⏳
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">ไม่พบสินค้านี้ 😢</h1>
        <Link href="/" className="cursor-pointer px-6 py-2 bg-zinc-900 text-white rounded text-sm tracking-widest hover:bg-zinc-800 transition-colors">
          กลับไปเลือกช้อปสินค้าต่อ
        </Link>
      </div>
    );
  }

  const skuCode = `BMB-${product.id}00${selectedSize}`;

  // ดึงข้อมูล size_stock จาก product
  const sizeStock = getEffectiveSizeStock(product);

  // เช็คว่า size ที่เลือกมีสต็อกเหลือหรือไม่
  const selectedSizeStock = getStockForSize(sizeStock, selectedSize);
  const isOutOfStock = selectedSizeStock === 0;
  const isLowStock = selectedSizeStock > 0 && selectedSizeStock <= 5;
  const canDecreaseQuantity = quantity > 1;
  const canIncreaseQuantity = !isOutOfStock && quantity < selectedSizeStock;
  const discountPercent = Number(product.discount_percent || 0);
  const basePrice = Number(product.price || 0);
  const salePrice = discountPercent > 0 ? Math.round(basePrice * (1 - discountPercent / 100)) : basePrice;
  const compareAtPrice = Number(product.original_price || 0) > salePrice
    ? Number(product.original_price)
    : discountPercent > 0 ? basePrice : 0;
  const selectedStockText = isOutOfStock
    ? `ไซส์ ${selectedSize} หมดแล้ว`
    : isLowStock
      ? `ไซส์ ${selectedSize} เหลือน้อย ${selectedSizeStock} ตัว`
      : `ไซส์ ${selectedSize} พร้อมส่ง ${selectedSizeStock} ตัว`;
  const wishlistActive = isInWishlist(product.id);
  const sizeGuideRows = SIZE_GUIDES[product.category] || SIZE_GUIDES.shirt;

  const handleSizeSelect = (size) => {
    const stock = getStockForSize(sizeStock, size);
    setSelectedSize(size);
    setQuantity((currentQuantity) => Math.min(Math.max(1, currentQuantity), stock));
  };

  const handleAddToCart = () => {
    // ตรวจสอบสต็อกก่อนเพิ่มลงตะกร้า
    if (isOutOfStock) {
      shopToast.stockOut(selectedSize);
      return;
    }

    if (quantity > selectedSizeStock) {
      shopToast.stockLimit(selectedSize, selectedSizeStock);
      return;
    }

    addToCart({
      ...product,
      price: salePrice,
      original_price: compareAtPrice || product.original_price,
      image: mainImage,
      size: selectedSize,
      size_stock: sizeStock,
      stockLimit: selectedSizeStock,
      quantity: quantity
    });
  };

  const handleShareProduct = async () => {
    if (typeof window === 'undefined') return;

    const shareUrl = `${window.location.origin}/product/${productId}`;
    const shareTitle = product.nameEN || product.nameTH || 'Bamblue store';
    const shareText = `${shareTitle} - Bamblue store`;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        });
        return;
      }

      await copyTextToClipboard(shareUrl);
      limitedToast.success('คัดลอกลิงก์สินค้าแล้ว', {
        id: `product-share-${productId}`,
        duration: 2200
      });
    } catch (error) {
      if (error?.name === 'AbortError') return;

      try {
        await copyTextToClipboard(shareUrl);
        limitedToast.success('คัดลอกลิงก์สินค้าแล้ว', {
          id: `product-share-${productId}`,
          duration: 2200
        });
      } catch {
        limitedToast.error('ไม่สามารถแชร์ลิงก์ได้', {
          id: `product-share-error-${productId}`,
          duration: 2600
        });
      }
    }
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <>
      <main className="min-h-screen bg-white pb-32 pt-10 md:pb-20">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-xs text-gray-500 mb-8 tracking-wide">
            <Link href="/" className="cursor-pointer hover:text-[#dc6fd6]">Home</Link> /
            <span className="mx-2 cursor-pointer hover:text-[#dc6fd6]">Products</span> /
            <span className="text-gray-900">{product.nameEN}</span>
          </div>

          <Reveal className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* ฝั่งซ้าย: รูปภาพสินค้า */}
            <div className="lg:col-span-6 flex flex-col-reverse md:flex-row gap-4">
              {/* Thumbnail รูปภาพ */}
              <div className="flex md:flex-col gap-3 overflow-x-auto pb-1 md:w-24 md:pb-0 shrink-0">
                {/* แสดงรูปจาก images array หรือ fallback เป็น image เดี่ยว */}
                {(product.images && product.images.length > 0 ? product.images : [product.image]).map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(img)}
                    className={`cursor-pointer w-20 h-28 md:w-full md:h-28 border-2 overflow-hidden rounded-xl bg-gray-50 transition-all ${mainImage === img ? 'border-[#dc6fd6] shadow-md ring-2 ring-[#dc6fd6]/15' : 'border-gray-200 opacity-80 hover:border-gray-400 hover:opacity-100'
                      }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt={`${product.nameEN} ${index + 1}`} />
                  </button>
                ))}
              </div>

              {/* รูปภาพหลัก */}
              <div
                className="grow bg-gray-100 aspect-[3/4] max-h-[580px] overflow-hidden relative cursor-zoom-in rounded-xl"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                {mainImage && (
                  <img
                    src={mainImage}
                    className="w-full h-full object-cover object-center transition-transform duration-200 ease-out"
                    alt={product.nameEN}
                    style={{
                      transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                      transform: isZoomed ? 'scale(2)' : 'scale(1)'
                    }}
                  />
                )}
              </div>
            </div>

            {/* ฝั่งขวา: รายละเอียดสินค้า */}
            <div className="lg:col-span-6 flex flex-col pt-4">
              <p className="text-sm text-gray-500 mb-1">{product.nameTH}</p>
              <h1 className="text-3xl font-bold text-zinc-900 mb-2 tracking-wide">{product.nameEN}</h1>
              <p className="text-xs text-gray-400 mb-6">SKU: {skuCode}</p>

              <div className="mb-7 flex flex-wrap items-center gap-3">
                <span className="text-3xl font-black text-[#dc6fd6]">
                  ฿{formatPrice(salePrice)}
                </span>
                {compareAtPrice > salePrice && (
                  <span className="text-sm font-medium text-gray-400 line-through">
                    ฿{formatPrice(compareAtPrice)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-500">
                    -{discountPercent}%
                  </span>
                )}
              </div>

              <hr className="border-gray-100 mb-6" />

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
              {/* ส่วนเลือกไซส์ */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold tracking-wide">ไซส์</span>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="cursor-pointer text-xs text-gray-500 underline hover:text-[#dc6fd6]"
                  >
                    ขนาดสินค้า
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {PRODUCT_SIZES.map((s) => {
                    const stock = getStockForSize(sizeStock, s);
                    const isAvailable = stock > 0;

                    return (
                      <div key={s} className="relative">
                        <button
                          onClick={() => isAvailable && handleSizeSelect(s)}
                          disabled={!isAvailable}
                          className={`cursor-pointer w-16 h-16 rounded-lg border flex flex-col items-center justify-center text-sm transition-all
                            ${!isAvailable ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60' : 
                              selectedSize === s ? 'bg-zinc-900 text-white border-zinc-900' : 
                              'border-gray-300 text-gray-600 hover:border-zinc-900'}`}
                        >
                          <span className="font-semibold">{s}</span>
                          <span className={`text-xs mt-0.5 ${
                            !isAvailable ? 'text-red-500' : 
                            selectedSize === s ? 'text-white/80' : 
                            stock <= 5 ? 'text-orange-500' : 'text-gray-500'
                          }`}>
                            {!isAvailable ? 'หมด' : `${stock} ตัว`}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className={`mt-3 flex items-center gap-2 text-sm ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-orange-600' : 'text-emerald-600'}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{selectedStockText}</span>
                  </div>
              </div>

              {/* ส่วนเลือกจำนวน */}
              <div className="mb-6">
                <span className="text-sm font-semibold tracking-wide block mb-3">จำนวน</span>
                <div className="flex items-center">
                  {/* ปุ่ม +/- */}
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => setQuantity((currentQuantity) => Math.max(1, currentQuantity - 1))}
                      disabled={!canDecreaseQuantity}
                      className={`w-10 h-10 flex items-center justify-center transition-colors ${
                        canDecreaseQuantity ? 'cursor-pointer text-gray-600 hover:text-[#dc6fd6]' : 'cursor-not-allowed text-gray-300'
                      }`}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-12 h-10 flex items-center justify-center text-sm font-semibold border-x border-gray-300 select-none">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((currentQuantity) => Math.min(selectedSizeStock, currentQuantity + 1))}
                      disabled={!canIncreaseQuantity}
                      className={`w-10 h-10 flex items-center justify-center transition-colors ${
                        canIncreaseQuantity ? 'cursor-pointer text-gray-600 hover:text-[#dc6fd6]' : 'cursor-not-allowed text-gray-300'
                      }`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ปุ่ม Wishlist และ Add to cart */}
              <div className="flex space-x-4 mb-5">
                <MotionButton
                  onClick={handleAddWishlist}
                  className={`cursor-pointer w-14 h-14 border rounded-xl flex items-center justify-center transition-colors shrink-0 ${wishlistActive ? 'border-[#dc6fd6] text-[#dc6fd6] bg-pink-50' : 'border-gray-300 text-gray-600 hover:border-[#dc6fd6] hover:text-[#dc6fd6]'}`}
                  title={wishlistActive ? 'ลบออกจาก Wishlist' : 'เพิ่มลง Wishlist'}
                >
                  <Heart size={24} strokeWidth={1.5} className={wishlistActive ? 'fill-[#dc6fd6]' : ''} />
                </MotionButton>

                <MotionButton
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`grow text-white rounded text-sm tracking-widest font-semibold transition-colors flex items-center justify-center h-14 ${
                    isOutOfStock ? 'cursor-not-allowed bg-gray-300' : 'cursor-pointer bg-zinc-900 hover:bg-zinc-800'
                  }`}
                >
                  {isOutOfStock ? 'สินค้าหมด' : 'ใส่ตะกร้า'}
                </MotionButton>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="bg-[#fff9ea] p-4 rounded text-sm flex items-start space-x-3">
                  <Truck className="text-gray-700 shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-gray-800 text-xs">จัดส่งฟรีทุกออเดอร์</p>
                    <p className="text-[10px] text-gray-500 mt-1">(ประเทศไทย)</p>
                  </div>
                </div>
                <div className="bg-[#fff9ea] p-4 rounded text-sm flex items-start space-x-3">
                  <RefreshCcw className="text-gray-700 shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-gray-800 text-xs">คืนสินค้าฟรี ภายใน 14 วัน</p>
                    <p className="text-[10px] text-gray-500 mt-1">ตามเงื่อนไขบริษัทฯ ที่กำหนด</p>
                  </div>
                </div>
              </div>
              </div>

              <div className="flex items-center space-x-4 mt-6 mb-8">
                <span className="text-sm text-gray-500">แชร์สินค้า:</span>
                <MotionButton
                  type="button"
                  onClick={handleShareProduct}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-[#dc6fd6] hover:text-[#dc6fd6]"
                  aria-label="แชร์ลิงก์สินค้า"
                >
                  <Share2 size={16} />
                  <span>แชร์ลิงก์</span>
                </MotionButton>
              </div>

            </div>
          </Reveal>
        </div>

        {relatedProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 md:px-8 lg:px-24 py-12 border-t">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#dc6fd6]">You may also like</p>
                <h2 className="mt-2 text-2xl font-black text-gray-950">สินค้าที่ใกล้เคียงกัน</h2>
              </div>
              <Link href={`/products?category=${product.category || 'all'}`} className="hidden items-center gap-2 text-sm font-bold text-gray-500 transition-colors hover:text-[#dc6fd6] sm:flex">
                ดูสินค้าเพิ่ม
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {relatedProducts.map((related) => {
                const relatedDiscount = Number(related.discount_percent || 0);
                const relatedPrice = Number(related.price || 0);
                const relatedSalePrice = relatedDiscount > 0
                  ? Math.round(relatedPrice * (1 - relatedDiscount / 100))
                  : relatedPrice;
                const relatedImage = related.images?.[0] || related.image;

                return (
                  <Link
                    key={related.id}
                    href={`/product/${related.id}`}
                    className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                      {relatedImage ? (
                        <img
                          src={relatedImage}
                          alt={related.nameEN}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">No image</div>
                      )}
                      {relatedDiscount > 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                          -{relatedDiscount}%
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="line-clamp-1 text-sm font-black text-gray-950 transition-colors group-hover:text-[#dc6fd6]">{related.nameEN}</h3>
                      <p className="mt-1 line-clamp-1 text-xs text-gray-500">{related.nameTH}</p>
                      <div className="mt-2 flex items-center gap-2">
                        {relatedDiscount > 0 && (
                          <span className="text-xs text-gray-400 line-through">฿{formatPrice(relatedPrice)}</span>
                        )}
                        <span className="text-sm font-black text-[#dc6fd6]">฿{formatPrice(relatedSalePrice)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* 🌟 ส่วนรีวิวสินค้า */}
        <section id="reviews" className="max-w-7xl mx-auto px-4 md:px-8 lg:px-24 py-12 border-t">
          <ProductReviews productId={productId} />
        </section>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-100 bg-white/95 px-4 py-3 shadow-lg backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-gray-500">ไซส์ {selectedSize} · {quantity} ชิ้น</p>
            <p className="text-base font-black text-[#dc6fd6]">฿{formatPrice(salePrice * quantity)}</p>
          </div>
        <MotionButton
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`h-12 min-w-40 rounded-xl px-5 text-sm font-bold text-white transition-colors ${
              isOutOfStock ? 'cursor-not-allowed bg-gray-300' : 'bg-zinc-900 hover:bg-zinc-800'
            }`}
          >
            {isOutOfStock ? 'สินค้าหมด' : 'ใส่ตะกร้า'}
          </MotionButton>
        </div>
      </div>

      {/* 🌟 Pop-up Modal แจ้งเตือนให้เข้าสู่ระบบ (สวยงาม) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-6 mt-2">
              <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#dc6fd6]">
                <Heart size={32} fill="currentColor" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">เข้าสู่ระบบก่อนน้า ❤️</h3>
              <p className="text-sm text-gray-500">กรุณาเข้าสู่ระบบเพื่อบันทึกสินค้าลงในรายการโปรด (Wishlist) ของคุณ</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
              >
                ปิด
              </button>
              <button
                onClick={() => router.push('/login')}
                className="flex-1 py-3 px-4 bg-[#dc6fd6] text-white rounded-xl text-sm font-semibold hover:bg-[#c05ca8] transition-colors cursor-pointer shadow-md"
              >
                ไปหน้าเข้าสู่ระบบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📏 Pop-up Modal แสดงขนาดเสื้อ */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-4 md:p-6 max-w-2xl w-full shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-auto">
            <button
              onClick={() => setShowSizeGuide(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer z-10"
            >
              <X size={24} />
            </button>
            <div className="mb-5 pr-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#dc6fd6]">Size Guide</p>
              <h3 className="mt-2 text-2xl font-black text-gray-900">ตารางขนาดสินค้า</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                หน่วยเป็นเซนติเมตร ขนาดจริงอาจคลาดเคลื่อน 1-2 ซม. ถ้าอยู่ระหว่างสองไซส์ แนะนำเลือกไซส์ใหญ่กว่า
              </p>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="min-w-[560px] w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-black uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-4 py-3">ไซส์</th>
                    <th className="px-4 py-3">รอบอก</th>
                    <th className="px-4 py-3">เอว</th>
                    <th className="px-4 py-3">สะโพก</th>
                    <th className="px-4 py-3">ความยาว</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sizeGuideRows.map((row) => (
                    <tr key={row.size} className={row.size === selectedSize ? 'bg-pink-50/70' : 'bg-white'}>
                      <td className="px-4 py-3 font-black text-gray-950">{row.size}</td>
                      <td className="px-4 py-3 text-gray-600">{row.bust}</td>
                      <td className="px-4 py-3 text-gray-600">{row.waist}</td>
                      <td className="px-4 py-3 text-gray-600">{row.hip}</td>
                      <td className="px-4 py-3 text-gray-600">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">
              <p className="font-bold text-gray-900">คำแนะนำ</p>
              <p className="mt-1">เลือกจากรอบอก/เอวเป็นหลักสำหรับเสื้อ และเพิ่มสะโพกสำหรับเดรสหรือเซ็ต</p>
            </div>
            <div className="mt-5 text-center">
              <button
                onClick={() => setShowSizeGuide(false)}
                className="px-6 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
