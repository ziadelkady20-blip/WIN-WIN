"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/i18n";
import { Badge } from "./Badge";
import { Check, ShoppingBag, Plus, Minus, MapPin } from "lucide-react";

export interface ProductCardProps {
  product: {
    id: number;
    slug: string;
    nameNl: string;
    nameEn: string;
    descriptionNl?: string | null;
    descriptionEn?: string | null;
    pricePerKg: string | number;
    salePricePerKg?: string | number | null;
    unit?: string;
    mainImage: string;
    origin?: string | null;
    badges?: string[] | null;
    stockStatus?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { lang, t } = useLanguage();
  const { addToCart } = useCart();
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const name = lang === "nl" ? product.nameNl : (product.nameEn || product.nameNl);
  const price = product.salePricePerKg ? parseFloat(String(product.salePricePerKg)) : parseFloat(String(product.pricePerKg));
  const originalPrice = product.salePricePerKg ? parseFloat(String(product.pricePerKg)) : null;
  const isOutOfStock = product.stockStatus === "out_of_stock";
  const isPiece = product.unit === "piece" || product.unit === "stuk";
  const unitLabel = isPiece ? (lang === "nl" ? "stuk" : "piece") : (product.unit || "kg");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addToCart(
      {
        id: product.id,
        slug: product.slug,
        nameNl: product.nameNl,
        nameEn: product.nameEn,
        pricePerKg: price,
        unit: product.unit || "piece",
        image: product.mainImage,
      },
      selectedQuantity
    );

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleQuantityStep = (delta: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-stone-200/80 hover:border-emerald-700/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-stone-200/50 overflow-hidden">
      <Link href={`/product/${product.slug}`} className="relative aspect-[1.15/1] w-full overflow-hidden bg-[#f5f3eb] block">
        <img
          src={product.mainImage}
          alt={name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          {product.badges && product.badges.map((b) => <Badge key={b} type={b} />)}
        </div>
        {product.origin && (
          <div className="absolute bottom-2 left-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-full text-[11px] font-medium text-stone-700 shadow-2xs">
            <MapPin className="w-3 h-3 text-emerald-700" />
            <span>{product.origin}</span>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-stone-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {t.shop.outOfStock}
            </span>
          </div>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-4 sm:p-4.5">
        <Link href={`/product/${product.slug}`} className="group-hover:text-emerald-800 transition-colors">
          <h3 className="font-semibold text-stone-900 text-base leading-snug line-clamp-1">{name}</h3>
        </Link>

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-lg font-bold text-emerald-900">
            {formatPrice(price, lang)}
            <span className="text-xs font-normal text-stone-500 ml-1">/{unitLabel}</span>
          </span>
          {originalPrice && <span className="text-xs text-stone-400 line-through">{formatPrice(originalPrice, lang)}</span>}
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-2">
          <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50/70 p-0.5">
            <button
              type="button"
              onClick={(e) => handleQuantityStep(-1, e)}
              disabled={selectedQuantity <= 1 || isOutOfStock}
              className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white rounded transition-colors"
              title={lang === "nl" ? "Minder stuks" : "Fewer pieces"}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-14 text-center text-xs font-semibold text-stone-800 tabular-nums">
              {selectedQuantity} {unitLabel}
            </span>
            <button
              type="button"
              onClick={(e) => handleQuantityStep(1, e)}
              disabled={isOutOfStock}
              className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white rounded transition-colors"
              title={lang === "nl" ? "Meer stuks" : "More pieces"}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex-1 h-9 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-all duration-200 ${
              justAdded
                ? "bg-emerald-600 text-white"
                : isOutOfStock
                ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                : "bg-emerald-800 hover:bg-emerald-900 text-white active:scale-95 shadow-2xs hover:shadow-xs"
            }`}
          >
            {justAdded ? (
              <><Check className="w-3.5 h-3.5 stroke-[2.5]" /><span>{t.product.addedToCart}</span></>
            ) : (
              <><ShoppingBag className="w-3.5 h-3.5" /><span>{t.shop.addToCart}</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
