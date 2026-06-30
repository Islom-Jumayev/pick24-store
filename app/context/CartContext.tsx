"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Product = {
  id: number;
  name: string;
  price: number;
  priceText: string;
  description?: string;
  image: string;
  quantity?: number;
  shop_id?: string;
};

type CartContextType = {
  cartItems: Product[];
  cartCount: number;
  addToCart: (product: Product) => void;
  removeFromCart: (index: number) => void;
  decreaseQuantity: (index: number) => void;
  clearCart: () => void;
  showToast: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (val: boolean) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      // Agar mahsulot allaqachon savatda bo'lsa, sonini oshirish
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      
      if (existingIndex !== -1) {
        // Mahsulot bor, sonini oshirish
        const newItems = [...prev];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: (newItems[existingIndex].quantity || 1) + 1
        };
        return newItems;
      } else {
        // Yangi mahsulot, soni 1
        return [...prev, { ...product, quantity: 1 }];
      }
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const removeFromCart = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const decreaseQuantity = (index: number) => {
    setCartItems((prev) => {
      const newItems = [...prev];
      const currentQty = newItems[index].quantity || 1;
      
      if (currentQty <= 1) {
        // Soni 1 bo'lsa, butunlay o'chirish
        return prev.filter((_, i) => i !== index);
      } else {
        // Sonini kamaytirish
        newItems[index] = {
          ...newItems[index],
          quantity: currentQty - 1
        };
        return newItems;
      }
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Umumiy sonni hisoblash (quantity'larni qo'shish)
  const totalQuantity = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      cartCount: totalQuantity, 
      addToCart, 
      removeFromCart, 
      decreaseQuantity, 
      clearCart, 
      showToast, 
      isCartOpen, 
      setIsCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}