import React from "react";
import { useLanguage } from "@/context/LanguageContext";

interface BadgeProps {
  type: string;
  className?: string;
}

export function Badge({ type, className = "" }: BadgeProps) {
  const { t } = useLanguage();
  const normalized = type.toUpperCase();

  const labels: Record<string, string> = {
    NEW: t.badges.NEW,
    SALE: t.badges.SALE,
    POPULAR: t.badges.POPULAR,
    SEASONAL: t.badges.SEASONAL,
    ORGANIC: t.badges.ORGANIC,
    LIMITED: t.badges.LIMITED,
  };

  const label = labels[normalized] || type;

  const colorStyles: Record<string, string> = {
    SALE: "bg-red-50 text-red-700 border-red-200 ring-1 ring-red-600/10",
    NEW: "bg-emerald-50 text-emerald-800 border-emerald-200 ring-1 ring-emerald-600/10",
    POPULAR: "bg-amber-50 text-amber-900 border-amber-200 ring-1 ring-amber-600/10",
    SEASONAL: "bg-lime-50 text-lime-900 border-lime-200 ring-1 ring-lime-600/10",
    ORGANIC: "bg-teal-50 text-teal-900 border-teal-200 ring-1 ring-teal-600/10",
    LIMITED: "bg-stone-100 text-stone-800 border-stone-200 ring-1 ring-stone-600/10",
  };

  const style = colorStyles[normalized] || "bg-stone-100 text-stone-800 border-stone-200";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md border ${style} ${className}`}
    >
      {label}
    </span>
  );
}
