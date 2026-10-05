"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight, Sparkles } from "lucide-react";

interface CategoriesClientProps {
  categories: any[];
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const { lang, t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Title */}
      <div className="max-w-2xl mb-12">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{lang === "nl" ? "Vers van het land" : "Farm to Table"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          {lang === "nl" ? "Onze Verscategorieën" : "Fresh Produce Categories"}
        </h1>
        <p className="mt-2 text-stone-600 text-sm sm:text-base leading-relaxed">
          {lang === "nl"
            ? "Verken ons complete assortiment ingedeeld per productgroep. Van dagverse Hollandse groenten tot geselecteerd handfruit en biologische gewassen."
            : "Browse our complete inventory categorized by product group. From crisp Dutch greenhouse vegetables to hand fruit and certified organic crops."}
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => {
          const name = lang === "nl" ? cat.nameNl : (cat.nameEn || cat.nameNl);
          const desc = lang === "nl" ? cat.descriptionNl : (cat.descriptionEn || cat.descriptionNl);

          return (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-stone-200/80 hover:border-emerald-600/40 hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
                <img
                  src={cat.image}
                  alt={name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-xs">
                    {name}
                  </h3>
                </div>
              </div>

              <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-2">
                  {desc}
                </p>

                <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 pt-2 border-t border-stone-100">
                  <span>{lang === "nl" ? "Bekijk producten" : "View products"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
