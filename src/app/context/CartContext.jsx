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
  const addToCart = (product) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === product.id);

      if (existingItemIndex !== -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
    toast.success(`เพิ่ม ${product.nameEN} ลงตะกร้าแล้ว!`);
  };

  // 🌟 [ใหม่!] ฟังก์ชันบวก/ลบจำนวนสินค้าในหน้าตะกร้า
  const updateQuantity = (productId, amount) => {
    setCartItems((prevItems) => 
      prevItems.map((item) => {
        if (item.id === productId) {
          // คำนวณจำนวนใหม่ แต่บังคับว่าต้องไม่ต่ำกว่า 1
          const newQuantity = Math.max(1, item.quantity + amount);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  // 🌟 ฟังก์ชันลบสินค้าออกจากตะกร้าเลย (ปุ่ม REMOVE)
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    toast('ลบสินค้าออกจากตะกร้าแล้ว', {
      icon: '🗑️',
      style: { border: '1px solid #e4e4e7' }
    });
  };

  // 🌟 อย่าลืมส่ง updateQuantity ออกไปให้หน้าอื่นใช้งานด้วย
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