"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: number;
  slug: string;
  nameNl: string;
  nameEn: string;
  pricePerKg: number;
  unit: string;
  pricingType: "piece" | "kg" | "pack";
  packQuantity: number;
  image: string;
  quantity: number;
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

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("winwin_cart");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setItems(Array.isArray(parsed) ? parsed.map((item) => ({ ...item, pricingType: item.pricingType === "kg" || item.pricingType === "pack" ? item.pricingType : (item.unit === "kg" ? "kg" : "piece"), packQuantity: Number(item.packQuantity) || 1, unit: item.unit === "kg" ? "kg" : item.pricingType === "pack" ? "pack" : "piece" })) : []);
      }
      const savedCoupon = localStorage.getItem("winwin_coupon");
      if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon));
    } catch (e) {
      console.error("Error reading cart from localStorage", e);
    }
    setIsLoaded(true);

    fetch("/api/delivery-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.freeDeliveryThreshold) setFreeDeliveryThreshold(parseFloat(data.freeDeliveryThreshold));
        if (data?.deliveryFee) setDefaultDeliveryFee(parseFloat(data.deliveryFee));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("winwin_cart", JSON.stringify(items));
      if (appliedCoupon) localStorage.setItem("winwin_coupon", JSON.stringify(appliedCoupon));
      else localStorage.removeItem("winwin_coupon");
    } catch (e) {
      console.error("Error saving cart from localStorage", e);
    }
  }, [items, appliedCoupon, isLoaded]);

  const addToCart = (product: Omit<CartItem, "quantity">, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.max(1, item.unit === "kg" ? Math.round((item.quantity + quantity) * 100) / 100 : Math.round(item.quantity + quantity)) }
            : item
        );
      }
      return [...prev, { ...product, quantity: Math.max(0.01, item.unit === "kg" ? Math.round(quantity * 100) / 100 : Math.round(quantity)) }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => item.id === id ? { ...item, quantity: Math.max(1, Math.round(quantity)) } : item)
    );
  };

  const removeItem = (id: number) => setItems((prev) => prev.filter((item) => item.id !== id));

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

  const subtotal = items.reduce((sum, item) => sum + item.pricePerKg * item.quantity, 0);
  const isFreeDelivery = items.length > 0 && subtotal >= freeDeliveryThreshold;
  const deliveryFee = items.length === 0 ? 0 : isFreeDelivery ? 0 : defaultDeliveryFee;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === "percentage") discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    else discountAmount = Math.min(subtotal, appliedCoupon.discountValue);
  }

  const total = Math.max(0, subtotal - discountAmount + deliveryFee);
  const totalItemsCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      totalItemsCount: Math.round(totalItemsCount),
      appliedCoupon,
      couponError,
      applyCoupon,
      removeCoupon,
      freeDeliveryThreshold,
      defaultDeliveryFee,
      amountNeededForFreeDelivery: Math.round(amountNeededForFreeDelivery * 100) / 100,
      isFreeDelivery,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
