"use client";

import { createContext, useState, useContext, useEffect } from "react";
import limitedToast from '../../lib/toast';

const WishlistContext = createContext();

const WISHLIST_STORAGE_KEY = 'bamblue_wishlist';

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // โหลดข้อมูล wishlist จาก localStorage เมื่อเริ่มต้น
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
    }
    setIsInitialized(true);
  }, []);

  // บันทึกข้อมูล wishlist ลง localStorage ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
      } catch (error) {
        console.error('Error saving wishlist to localStorage:', error);
      }
    }
  }, [wishlistItems, isInitialized]);

  // เพิ่มสินค้าลง Wishlist
  const addToWishlist = (product) => {
    setWishlistItems((prevItems) => {
      const isExist = prevItems.find((item) => item.id === product.id);
      if (isExist) {
        limitedToast.default('สินค้านี้อยู่ในรายการโปรดแล้ว', {
          id: `wishlist-exist-${product.id}`,
          icon: '💖',
          style: { border: '1px solid #f472b6' }
        });
        return prevItems;
      }
      limitedToast.success(`เพิ่ม ${product.nameEN} ลงรายการโปรดแล้ว!`, {
        id: `wishlist-add-${product.id}`
      });
      return [...prevItems, product];
    });
  };

  // ลบสินค้าออกจาก Wishlist
  const removeFromWishlist = (productId) => {
    setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    limitedToast.default('ลบสินค้าออกจากรายการโปรดแล้ว', {
      id: `wishlist-remove-${productId}`,
      icon: '🗑️',
      style: { border: '1px solid #e4e4e7' }
    });
  };

  // เช็คว่าสินค้าอยู่ใน Wishlist หรือไม่
  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist ต้องถูกใช้งานอยู่ภายใต้ <WishlistProvider> เท่านั้นครับ!");
  }
  return context;
}
