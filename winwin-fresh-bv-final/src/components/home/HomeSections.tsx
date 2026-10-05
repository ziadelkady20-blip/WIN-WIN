"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, CheckCircle2, Leaf, ShieldCheck, Truck, Award } from "lucide-react";

interface HomeSectionsProps {
  sections: any[];
  categories: any[];
  featuredProducts: any[];
  seasonalProducts: any[];
  saleProducts: any[];
}

const FALLBACK_HERO_IMAGE =
  "https://images.pexels.com/photos/12932209/pexels-photo-12932209.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1800&q=85";

export function HomeSections({ sections, categories, featuredProducts }: HomeSectionsProps) {
  const { lang } = useLanguage();

  // Read CMS content once. The homepage itself is intentionally rendered as a
  // fixed layout: one hero, one benefits row, one category grid, one product
  // grid and one delivery CTA. This prevents duplicate DB section rows from
  // ever duplicating the visual sections on the homepage.
  const byType = new Map<string, any>();
  for (const section of sections ?? []) {
    if (!byType.has(section.sectionType)) byType.set(section.sectionType, section);
  }

  const hero = byType.get("hero");
  const features = byType.get("features");
  const categorySection = byType.get("categories");
  const featuredSection = byType.get("featured_products");
  const delivery = byType.get("delivery");

  const t = (section: any, key: string, fallbackNl: string, fallbackEn: string) => {
    const value = section?.[`${key}${lang === "nl" ? "Nl" : "En"}`];
    if (value) return value;
    const fallback = section?.[`${key}${lang === "nl" ? "En" : "Nl"}`];
    return fallback || (lang === "nl" ? fallbackNl : fallbackEn);
  };

  const featureFallback = [
    [Leaf, "Verse kwaliteit", "Fresh quality", "Dagelijks zorgvuldig geselecteerde producten.", "Carefully selected fresh produce every day."],
    [ShieldCheck, "Duidelijk assortiment", "Focused assortment", "Alleen ons actuele assortiment.", "Only our current catalogue."],
    [Award, "Per stuk geprijsd", "Priced per piece", "Alle prijzen zijn per stuk.", "Every website price is per piece."],
    [Truck, "Gekoeld bezorgd", "Chilled delivery", "Vers verpakt en gekoeld geleverd.", "Freshly packed and delivered chilled."],
  ] as const;

  const featureItems = Array.isArray(features?.config?.items) && features.config.items.length
    ? features.config.items.slice(0, 4)
    : featureFallback;

  return (
    <div className="bg-[#fcfbf7]">
      {/* HERO — exactly one */}
      <section id="home-hero" className="relative isolate min-h-[680px] overflow-hidden bg-[#082f24] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${hero?.imageUrl || FALLBACK_HERO_IMAGE})` }}
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/20" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

        <div className="relative z-10 mx-auto flex min-h-[680px] max-w-7xl items-center px-5 py-24 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-950/75 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-200 backdrop-blur">
              <Leaf className="h-4 w-4" />
              WIN &amp; WIN FRESH BV
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.03em] sm:text-5xl lg:text-7xl">
              {t(hero, "title", "Verse groenten en fruit, elke dag de beste kwaliteit", "Fresh fruits and vegetables, the best quality every day")}
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              {t(hero, "subtitle", "Zorgvuldig geselecteerd en gekoeld bezorgd in heel Nederland.", "Carefully selected and delivered chilled across the Netherlands.")}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href={hero?.buttonLink || "/shop"}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-500"
              >
                {t(hero, "buttonText", "Bekijk producten", "Shop products")}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
              >
                {lang === "nl" ? "Ontdek categorieën" : "Explore categories"}
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-1 gap-4 border-t border-white/15 pt-6 text-sm text-white/75 sm:grid-cols-3">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" />{lang === "nl" ? "Per stuk" : "Per piece"}</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" />{lang === "nl" ? "Gast bestellen" : "Guest checkout"}</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" />{lang === "nl" ? "Betalen bij levering" : "Pay on delivery"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS — exactly one */}
      <section id="home-benefits" className="border-b border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-0 px-5 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {featureItems.map((item: any, index: number) => {
            const fallback = featureFallback[index];
            const Icon = fallback?.[0] || Leaf;
            const isDbItem = !Array.isArray(item);
            const title = isDbItem
              ? (lang === "nl" ? item.titleNl : item.titleEn) || (lang === "nl" ? item.titleEn : item.titleNl) || ""
              : (lang === "nl" ? item[1] : item[2]);
            const desc = isDbItem
              ? (lang === "nl" ? item.descNl : item.descEn) || (lang === "nl" ? item.descEn : item.descNl) || ""
              : (lang === "nl" ? item[3] : item[4]);

            return (
              <div key={`benefit-${index}`} className="flex gap-3.5 border-b border-stone-100 px-2 py-7 lg:border-b-0 lg:border-r lg:px-7 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-800">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-stone-900">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-stone-500">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CATEGORIES — exactly one */}
      <section id="home-categories" className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-9 flex items-end justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">WIN &amp; WIN FRESH</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
                {t(categorySection, "title", "Categorieën", "Categories")}
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                {t(categorySection, "subtitle", "Ons actuele assortiment.", "Our current assortment.")}
              </p>
            </div>
            <Link href="/categories" className="hidden items-center gap-1 text-sm font-bold text-emerald-800 sm:inline-flex">
              {lang === "nl" ? "Alle categorieën" : "All categories"}<ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {categories.length ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {categories.slice(0, 6).map((cat: any) => (
                <Link key={`category-${cat.id}`} href={`/shop?category=${cat.slug}`} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
                  <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                    {cat.image ? <img src={cat.image} alt={lang === "nl" ? cat.nameNl : cat.nameEn} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="h-full w-full bg-gradient-to-br from-emerald-50 to-stone-100" />}
                  </div>
                  <div className="p-3 text-center text-sm font-bold text-stone-900">{lang === "nl" ? cat.nameNl : cat.nameEn}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
              {lang === "nl" ? "Categorieën worden binnenkort toegevoegd." : "Categories will be available soon."}
            </div>
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS — shown only when the admin has explicitly featured products */}
      {featuredProducts.length > 0 && (
        <section id="home-products" className="border-y border-stone-200 bg-white py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="mb-9 flex items-end justify-between gap-5">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">{lang === "nl" ? "Uitgelicht" : "Featured"}</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
                  {t(featuredSection, "title", "Uitgelichte producten", "Featured products")}
                </h2>
                <p className="mt-2 text-sm text-stone-500">{lang === "nl" ? "Door ons geselecteerde producten." : "Products selected by our team."}</p>
              </div>
              <Link href="/shop" className="hidden items-center gap-1 text-sm font-bold text-emerald-800 sm:inline-flex">
                {lang === "nl" ? "Alle producten" : "All products"}<ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.slice(0, 8).map((product: any) => (
                <ProductCard key={`product-${product.id}`} product={{ ...product, unit: "piece" }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DELIVERY CTA — exactly one */}
      <section id="home-delivery" className="bg-[#0a3528] py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">{lang === "nl" ? "Gekoelde levering" : "Chilled delivery"}</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
              {t(delivery, "title", "Vers tot aan uw deur", "Freshness delivered to your door")}
            </h2>
            <p className="mt-4 leading-8 text-emerald-50/75">
              {t(delivery, "content", "Bestel eenvoudig als gast en ontvang uw verse producten gekoeld aan huis.", "Order easily as a guest and receive your fresh products chilled at your doorstep.")}
            </p>
            <Link href="/shop" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-emerald-950 transition hover:bg-emerald-50">
              {lang === "nl" ? "Bestel nu" : "Order now"}<ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
