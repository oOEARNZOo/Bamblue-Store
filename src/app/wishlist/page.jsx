"use client";
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (item) => {
    const cartProduct = {
      ...item,
      price: item.price.replace(/[^0-9]/g, ''),
    };
    addToCart(cartProduct);
    removeFromWishlist(item.id);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {/* รูปสินค้า */}
                  <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
                    <Link href={`/product/${item.id}`}>
                      <img
                        src={item.image}
                        alt={item.nameEN}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    {/* ปุ่มลบออกจาก Wishlist */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm hover:bg-red-50 transition-colors cursor-pointer group/btn"
                      title="ลบออกจากรายการโปรด"
                    >
                      <Heart
                        size={18}
                        className="text-[#dc6fd6] fill-[#dc6fd6] group-hover/btn:text-red-500 group-hover/btn:fill-red-500 transition-colors"
                      />
                    </button>
                  </div>

                  {/* รายละเอียดสินค้า */}
                  <div className="p-4">
                    <Link href={`/product/${item.id}`}>
                      <h3 className="text-sm font-bold text-zinc-800 mb-1 line-clamp-1 hover:text-[#dc6fd6] transition-colors">
                        {item.nameEN}
                      </h3>
                    </Link>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-1">{item.nameTH}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-zinc-900">{item.price}</span>
                        {item.oldPrice && (
                          <span className="text-xs text-gray-400 line-through">{item.oldPrice}</span>
                        )}
                      </div>
                    </div>

                    {/* ปุ่มย้ายลงตะกร้า + ลบ */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#dc6fd6] hover:bg-[#c05ca8] text-white py-2.5 rounded-lg text-xs font-bold tracking-wider transition-colors cursor-pointer"
                      >
                        <ShoppingCart size={14} />
                        ย้ายลงตะกร้า
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="flex items-center justify-center px-3 py-2.5 border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer"
                        title="ลบ"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
