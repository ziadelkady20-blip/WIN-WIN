"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: number;
  slug: string;
  nameNl: string;
  nameEn: string;
  pricePerKg: number;
  unit: string;
  image: string;
  quantity: number; // in kg
}

export interface AppliedCoupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  totalItemsCount: number;
  appliedCoupon: AppliedCoupon | null;
  couponError: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  freeDeliveryThreshold: number;
  defaultDeliveryFee: number;
  amountNeededForFreeDelivery: number;
  isFreeDelivery: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(35.00);
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState<number>(4.95);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("winwin_cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedCoupon = localStorage.getItem("winwin_coupon");
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    } catch (e) {
      console.error("Error reading cart from localStorage", e);
    }
    setIsLoaded(true);

    // Fetch delivery settings dynamically
    fetch("/api/delivery-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.freeDeliveryThreshold) {
          setFreeDeliveryThreshold(parseFloat(data.freeDeliveryThreshold));
        }
        if (data?.deliveryFee) {
          setDefaultDeliveryFee(parseFloat(data.deliveryFee));
        }
      })
      .catch(() => {
        // Fallback to default €35 and €4.95
      });
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("winwin_cart", JSON.stringify(items));
      if (appliedCoupon) {
        localStorage.setItem("winwin_coupon", JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem("winwin_coupon");
      }
    } catch (e) {
      console.error("Error saving cart to localStorage", e);
    }
  }, [items, appliedCoupon, isLoaded]);

  const addToCart = (product: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.round((item.quantity + quantity) * 100) / 100 }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.round(quantity * 100) / 100 } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError(null);
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return false;

    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(cleanCode)}&subtotal=${subtotal}`);
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponError(data.error || "Ongeldige couponcode");
        return false;
      }
      setAppliedCoupon({
        code: data.coupon.code,
        discountType: data.coupon.discountType,
        discountValue: parseFloat(data.coupon.discountValue),
      });
      return true;
    } catch {
      setCouponError("Fout bij valideren van couponcode");
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.pricePerKg * item.quantity,
    0
  );

  const isFreeDelivery = items.length > 0 && subtotal >= freeDeliveryThreshold;
  const deliveryFee = items.length === 0 ? 0 : isFreeDelivery ? 0 : defaultDeliveryFee;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = Math.min(subtotal, appliedCoupon.discountValue);
    }
  }

  const total = Math.max(0, subtotal - discountAmount + deliveryFee);
  const totalItemsCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        subtotal: Math.round(subtotal * 100) / 100,
        deliveryFee: Math.round(deliveryFee * 100) / 100,
        discountAmount: Math.round(discountAmount * 100) / 100,
        total: Math.round(total * 100) / 100,
        totalItemsCount: Math.round(totalItemsCount * 10) / 10,
        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
        freeDeliveryThreshold,
        defaultDeliveryFee,
        amountNeededForFreeDelivery: Math.round(amountNeededForFreeDelivery * 100) / 100,
        isFreeDelivery,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
