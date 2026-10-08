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
    pricingType?: "piece" | "kg" | "pack";
    packQuantity?: number;
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
  const pricingType = product.pricingType === "kg" || product.pricingType === "pack" ? product.pricingType : (product.unit === "kg" ? "kg" : "piece");
  const isKg = pricingType === "kg";
  const isPack = pricingType === "pack";
  const packQuantity = Number(product.packQuantity) || 1;
  const unitLabel = isKg ? "kg" : isPack ? (lang === "nl" ? `pack van ${packQuantity} stuks` : `pack of ${packQuantity}`) : (lang === "nl" ? "stuk" : "piece");

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
        unit: pricingType === "kg" ? "kg" : pricingType === "pack" ? "pack" : "piece",
        pricingType,
        packQuantity,
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
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-800/20 hover:shadow-[0_18px_45px_rgba(6,78,59,0.09)]">
      <Link href={`/product/${product.slug}`} className="relative aspect-[1.18/1] w-full overflow-hidden bg-[#f4f3ed] block">
        <img
          src={product.mainImage}
          alt={name}
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.035]"
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

      <div className="flex flex-1 flex-col p-4.5 sm:p-5">
        <Link href={`/product/${product.slug}`} className="transition-colors group-hover:text-emerald-800">
          <h3 className="line-clamp-2 text-[15px] font-extrabold leading-5 text-stone-900">{name}</h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[19px] font-black tracking-tight text-[#064e3b]">
            {formatPrice(price, lang)}
            <span className="text-xs font-normal text-stone-500 ml-1">/{unitLabel}</span>
          </span>
          {originalPrice && <span className="text-xs text-stone-400 line-through">{formatPrice(originalPrice, lang)}</span>}
        </div>

        <div className="mt-5 flex items-center gap-2 border-t border-stone-100 pt-4">
          <div className="flex items-center rounded-xl border border-stone-200 bg-stone-50/80 p-0.5">
            <button
              type="button"
              onClick={(e) => handleQuantityStep(-1, e)}
              disabled={selectedQuantity <= 1 || isOutOfStock}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-600 transition-colors hover:bg-white hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-30"
              title={isKg ? (lang === "nl" ? "Minder kg" : "Fewer kg") : isPack ? (lang === "nl" ? "Minder packs" : "Fewer packs") : (lang === "nl" ? "Minder stuks" : "Fewer pieces")}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-14 text-center text-[11px] font-bold text-stone-800 tabular-nums">
              {selectedQuantity} {unitLabel}
            </span>
            <button
              type="button"
              onClick={(e) => handleQuantityStep(1, e)}
              disabled={isOutOfStock}
              className="w-7 h-7 flex items-center justify-center text-stone-600 hover:text-stone-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white rounded transition-colors"
              title={isKg ? (lang === "nl" ? "Meer kg" : "More kg") : isPack ? (lang === "nl" ? "Meer packs" : "More packs") : (lang === "nl" ? "Meer stuks" : "More pieces")}
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
