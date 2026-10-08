"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/i18n";
import {
  Search, ChevronRight, SlidersHorizontal, X, RotateCcw, Check,
  ShoppingCart, Minus, Plus, Leaf, Grid2X2, CircleCheck, Package
} from "lucide-react";

interface ShopClientProps {
  initialProducts: any[];
  categories: any[];
}

const categoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("pepper") || n.includes("paprika")) return "🌶";
  if (n.includes("auberg") || n.includes("eggplant")) return "🍆";
  if (n.includes("tomat")) return "🍅";
  if (n.includes("cucumber") || n.includes("komkommer")) return "🥒";
  if (n.includes("leaf") || n.includes("groen") || n.includes("salad")) return "🥬";
  if (n.includes("citrus") || n.includes("orange") || n.includes("sinaas")) return "🍊";
  if (n.includes("date") || n.includes("dadel")) return "🌴";
  return "◌";
};

export function ShopClient({ initialProducts, categories }: ShopClientProps) {
  const { lang, t } = useLanguage();
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get("category") || "all";
  const initialFilter = searchParams.get("filter") || "all";
  const initialSearch = searchParams.get("search") || "";
  const initialSort = searchParams.get("sort") || "popular";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedFilter, setSelectedFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSort);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [unitFilter, setUnitFilter] = useState<"all" | "piece" | "kg">("all");
  const [maxPrice, setMaxPrice] = useState(10);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [addedId, setAddedId] = useState<number | null>(null);

  useEffect(() => {
    const cat = searchParams.get("category");
    const filt = searchParams.get("filter");
    const s = searchParams.get("search");
    const sort = searchParams.get("sort");
    if (cat) setSelectedCategory(cat);
    if (filt) setSelectedFilter(filt);
    if (s !== null) setSearchQuery(s);
    if (sort) setSortBy(sort);
  }, [searchParams]);

  const getQty = (id: number) => quantities[id] || 1;
  const setQty = (id: number, value: number) =>
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, value) }));

  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      if (selectedCategory !== "all" && product.categorySlug !== selectedCategory) return false;
      if (selectedFilter === "featured" && !product.isFeatured) return false;
      if (selectedFilter === "seasonal" && !product.isSeasonal) return false;
      if (selectedFilter === "organic" && !product.isOrganic) return false;
      if (selectedFilter === "sale" && !product.salePricePerKg) return false;
      if (selectedFilter === "new" && !product.isNew) return false;
      if (unitFilter !== "all" && (product.unit === "kg" ? "kg" : "piece") !== unitFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const haystack = [
          product.nameNl, product.nameEn, product.origin,
          product.categoryNameNl, product.categoryNameEn
        ].filter(Boolean).join(" ").toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (inStockOnly && product.stockStatus === "out_of_stock") return false;

      const price = product.salePricePerKg
        ? parseFloat(product.salePricePerKg)
        : parseFloat(product.pricePerKg);
      if (price > maxPrice) return false;

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
  }, [initialProducts, selectedCategory, selectedFilter, searchQuery, inStockOnly, maxPrice, sortBy, unitFilter]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedFilter("all");
    setSearchQuery("");
    setInStockOnly(false);
    setUnitFilter("all");
    setMaxPrice(10);
    setSortBy("popular");
    router.push("/shop");
  };

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedFilter !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (unitFilter !== "all" ? 1 : 0) +
    (maxPrice < 10 ? 1 : 0);

  const addProduct = (product: any) => {
    if (product.stockStatus === "out_of_stock") return;
    const qty = getQty(product.id);
    addToCart({
      id: product.id,
      slug: product.slug,
      nameNl: product.nameNl,
      nameEn: product.nameEn,
      pricePerKg: product.salePricePerKg ? parseFloat(product.salePricePerKg) : parseFloat(product.pricePerKg),
      unit: product.unit === "kg" ? "kg" : "piece",
      image: product.mainImage,
    }, qty);
    setAddedId(product.id);
    window.setTimeout(() => setAddedId(null), 1400);
  };

  const unitLabel = (product: any) =>
    product.unit === "kg" ? "kg" : (lang === "nl" ? "stuk" : "piece");

  return (
    <main className="min-h-screen bg-[#f3efe5] text-[#17382b]">
      <section className="border-b border-[#ddd7ca] bg-[#f7f3e9]">
        <div className="mx-auto max-w-[1540px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
          <div className="relative overflow-hidden rounded-[26px] border border-[#e2ddcf] bg-[#fbf8ef] px-6 py-8 sm:px-10 lg:px-14 lg:py-10">
            <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full border-[28px] border-[#d8dfd3]/70" />
            <div className="pointer-events-none absolute right-28 top-4 h-20 w-20 rounded-full bg-[#e6e5dc]/70 blur-xl" />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#5f685f]">
                QUALITY FRESH PRODUCE · DIRECT SUPPLY · FOR PROFESSIONALS
              </p>
              <h1 className="mt-3 max-w-4xl font-serif text-5xl leading-[0.95] tracking-[-0.045em] text-[#16372a] sm:text-6xl lg:text-[76px]">
                {lang === "nl" ? <>Wekelijkse <em className="text-[#b51d22]">verse</em> aankomsten</> : <>Weekly <em className="text-[#b51d22]">fresh</em> arrivals</>}
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-[#737971] sm:text-base">
                {t.shop.subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1540px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777b76]" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "nl" ? "Zoek producten..." : "Search products..."}
              className="h-12 w-full rounded-xl border border-[#d6d1c4] bg-white pl-11 pr-11 text-sm text-[#18382b] outline-none transition focus:border-[#2d6a45] focus:ring-2 focus:ring-[#2d6a45]/10"
            />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-[#8b918c]" /></button>}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileFilterOpen((v) => !v)} className="flex h-11 items-center gap-2 rounded-xl border border-[#d6d1c4] bg-white px-4 text-xs font-bold lg:hidden">
              <SlidersHorizontal className="h-4 w-4" /> {t.shop.filterBy}
              {activeFilterCount > 0 && <span className="grid h-5 w-5 place-items-center rounded-full bg-[#1f6b45] text-[10px] text-white">{activeFilterCount}</span>}
            </button>
            <div className="flex h-11 items-center rounded-xl border border-[#d6d1c4] bg-white px-3">
              <span className="mr-2 hidden text-xs text-[#7b807a] sm:inline">{t.shop.sortBy}:</span>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent text-xs font-bold text-[#294739] outline-none">
                <option value="popular">{t.shop.sortPopular}</option>
                <option value="price_asc">{t.shop.sortPriceAsc}</option>
                <option value="price_desc">{t.shop.sortPriceDesc}</option>
                <option value="newest">{t.shop.sortNewest}</option>
                <option value="featured">{t.shop.sortFeatured}</option>
              </select>
            </div>
          </div>
        </div>

        {mobileFilterOpen && (
          <div className="mb-6 rounded-2xl border border-[#ddd7ca] bg-white p-5 lg:hidden">
            <div className="mb-4 flex items-center justify-between border-b border-[#e9e4d8] pb-3">
              <span className="font-bold">{t.shop.filterBy}</span>
              <button onClick={() => setMobileFilterOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedCategory("all")} className={`rounded-lg px-3 py-2 text-xs font-bold ${selectedCategory === "all" ? "bg-[#1f6b45] text-white" : "bg-[#ece7db]"}`}>{t.shop.allCategories}</button>
              {categories.map((cat) => <button key={cat.id} onClick={() => setSelectedCategory(cat.slug)} className={`rounded-lg px-3 py-2 text-xs font-bold ${selectedCategory === cat.slug ? "bg-[#1f6b45] text-white" : "bg-[#ece7db]"}`}>{lang === "nl" ? cat.nameNl : cat.nameEn || cat.nameNl}</button>)}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-[#ddd7ca] bg-[#fbf9f3] p-5">
              <div className="mb-5 flex items-center justify-between border-b border-[#e2dccf] pb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-[#2a6746]" />
                  <h2 className="text-xs font-black uppercase tracking-[0.18em]">{t.shop.allCategories}</h2>
                </div>
                {activeFilterCount > 0 && <button onClick={handleResetFilters} className="text-[#2b6746]"><RotateCcw className="h-3.5 w-3.5" /></button>}
              </div>

              <div className="space-y-1">
                <button onClick={() => setSelectedCategory("all")} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${selectedCategory === "all" ? "bg-[#e7e2d6] font-bold text-[#234936]" : "text-[#606860] hover:bg-[#ebe6da]"}`}>
                  <span className="flex items-center gap-3"><Grid2X2 className="h-5 w-5" />{t.shop.allCategories}</span><ChevronRight className="h-4 w-4" />
                </button>
                {categories.map((cat) => {
                  const count = initialProducts.filter((p) => p.categorySlug === cat.slug).length;
                  const name = lang === "nl" ? cat.nameNl : cat.nameEn || cat.nameNl;
                  return <button key={cat.id} onClick={() => setSelectedCategory(cat.slug)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm ${selectedCategory === cat.slug ? "bg-[#e7e2d6] font-bold text-[#234936]" : "text-[#606860] hover:bg-[#ebe6da]"}`}>
                    <span className="flex items-center gap-3"><span className="grid w-5 place-items-center text-lg">{categoryIcon(name)}</span>{name}</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>;
                })}
              </div>

              <div className="mt-7 border-t border-[#e2dccf] pt-6">
                <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#777f79]">{lang === "nl" ? "Beschikbaarheid" : "Availability"}</h3>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-[#5e665f]">
                  <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} className="h-4 w-4 accent-[#2b7048]" />
                  {t.shop.inStockOnly}
                  <span className="ml-auto text-xs text-[#92968f]">{initialProducts.filter((p) => p.stockStatus !== "out_of_stock").length}</span>
                </label>
              </div>

              <div className="mt-7 border-t border-[#e2dccf] pt-6">
                <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#777f79]">{lang === "nl" ? "Verkoop per" : "Sold by"}</h3>
                {[["all", lang === "nl" ? "Alles" : "All"], ["piece", lang === "nl" ? "Per stuk" : "Per piece"], ["kg", "Per kg"]].map(([id, label]) => (
                  <button key={id} onClick={() => setUnitFilter(id as any)} className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${unitFilter === id ? "bg-[#1f6b45] font-bold text-white" : "text-[#5e665f] hover:bg-[#ebe6da]"}`}>
                    {label}{unitFilter === id && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>

              <div className="mt-7 border-t border-[#e2dccf] pt-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.18em] text-[#777f79]">{t.shop.priceRange}</h3>
                  <span className="text-xs font-bold text-[#236743]">{formatPrice(maxPrice, lang)}</span>
                </div>
                <input type="range" min="1" max="10" step="0.25" value={maxPrice} onChange={(e) => setMaxPrice(parseFloat(e.target.value))} className="w-full accent-[#2d7049]" />
                <div className="mt-1 flex justify-between text-[10px] text-[#969990]"><span>€1</span><span>€10+</span></div>
              </div>

              <div className="mt-7 border-t border-[#e2dccf] pt-6">
                <h3 className="mb-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#777f79]">{lang === "nl" ? "Speciale collecties" : "Special collections"}</h3>
                {[
                  ["all", lang === "nl" ? "Alles tonen" : "Show all"],
                  ["sale", t.shop.saleOnly],
                  ["organic", t.shop.organicOnly],
                  ["seasonal", t.shop.seasonalOnly],
                  ["featured", lang === "nl" ? "Aanbevolen" : "Featured"]
                ].map(([id, label]) => <button key={id} onClick={() => setSelectedFilter(id)} className={`mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${selectedFilter === id ? "font-bold text-[#216441]" : "text-[#687069] hover:bg-[#ebe6da]"}`}>{label}{selectedFilter === id && <Check className="h-3.5 w-3.5" />}</button>)}
              </div>
            </div>
          </aside>

          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#7b8077]">{lang === "nl" ? "Vers assortiment" : "Fresh selection"}</p>
                <h2 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[#18382b] sm:text-4xl">{lang === "nl" ? "Groenten & fruit" : "Fresh produce"}</h2>
              </div>
              <span className="text-xs font-semibold text-[#7b8077]">{filteredProducts.length} {t.shop.showingResults}</span>
            </div>

            <div className="space-y-3">
              {filteredProducts.length > 0 ? filteredProducts.map((product) => {
                const price = product.salePricePerKg ? parseFloat(product.salePricePerKg) : parseFloat(product.pricePerKg);
                const original = product.salePricePerKg ? parseFloat(product.pricePerKg) : null;
                const unit = unitLabel(product);
                const qty = getQty(product.id);
                const out = product.stockStatus === "out_of_stock";
                const name = lang === "nl" ? product.nameNl : product.nameEn || product.nameNl;
                const desc = lang === "nl" ? product.descriptionNl : product.descriptionEn || product.descriptionNl;

                return (
                  <article key={product.id} className="group grid grid-cols-[105px_minmax(0,1fr)] gap-4 rounded-2xl border border-[#e1dbd0] bg-white p-3 shadow-[0_4px_20px_rgba(32,59,46,0.035)] transition hover:border-[#c4d0c7] hover:shadow-[0_10px_30px_rgba(32,59,46,0.07)] sm:grid-cols-[205px_minmax(0,1fr)_220px] sm:gap-5 sm:p-4 lg:grid-cols-[230px_minmax(0,1fr)_300px]">
                    <a href={`/product/${product.slug}`} className="relative block h-[105px] overflow-hidden rounded-xl bg-[#ebe6da] sm:h-[138px] lg:h-[150px]">
                      <img src={product.mainImage} alt={name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
                      {product.badges?.length > 0 && <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[9px] font-black tracking-wider text-[#1d6546] shadow-sm">{product.badges[0]}</span>}
                    </a>

                    <div className="min-w-0 py-1 sm:py-2">
                      <a href={`/product/${product.slug}`} className="block">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-serif text-xl font-bold leading-tight text-[#183e2f] sm:text-2xl">{name}</h3>
                          <span className="rounded-md bg-[#eeeae0] px-2 py-1 text-[10px] font-bold text-[#6e756f]">{unit}</span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#707a74] sm:text-sm">{desc || (lang === "nl" ? "Vers, zorgvuldig geselecteerd en direct geleverd." : "Fresh, carefully selected and delivered directly.")}</p>
                      </a>
                      <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#39764f]">
                        <CircleCheck className="h-4 w-4 fill-[#dceee0] text-[#2f8b58]" />
                        {out ? t.shop.outOfStock : t.shop.inStock}
                      </div>
                    </div>

                    <div className="col-span-2 flex items-end justify-between gap-3 border-t border-[#e9e4d8] pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:border-l sm:pl-5 lg:pl-7">
                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-2">
                          <span className="text-2xl font-black tracking-tight text-[#b51d22] sm:text-3xl">{formatPrice(price, lang)}</span>
                          {original && <span className="text-xs text-[#999b96] line-through">{formatPrice(original, lang)}</span>}
                        </div>
                        <span className="text-[11px] font-medium text-[#858982]">per {unit}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex h-10 items-center overflow-hidden rounded-lg border border-[#d5d0c4] bg-[#faf7ef]">
                          <button disabled={qty <= 1 || out} onClick={() => setQty(product.id, qty - 1)} className="grid h-10 w-9 place-items-center text-[#606a64] hover:bg-white disabled:opacity-30"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="grid h-10 w-10 place-items-center border-x border-[#ded8cc] text-sm font-bold text-[#344a3d]">{qty}</span>
                          <button disabled={out} onClick={() => setQty(product.id, qty + 1)} className="grid h-10 w-9 place-items-center text-[#606a64] hover:bg-white disabled:opacity-30"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <button disabled={out} onClick={() => addProduct(product)} className={`flex h-10 min-w-[92px] items-center justify-center gap-2 rounded-lg px-4 text-xs font-black transition ${addedId === product.id ? "bg-[#286d48]" : "bg-[#1f6b45] hover:bg-[#174f37]"} text-white disabled:cursor-not-allowed disabled:bg-[#c9c9c2] `}>
                          <ShoppingCart className="h-4 w-4" />
                          {addedId === product.id ? (lang === "nl" ? "Toegevoegd" : "Added") : (lang === "nl" ? "Toevoegen" : "Add")}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }) : (
                <div className="rounded-2xl border border-[#ddd7ca] bg-white p-16 text-center">
                  <Package className="mx-auto h-10 w-10 text-[#a0a7a2]" />
                  <h3 className="mt-4 font-bold">{t.shop.noProducts}</h3>
                  <button onClick={handleResetFilters} className="mt-5 rounded-lg bg-[#1f6b45] px-5 py-2.5 text-xs font-bold text-white">{t.shop.resetFilters}</button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
