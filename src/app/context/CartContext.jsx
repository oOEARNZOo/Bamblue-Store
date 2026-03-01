"use client";

import { createContext, useState, useContext } from "react";
import toast from 'react-hot-toast'; 

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // 🌟 ฟังก์ชันเพิ่มสินค้าลงตะกร้า (จากหน้าสินค้า)
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