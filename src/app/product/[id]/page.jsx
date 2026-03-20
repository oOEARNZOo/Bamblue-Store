"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Heart, Share2, Truck, RefreshCcw, Minus, Plus, X } from 'lucide-react'; // เพิ่ม X ไอคอน
import Link from 'next/link';
import Image from 'next/image';
import ProductReviews from '../../components/ProductReviews';
import { supabase } from '../../../lib/supabase';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id;
  const router = useRouter();

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [mainImage, setMainImage] = useState(null);

  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // State สำหรับเปิด/ปิด Pop-up แจ้งเตือนให้ Login
  const [showLoginModal, setShowLoginModal] = useState(false);
  // State สำหรับเปิด/ปิด Pop-up แจ้งเตือนว่าเพิ่มสำเร็จ
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    async function fetchSingleProduct() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('products1')
          .select('*')
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
    }
  }, [productId]);

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

  const sizes = ['S', 'M', 'L', 'XL'];
  const skuCode = `BMB-${product.id}00${selectedSize}`;

  const handleAddToCart = () => {
    addToCart({
      ...product,
      image: mainImage,
      size: selectedSize,
      quantity: quantity
    });
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <>
      <main className="min-h-screen bg-white pb-20 pt-10">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-xs text-gray-500 mb-8 tracking-wide">
            <Link href="/" className="cursor-pointer hover:text-[#dc6fd6]">Home</Link> /
            <span className="mx-2 cursor-pointer hover:text-[#dc6fd6]">Products</span> /
            <span className="text-gray-900">{product.nameEN}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* ฝั่งซ้าย: รูปภาพสินค้า */}
            <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
              <div className="flex md:flex-col gap-4 overflow-x-auto md:w-24 shrink-0">
                <button className="cursor-pointer w-20 h-28 md:w-full md:h-32 border-2 border-[#dc6fd6] overflow-hidden">
                  <img src={product.image} className="w-full h-full object-cover" alt={product.nameEN} />
                </button>
              </div>

              <div
                className="grow bg-gray-100 aspect-3/4 md:aspect-auto overflow-hidden relative cursor-zoom-in"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                {mainImage && (
                  <img
                    src={mainImage}
                    className="w-full h-full object-cover transition-transform duration-200 ease-out"
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
            <div className="lg:col-span-5 flex flex-col pt-4">
              <p className="text-sm text-gray-500 mb-1">{product.nameTH}</p>
              <h1 className="text-3xl font-bold text-zinc-900 mb-2 tracking-wide">{product.nameEN}</h1>
              <p className="text-xs text-gray-400 mb-6">SKU: {skuCode}</p>

              <div className="flex items-center space-x-3 mb-8">
                <span className="text-2xl font-bold text-[#dc6fd6]">
                  ฿{product.price ? product.price.toLocaleString() : 0}
                </span>
              </div>

              <hr className="border-gray-100 mb-8" />

              {/* ส่วนเลือกไซส์ */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold tracking-wide">ไซส์</span>
                  <button className="cursor-pointer text-xs text-gray-500 underline hover:text-[#dc6fd6]">ขนาดสินค้า</button>
                </div>
                <div className="flex space-x-3">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`cursor-pointer w-12 h-12 rounded-full border flex items-center justify-center text-sm transition-all
                        ${selectedSize === s ? 'bg-zinc-900 text-white border-zinc-900' : 'border-gray-300 text-gray-600 hover:border-zinc-900'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* ส่วนเลือกจำนวน */}
              <div className="mb-10">
                <span className="text-sm font-semibold tracking-wide block mb-3">จำนวน</span>
                <div className="flex items-center border border-gray-300 w-32 rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="cursor-pointer w-10 h-10 flex items-center justify-center text-gray-600 hover:text-[#dc6fd6]"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="text"
                    readOnly
                    value={quantity}
                    className="w-12 h-10 text-center text-sm font-semibold focus:outline-none cursor-default"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="cursor-pointer w-10 h-10 flex items-center justify-center text-gray-600 hover:text-[#dc6fd6]"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* ปุ่ม Wishlist และ Add to cart */}
              <div className="flex space-x-4 mb-10">
                <button 
                  onClick={handleAddWishlist}
                  className={`cursor-pointer w-14 h-14 border rounded flex items-center justify-center transition-colors shrink-0 ${isInWishlist(product.id) ? 'border-[#dc6fd6] text-[#dc6fd6] bg-pink-50' : 'border-gray-300 text-gray-600 hover:border-[#dc6fd6] hover:text-[#dc6fd6]'}`}
                >
                  <Heart size={24} strokeWidth={1.5} className={isInWishlist(product.id) ? 'fill-[#dc6fd6]' : ''} />
                </button>
                
                <button
                  onClick={handleAddToCart}
                  className="cursor-pointer grow bg-zinc-900 hover:bg-zinc-800 text-white rounded text-sm tracking-widest font-semibold transition-colors flex items-center justify-center"
                >
                  ใส่ตะกร้า
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-8">
                <span className="text-sm text-gray-500">แชร์สินค้า:</span>
                <button className="cursor-pointer text-gray-400 hover:text-[#dc6fd6]"><Share2 size={18} /></button>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
          </div>
        </div>

        {/* 🌟 ส่วนรีวิวสินค้า */}
        <section id="reviews" className="max-w-7xl mx-auto px-4 md:px-8 lg:px-24 py-12 border-t">
          <ProductReviews productId={productId} />
        </section>
      </main>

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

      {/* 🌟 Pop-up Toast แจ้งเตือนเมื่อเพิ่มลง Wishlist สำเร็จ */}
      {showSuccessModal && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <Heart size={18} className="text-[#dc6fd6]" fill="currentColor" />
          <span className="text-sm font-medium tracking-wide">เพิ่มลงรายการโปรดเรียบร้อย! ✨</span>
        </div>
      )}
    </>
  );
}