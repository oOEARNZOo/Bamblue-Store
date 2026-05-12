"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { shopToast } from "@/frontend/utils/toast";

const CartContext = createContext();

const CART_STORAGE_KEY = "bamblue_cart";
const PRODUCT_SIZES = ["S", "M", "L", "XL"];

const getDefaultCartSize = (product) => {
  if (product?.size) return product.size;

  const firstAvailableSize = PRODUCT_SIZES.find((size) => Number(product?.size_stock?.[size] ?? 0) > 0);
  return firstAvailableSize || "M";
};

const getSizeStockLimit = (item) => {
  const size = item?.size || "M";
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

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cartItems, isInitialized]);

  const addToCart = (product) => {
    const quantityToAdd = Math.max(1, Number(product.quantity) || 1);
    const size = getDefaultCartSize(product);
    const stockLimit = getSizeStockLimit({ ...product, size });

    if (stockLimit !== null && stockLimit <= 0) {
      shopToast.stockOut(size);
      return false;
    }

    const cartKey = `${product.id}-${size}`;
    const existingItem = cartItems.find((item) => item.cartKey === cartKey);
    const existingQuantity = existingItem ? Number(existingItem.quantity) || 0 : 0;
    const nextQuantity = existingQuantity + quantityToAdd;

    if (stockLimit !== null && nextQuantity > stockLimit) {
      shopToast.stockLimit(size, stockLimit);
      return false;
    }

    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.cartKey === cartKey);

      if (existingItemIndex !== -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: nextQuantity,
          stockLimit
        };
        return updatedItems;
      }

      return [...prevItems, { ...product, cartKey, size, quantity: quantityToAdd, stockLimit }];
    });

    shopToast.cartAdded({
      name: product.nameTH || product.nameEN,
      size,
      quantity: quantityToAdd
    });
    return true;
  };

  const updateQuantity = (cartKey, amount) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.cartKey !== cartKey) return item;

        const stockLimit = getSizeStockLimit(item);
        const requestedQuantity = Math.max(1, item.quantity + amount);

        if (stockLimit !== null && requestedQuantity > stockLimit) {
          shopToast.stockLimit(item.size || "M", stockLimit);
          return { ...item, quantity: Math.max(1, stockLimit), stockLimit };
        }

        const newQuantity = stockLimit === null
          ? requestedQuantity
          : Math.min(requestedQuantity, Math.max(1, stockLimit));

        return { ...item, quantity: newQuantity };
      })
    );
  };

  const removeFromCart = (cartKey) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.cartKey !== cartKey));
    shopToast.cartRemoved();
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getItemStockLimit: getSizeStockLimit }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within <CartProvider>");
  }
  return context;
}
