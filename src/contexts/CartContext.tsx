'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  tshirt: {
    id: string;
    label: string;
    title?: string;
    description?: string;
    price: number;
    color: string;
    preview_front_url?: string;
    preview_back_url?: string;
    profiles?: {
      first_name?: string;
      last_name?: string;
      email?: string;
    };
  };
  size: string;
  quantity: number;
  addedAt: Date;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (tshirt: any, size?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateSize: (itemId: string, size: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (tshirtId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('t4u-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Convert addedAt back to Date objects
        const cartWithDates = parsedCart.map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
        setItems(cartWithDates);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('t4u-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (tshirt: any, size: string = 'M') => {
    setItems(prevItems => {
      // Check if item already exists with same size
      const existingItem = prevItems.find(item => 
        item.tshirt.id === tshirt.id && item.size === size
      );
      
      if (existingItem) {
        // Update quantity
        return prevItems.map(item =>
          item.tshirt.id === tshirt.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          id: `${tshirt.id}-${size}-${Date.now()}`,
          tshirt,
          size,
          quantity: 1,
          addedAt: new Date()
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const updateSize = (itemId: string, size: string) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, size } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.tshirt.price * item.quantity), 0);
  };

  const isInCart = (tshirtId: string) => {
    return items.some(item => item.tshirt.id === tshirtId);
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateSize,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
