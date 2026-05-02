"use client";

import { createContext, useState, useContext, useEffect } from "react";
import limitedToast from '../../lib/toast'; 

const CartContext = createContext();

const CART_STORAGE_KEY = 'bamblue_cart';
const PRODUCT_SIZES = ['S', 'M', 'L', 'XL'];

const getDefaultCartSize = (product) => {
  if (product?.size) return product.size;

  const firstAvailableSize = PRODUCT_SIZES.find((size) => Number(product?.size_stock?.[size] ?? 0) > 0);
  return firstAvailableSize || 'M';
};

const getSizeStockLimit = (item) => {
  const size = item?.size || 'M';
  const stockBySize = item?.size_stock?.[size];

  if (stockBySize !== undefined && stockBySize !== null) {
    const parsedStock = Number(stockBySize);
    return Number.isFinite(parsedStock) ? Math.max(0, parsedStock) : null;
  }

  const fallbackStock = item?.stockLimit ?? item?.maxQuantity ?? item?.stock;

  if (fallbackStock !== undefined && fallbackStock !== null) {
    const parsedStock = Number(fallbackStock);
    return Number.isFinite(parsedStock) ? Math.max(0, parsedStock) : null;
  }

  return null;
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // โหลดข้อมูล cart จาก localStorage เมื่อเริ่มต้น
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    setIsInitialized(true);
  }, []);

  // บันทึกข้อมูล cart ลง localStorage ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [cartItems, isInitialized]);

  // ฟังก์ชันเพิ่มสินค้าลงตะกร้า (จากหน้าสินค้า)
  // รองรับ quantity และ size จากหน้าสินค้า
  const addToCart = (product) => {
    const quantityToAdd = Math.max(1, Number(product.quantity) || 1);
    const size = getDefaultCartSize(product);
    const stockLimit = getSizeStockLimit({ ...product, size });

    if (stockLimit !== null && stockLimit <= 0) {
      limitedToast.error(`ไซส์ ${size} หมดสต็อกแล้ว`);
      return false;
    }

    // ใช้ cartKey เป็น id + size เพื่อให้สินค้าเดียวกันแต่ต่างไซส์เป็นคนละรายการ
    const cartKey = `${product.id}-${size}`;
    const existingItem = cartItems.find((item) => item.cartKey === cartKey);
    const existingQuantity = existingItem ? Number(existingItem.quantity) || 0 : 0;
    const nextQuantity = existingQuantity + quantityToAdd;

    if (stockLimit !== null && nextQuantity > stockLimit) {
      limitedToast.error(`ไซส์ ${size} มีสินค้าในสต็อกเพียง ${stockLimit} ตัว`);
      return false;
    }

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.cartKey === cartKey);

      if (existingItemIndex !== -1) {
        // ถ้ามีสินค้าเดียวกัน (id + size) อยู่แล้ว ให้เพิ่มจำนวน
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: nextQuantity,
          stockLimit
        };
        return updatedItems;
      } else {
        // ถ้ายังไม่มี ให้เพิ่มใหม่พร้อม cartKey
        return [...prevItems, { ...product, cartKey, size, quantity: quantityToAdd, stockLimit }];
      }
    });
    limitedToast.success(`เพิ่ม ${product.nameEN} (${size}) x${quantityToAdd} ลงตะกร้าแล้ว!`);
    return true;
  };

  // ฟังก์ชันบวก/ลบจำนวนสินค้าในหน้าตะกร้า (ใช้ cartKey)
  const updateQuantity = (cartKey, amount) => {
    setCartItems((prevItems) => 
      prevItems.map((item) => {
        if (item.cartKey === cartKey) {
          const stockLimit = getSizeStockLimit(item);
          const requestedQuantity = Math.max(1, item.quantity + amount);

          if (stockLimit !== null && requestedQuantity > stockLimit) {
            limitedToast.error(`ไซส์ ${item.size || 'M'} มีสินค้าในสต็อกเพียง ${stockLimit} ตัว`);
            return { ...item, quantity: Math.max(1, stockLimit), stockLimit };
          }

          const newQuantity = stockLimit === null
            ? requestedQuantity
            : Math.min(requestedQuantity, Math.max(1, stockLimit));

          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // ฟังก์ชันลบสินค้าออกจากตะกร้าเลย (ใช้ cartKey)
  const removeFromCart = (cartKey) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartKey !== cartKey));
    limitedToast.default('ลบสินค้าออกจากตะกร้าแล้ว', {
      icon: '🗑️',
      style: { border: '1px solid #e4e4e7' }
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // อย่าลืมส่ง updateQuantity ออกไปให้หน้าอื่นใช้งานด้วย
  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getItemStockLimit: getSizeStockLimit }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart ต้องถูกใช้งานอยู่ภายใต้ <CartProvider> เท่านั้นครับ!");
  }
  return context;
}
