"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useCart } from '../../context/CartContext'; // แก้ Path แล้ว
import { Heart, Share2, Truck, RefreshCcw, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { productsData } from '../../../data/products';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params?.id; 

  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [mainImage, setMainImage] = useState(null);

  // 🔍 เพิ่ม State สำหรับระบบซูมรูป
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const product = productsData.find((p) => String(p.id) === String(productId));

  useEffect(() => {
    if (product) {
      setMainImage(product.images && product.images.length > 0 ? product.images[0] : product.image);
    }
  }, [product]);

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
    for (let i = 0; i < quantity; i++) {
        addToCart({ ...product, image: mainImage });
    }
  };

  // 🎯 ฟังก์ชันจับตำแหน่งเมาส์เวลาเลื่อนบนรูป (ใช้สำหรับซูม)
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <main className="min-h-screen bg-white pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-xs text-gray-500 mb-8 tracking-wide">
          <Link href="/" className="cursor-pointer hover:text-pink-400">Home</Link> / 
          <span className="mx-2 cursor-pointer hover:text-pink-400">Products</span> / 
          <span className="text-gray-900">{product.nameEN}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* 🖼️ ฝั่งซ้าย: รูปภาพสินค้า */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            <div className="flex md:flex-col gap-4 overflow-x-auto md:w-24 shrink-0">
              {product.images && product.images.length > 0 ? product.images.map((img, index) => (
                <button 
                  key={index} 
                  onClick={() => setMainImage(img)}
                  className={`cursor-pointer w-20 h-28 md:w-full md:h-32 border-2 overflow-hidden ${mainImage === img ? 'border-pink-400' : 'border-transparent hover:border-gray-200'} transition-all`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`${product.nameEN}-${index}`} />
                </button>
              )) : (
                <button className="cursor-pointer w-20 h-28 md:w-full md:h-32 border-2 border-pink-400 overflow-hidden">
                   <img src={product.image} className="w-full h-full object-cover" alt={product.nameEN} />
                </button>
              )}
            </div>
            
            {/* 🔍 กล่องรูปภาพหลักที่ใส่ระบบซูม */}
            <div 
              className="grow bg-gray-100 aspect-3/4 md:aspect-auto overflow-hidden cursor-zoom-in relative"
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
                    transform: isZoomed ? 'scale(2.5)' : 'scale(1)' // ปรับเลข 2.5 ตรงนี้เพื่อลด/เพิ่มความซูม
                  }}
                />
              )}
            </div>
          </div>

          {/* 📝 ฝั่งขวา: รายละเอียดสินค้า */}
          <div className="lg:col-span-5 flex flex-col pt-4">
            <p className="text-sm text-gray-500 mb-1">{product.nameTH}</p>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2 tracking-wide">{product.nameEN}</h1>
            <p className="text-xs text-gray-400 mb-6">SKU: {skuCode}</p>

            <div className="flex items-center space-x-3 mb-8">
              <span className="text-2xl font-bold text-pink-500">{product.price}</span>
              {product.oldPrice && (
                <span className="text-sm text-gray-400 line-through">{product.oldPrice}</span>
              )}
            </div>

            <hr className="border-gray-100 mb-8" />

            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold tracking-wide">ไซส์</span>
                <button className="cursor-pointer text-xs text-gray-500 underline hover:text-pink-400">ขนาดสินค้า</button>
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

            <div className="mb-10">
              <span className="text-sm font-semibold tracking-wide block mb-3">จำนวน</span>
              <div className="flex items-center border border-gray-300 w-32 rounded">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="cursor-pointer w-10 h-10 flex items-center justify-center text-gray-600 hover:text-pink-400"
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
                  className="cursor-pointer w-10 h-10 flex items-center justify-center text-gray-600 hover:text-pink-400"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex space-x-4 mb-10">
              <button className="cursor-pointer w-14 h-14 border border-gray-300 rounded flex items-center justify-center text-gray-600 hover:border-pink-400 hover:text-pink-400 transition-colors shrink-0">
                <Heart size={24} strokeWidth={1.5} />
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
              <button className="cursor-pointer text-gray-400 hover:text-pink-400"><Share2 size={18} /></button>
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
    </main>
  );
}