"use client";

import { createContext, useState, useContext, useEffect } from "react";
import toast from 'react-hot-toast'; 

const CartContext = createContext();

const CART_STORAGE_KEY = 'bamblue_cart';

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
    const quantityToAdd = product.quantity || 1;
    const size = product.size || 'M';
    // ใช้ cartKey เป็น id + size เพื่อให้สินค้าเดียวกันแต่ต่างไซส์เป็นคนละรายการ
    const cartKey = `${product.id}-${size}`;

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.cartKey === cartKey);

      if (existingItemIndex !== -1) {
        // ถ้ามีสินค้าเดียวกัน (id + size) อยู่แล้ว ให้เพิ่มจำนวน
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantityToAdd
        };
        return updatedItems;
      } else {
        // ถ้ายังไม่มี ให้เพิ่มใหม่พร้อม cartKey
        return [...prevItems, { ...product, cartKey, size, quantity: quantityToAdd }];
      }
    });
    toast.success(`เพิ่ม ${product.nameEN} (${size}) x${quantityToAdd} ลงตะกร้าแล้ว!`);
  };

  // ฟังก์ชันบวก/ลบจำนวนสินค้าในหน้าตะกร้า (ใช้ cartKey)
  const updateQuantity = (cartKey, amount) => {
    setCartItems((prevItems) => 
      prevItems.map((item) => {
        if (item.cartKey === cartKey) {
          const newQuantity = Math.max(1, item.quantity + amount);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // ฟังก์ชันลบสินค้าออกจากตะกร้าเลย (ใช้ cartKey)
  const removeFromCart = (cartKey) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartKey !== cartKey));
    toast('ลบสินค้าออกจากตะกร้าแล้ว', {
      icon: '🗑️',
      style: { border: '1px solid #e4e4e7' }
    });
  };

  // อย่าลืมส่ง updateQuantity ออกไปให้หน้าอื่นใช้งานด้วย
  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity }}>
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