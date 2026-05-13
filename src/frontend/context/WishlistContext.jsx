"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { shopToast } from "@/frontend/utils/toast";

const WishlistContext = createContext();

const WISHLIST_STORAGE_KEY = "bamblue_wishlist";

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    } catch (error) {
      console.error("Error loading wishlist from localStorage:", error);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch (error) {
      console.error("Error saving wishlist to localStorage:", error);
    }
  }, [wishlistItems, isInitialized]);

  const addToWishlist = (product) => {
    setWishlistItems((prevItems) => {
      const isExist = prevItems.some((item) => item.id === product.id);

      if (isExist) {
        shopToast.wishlistExists();
        return prevItems;
      }

      shopToast.wishlistAdded({ name: product.nameTH || product.nameEN });
      return [...prevItems, product];
    });
  };

  const removeFromWishlist = (productId) => {
    const removedItem = wishlistItems.find((item) => item.id === productId);
    setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    shopToast.wishlistRemoved({ name: removedItem?.nameTH || removedItem?.nameEN });
  };

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
    throw new Error("useWishlist must be used within <WishlistProvider>");
  }
  return context;
}
