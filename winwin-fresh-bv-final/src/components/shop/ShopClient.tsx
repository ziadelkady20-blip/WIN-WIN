"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/lib/i18n";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  Sparkles,
  Tag,
  Leaf,
  Check
} from "lucide-react";

interface ShopClientProps {
  initialProducts: any[];
  categories: any[];
}

export function ShopClient({ initialProducts, categories }: ShopClientProps) {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL state synchronization
  const initialCategory = searchParams.get("category") || "all";
  const initialFilter = searchParams.get("filter") || "all"; // featured, seasonal, organic, sale, new
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "popular";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedFilter, setSelectedFilter] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(10);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setSelectedCategory(cat);
    const filt = searchParams.get("filter");
    if (filt) setSelectedFilter(filt);
    const s = searchParams.get("search");
    if (s) setSearchQuery(s);
  }, [searchParams]);

  // Filtering & sorting logic
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // 1. Category filter
      if (selectedCategory !== "all") {
        if (product.categorySlug !== selectedCategory) {
          return false;
        }
      }

      // 2. Special tag/filter
      if (selectedFilter === "featured" && !product.isFeatured) return false;
      if (selectedFilter === "seasonal" && !product.isSeasonal) return false;
      if (selectedFilter === "organic" && !product.isOrganic) return false;
      if (selectedFilter === "sale" && !product.salePricePerKg) return false;
      if (selectedFilter === "new" && !product.isNew) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchNl = product.nameNl?.toLowerCase().includes(query);
        const matchEn = product.nameEn?.toLowerCase().includes(query);
        const matchOrigin = product.origin?.toLowerCase().includes(query);
        const matchCat = product.categoryNameNl?.toLowerCase().includes(query);
        if (!matchNl && !matchEn && !matchOrigin && !matchCat) return false;
      }

      // 4. In stock only
      if (inStockOnly && product.stockStatus === "out_of_stock") {
        return false;
      }

      // 5. Price filter
      const effectivePrice = product.salePricePerKg
        ? parseFloat(product.salePricePerKg)
        : parseFloat(product.pricePerKg);
      if (effectivePrice > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.salePricePerKg ? parseFloat(a.salePricePerKg) : parseFloat(a.pricePerKg);
      const priceB = b.salePricePerKg ? parseFloat(b.salePricePerKg) : parseFloat(b.pricePerKg);

      if (sortBy === "price_asc") return priceA - priceB;
      if (sortBy === "price_desc") return priceB - priceA;
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "featured") return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  }, [initialProducts, selectedCategory, selectedFilter, searchQuery, inStockOnly, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedFilter("all");
    setSearchQuery("");
    setInStockOnly(false);
    setMaxPrice(10);
    setSortBy("popular");
    router.push("/shop");
  };

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedFilter !== "all" ? 1 : 0) +
    (searchQuery.trim() !== "" ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (maxPrice < 10 ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8 pb-6 border-b border-stone-200/80">
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          {t.shop.title}
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          {t.shop.subtitle}
        </p>
      </div>

      {/* Control bar: search, category pills, mobile filter button, sorting */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={t.shop.filterBy + "..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10.5 pl-10 pr-4 text-xs sm:text-sm bg-white rounded-lg border border-stone-300 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden transition-all shadow-2xs"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Right tools: Sort + Mobile Filter Toggle */}
        <div className="flex items-center gap-3 justify-between md:justify-end">
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 h-10 px-3.5 rounded-lg border border-stone-300 bg-white text-xs font-semibold text-stone-700 shadow-2xs"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-800" />
            <span>{t.shop.filterBy}</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-stone-500 font-medium">
              {t.shop.sortBy}:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 text-xs bg-white font-medium text-stone-800 border border-stone-300 rounded-lg focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="popular">{t.shop.sortPopular}</option>
              <option value="price_asc">{t.shop.sortPriceAsc}</option>
              <option value="price_desc">{t.shop.sortPriceDesc}</option>
              <option value="newest">{t.shop.sortNewest}</option>
              <option value="featured">{t.shop.sortFeatured}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Sidebar filters + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block space-y-6 bg-white p-6 rounded-xl border border-stone-200/80 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-800" />
              <h3 className="font-bold text-sm text-stone-900">{t.shop.filterBy}</h3>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{t.shop.resetFilters}</span>
              </button>
            )}
          </div>

          {/* Category List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              {t.shop.allCategories}
            </h4>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  selectedCategory === "all"
                    ? "bg-emerald-50 text-emerald-900 font-bold"
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                <span>{t.shop.allCategories}</span>
                <span className="text-[11px] text-stone-400">{initialProducts.length}</span>
              </button>

              {categories.map((cat) => {
                const count = initialProducts.filter((p) => p.categorySlug === cat.slug).length;
                const catName = lang === "nl" ? cat.nameNl : (cat.nameEn || cat.nameNl);
                const isSelected = selectedCategory === cat.slug;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-900 font-bold"
                        : "text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    <span>{catName}</span>
                    <span className="text-[11px] text-stone-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Badges / Collections */}
          <div className="pt-4 border-t border-stone-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              {lang === "nl" ? "Speciale Collecties" : "Special Collections"}
            </h4>
            <div className="space-y-1.5 text-xs">
              {[
                { id: "all", label: lang === "nl" ? "Alles tonen" : "Show all" },
                { id: "sale", label: t.shop.saleOnly },
                { id: "organic", label: t.shop.organicOnly },
                { id: "seasonal", label: t.shop.seasonalOnly },
                { id: "featured", label: lang === "nl" ? "Aanbevolen" : "Featured" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedFilter(f.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-md flex items-center justify-between font-medium transition-colors ${
                    selectedFilter === f.id
                      ? "bg-emerald-900 text-white font-bold"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <span>{f.label}</span>
                  {selectedFilter === f.id && <Check className="w-3.5 h-3.5 text-emerald-300" />}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Slider */}
          <div className="pt-4 border-t border-stone-100">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-2">
              <span>{t.shop.priceRange}</span>
              <span className="text-emerald-900 font-extrabold">{formatPrice(maxPrice, lang)} / kg</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.25"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseFloat(e.target.value))}
              className="w-full accent-emerald-800 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 mt-1">
              <span>€1,00</span>
              <span>€10,00</span>
            </div>
          </div>

          {/* Availability checkbox */}
          <div className="pt-4 border-t border-stone-100">
            <label className="flex items-center gap-2.5 text-xs font-medium text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-emerald-800 focus:ring-emerald-700"
              />
              <span>{t.shop.inStockOnly}</span>
            </label>
          </div>
        </aside>

        {/* Mobile Filter Drawer / Collapsible */}
        {mobileFilterOpen && (
          <div className="lg:hidden col-span-1 bg-white p-5 rounded-xl border border-stone-200 space-y-5 mb-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <span className="font-bold text-sm text-stone-900">{t.shop.filterBy}</span>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* Mobile Categories buttons */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                {t.shop.allCategories}
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium ${
                    selectedCategory === "all" ? "bg-emerald-800 text-white" : "bg-stone-100 text-stone-700"
                  }`}
                >
                  {t.shop.allCategories}
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium ${
                      selectedCategory === c.slug ? "bg-emerald-800 text-white" : "bg-stone-100 text-stone-700"
                    }`}
                  >
                    {lang === "nl" ? c.nameNl : (c.nameEn || c.nameNl)}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-2.5 bg-emerald-800 text-white rounded-lg text-xs font-bold"
            >
              {lang === "nl" ? "Resultaten bekijken" : "View Results"}
            </button>
          </div>
        )}

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {/* Results count & active tags */}
          <div className="flex items-center justify-between mb-4 text-xs text-stone-500">
            <span>
              {filteredProducts.length} {t.shop.showingResults}
            </span>
          </div>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200/80 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900">
                {t.shop.noProducts}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {lang === "nl"
                  ? "Probeer de zoekterm of filters aan te passen om meer verse groenten en fruit te vinden."
                  : "Try adjusting your search terms or filters to find more fresh produce."}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.shop.resetFilters}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
