"use client";

import { CartProvider } from "@/frontend/context/CartContext";
import { WishlistProvider } from "@/frontend/context/WishlistContext";

export default function Providers({ children }) {
  return (
    <CartProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </CartProvider>
  );
}
