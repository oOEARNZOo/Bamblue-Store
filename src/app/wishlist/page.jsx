"use client";
import { useState } from 'react';
import { useWishlist } from '@/frontend/context/WishlistContext';
import { useCart } from '@/frontend/context/CartContext';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, X } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [confirmRemove, setConfirmRemove] = useState(null);

  const handleRemoveWishlist = (itemId) => {
    setConfirmRemove(itemId);
  };

  const confirmRemoveWishlist = () => {
    if (confirmRemove) {
      removeFromWishlist(confirmRemove);
      setConfirmRemove(null);
    }
  };

  const handleMoveToCart = (item) => {
    const cartProduct = {
      ...item,
      price: item.price.replace(/[^0-9]/g, ''),
    };
    const added = addToCart(cartProduct);
    if (added) {
      removeFromWishlist(item.id);
    }
  };

  return (
    <main className="min-h-screen bg-white py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-widest text-zinc-900 mb-3">
            MY WISHLIST
          </h1>
          <p className="text-sm text-gray-500">
            รายการสินค้าที่คุณถูกใจ ({wishlistItems.length} ชิ้น)
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-xl">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 mb-2 tracking-wider text-sm">
              รายการโปรดของคุณยังว่างเปล่า
            </p>
            <p className="text-gray-400 text-xs mb-8">
              กดไอคอน ♡ ที่สินค้าเพื่อเพิ่มลงรายการโปรด
            </p>
            <Link
              href="/products"
              className="inline-block bg-zinc-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg text-sm tracking-widest font-semibold transition-colors"
            >
              EXPLORE PRODUCTS
            </Link>
          </div>
        ) : (
          <div>
            {/* Grid แสดงสินค้า */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative"
                >
                  {/* รูปสินค้า */}
                  <div className="relative mb-4 aspect-[3/4] bg-gray-50 overflow-hidden rounded-2xl product-card-img">
                    <Link href={`/product/${item.id}`}>
                      <img
                        src={item.image}
                        alt={item.nameEN}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    </Link>
                    {/* ปุ่มลบออกจาก Wishlist พร้อม Slide confirmation */}
                    <div className="absolute top-3 right-3">
                      <div 
                        className="flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={{
                          width: confirmRemove === item.id ? '72px' : '34px',
                        }}
                      >
                        {confirmRemove === item.id ? (
                          /* ปุ่มยกเลิก + ลบออก */
                          <div className="flex items-center gap-1 px-1 py-1 w-full animate-in fade-in duration-200">
                            <button
                              onClick={() => setConfirmRemove(null)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-[0px] text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
                              aria-label="Cancel remove"
                            >
                              <X size={14} />
                              ยกเลิก
                            </button>
                            <button
                              onClick={confirmRemoveWishlist}
                              className="flex h-7 w-7 items-center justify-center bg-red-500 text-[0px] text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                              aria-label={`Confirm remove ${item.nameEN} from wishlist`}
                            >
                              <Trash2 size={14} />
                              ลบ
                            </button>
                          </div>
                        ) : (
                          /* ปุ่มหัวใจ */
                          <button
                            onClick={() => handleRemoveWishlist(item.id)}
                            className="p-2 hover:bg-red-50 transition-colors cursor-pointer group/btn"
                            title="ลบออกจากรายการโปรด"
                          >
                            <Heart
                              size={18}
                              className="text-[#dc6fd6] fill-[#dc6fd6] group-hover/btn:text-red-500 group-hover/btn:fill-red-500 transition-colors"
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* รายละเอียดสินค้า */}
                  <div>
                    <Link href={`/product/${item.id}`}>
                      <h3 className="text-sm font-bold text-zinc-800 mb-1 line-clamp-1 hover:text-[#dc6fd6] transition-colors">
                        {item.nameEN}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-1">{item.nameTH}</p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-zinc-900">{item.price}</span>
                        {item.oldPrice && (
                          <span className="text-xs text-gray-400 line-through">{item.oldPrice}</span>
                        )}
                      </div>
                    </div>

                    {/* ปุ่มย้ายลงตะกร้า */}
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="w-full flex items-center justify-center gap-2 bg-[#dc6fd6] hover:bg-[#c05ca8] text-white py-2 rounded-lg text-xs font-bold tracking-wider transition-colors cursor-pointer"
                    >
                      <ShoppingCart size={14} />
                      ย้ายลงตะกร้า
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ส่วนล่าง */}
            <div className="mt-12 text-center">
              <Link
                href="/products"
                className="inline-block border-2 border-zinc-900 hover:bg-zinc-900 hover:text-white text-zinc-900 px-8 py-3 rounded-lg text-sm tracking-widest font-bold transition-colors"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
