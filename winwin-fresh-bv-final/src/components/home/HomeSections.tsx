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

export function HomeSections({ sections, categories, featuredProducts, seasonalProducts = [], saleProducts = [] }: HomeSectionsProps) {
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
      {/* HERO — clean editorial layout with a subtle product orbit */}
      <section id="home-hero" className="relative overflow-hidden bg-[#f7f6f0] text-[#12352b]">
        <style jsx>{`
          @keyframes winwin-orbit {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes winwin-counter {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
          }
          @media (prefers-reduced-motion: reduce) {
            .winwin-orbit, .winwin-counter { animation: none !important; }
          }
        `}</style>

        <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-4 px-5 py-14 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-10 lg:py-20">
          <div className="relative z-20 max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#064e3b]/10 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.2em] text-[#064e3b] shadow-sm">
              <Leaf className="h-4 w-4" />
              WIN &amp; WIN FRESH
            </div>

            <h1 className="max-w-2xl text-5xl font-black leading-[0.96] tracking-[-0.055em] text-[#10372c] sm:text-6xl lg:text-[76px]">
              {t(hero, "title", "Verse groenten en fruit, elke dag de beste kwaliteit", "Fresh fruits and vegetables, the best quality every day")}
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-stone-600 sm:text-lg">
              {t(hero, "subtitle", "Zorgvuldig geselecteerd en gekoeld bezorgd in heel Nederland.", "Carefully selected and delivered chilled across the Netherlands.")}
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link href={hero?.buttonLink || "/shop"} className="group inline-flex items-center gap-2 rounded-xl bg-[#064e3b] px-6 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#053f31]">
                {t(hero, "buttonText", "Bekijk producten", "Shop products")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/categories" className="inline-flex items-center gap-2 rounded-xl border border-[#064e3b]/20 bg-white px-6 py-3.5 text-sm font-bold text-[#064e3b] transition hover:-translate-y-0.5 hover:border-[#064e3b]/40">
                {lang === "nl" ? "Ontdek categorieën" : "Explore categories"}
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-stone-500">
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#064e3b]" />{lang === "nl" ? "Per stuk geprijsd" : "Priced per piece"}</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#064e3b]" />{lang === "nl" ? "Gast bestellen" : "Guest checkout"}</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#064e3b]" />{lang === "nl" ? "Gekoeld bezorgd" : "Chilled delivery"}</span>
            </div>
          </div>

          <div className="relative flex min-h-[340px] items-center justify-center overflow-visible sm:min-h-[420px] lg:min-h-[570px]">
            <div aria-hidden="true" className="absolute h-[300px] w-[300px] rounded-full border border-[#064e3b]/10 sm:h-[390px] sm:w-[390px] lg:h-[470px] lg:w-[470px]" />
            <div aria-hidden="true" className="absolute h-[220px] w-[220px] rounded-full border border-[#064e3b]/10 sm:h-[280px] sm:w-[280px] lg:h-[330px] lg:w-[330px]" />
            <div aria-hidden="true" className="absolute h-[145px] w-[145px] rounded-full bg-white shadow-[0_25px_70px_rgba(6,78,59,0.10)] sm:h-[180px] sm:w-[180px] lg:h-[210px] lg:w-[210px]" />
            <div className="relative z-10 grid h-[125px] w-[125px] place-items-center rounded-full bg-[#064e3b] text-center text-white shadow-[0_25px_60px_rgba(6,78,59,0.22)] sm:h-[155px] sm:w-[155px] lg:h-[180px] lg:w-[180px]">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.24em] text-emerald-200">Fresh daily</div>
                <div className="mt-2 text-2xl font-black tracking-tight">WIN &amp; WIN</div>
                <div className="mt-1 text-xs text-white/60">{lang === "nl" ? "vers geselecteerd" : "carefully selected"}</div>
              </div>
            </div>

            {[
              ...featuredProducts,
              ...saleProducts,
              ...seasonalProducts,
            ].filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i).slice(0, 6).map((product, index) => {
              const orbitAngles = [0, 60, 120, 180, 240, 300];
              const angle = orbitAngles[index];
              return (
                <div
                  key={`hero-orbit-${product.id}`}
                  className="winwin-orbit absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 sm:h-[390px] sm:w-[390px] lg:h-[470px] lg:w-[470px]"
                  style={{ "--orbit-radius": "150px", animation: `winwin-orbit ${18 + index * 1.5}s linear infinite`, animationDelay: `-${index * 2}s` } as React.CSSProperties}
                >
                  <div
                    className="absolute left-1/2 top-0 h-16 w-16 -translate-x-1/2 -translate-y-1/2 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
                    style={{ transform: `translateX(-50%) rotate(${angle}deg)`, transformOrigin: "50% var(--orbit-radius)" }}
                  >
                    <div className="winwin-counter h-full w-full overflow-hidden rounded-[28px] border-4 border-white bg-white p-1.5 shadow-[0_18px_40px_rgba(0,0,0,0.10)]" style={{ animation: `winwin-counter ${18 + index * 1.5}s linear infinite` }}>
                      <img src={product.mainImage} alt="" className="h-full w-full rounded-[21px] object-cover" loading="eager" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BENEFITS — one quiet value strip */}
      <section id="home-benefits" className="border-b border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-stone-100 px-5 sm:grid-cols-4 sm:px-8 lg:px-10">
          {featureItems.map((item: any, index: number) => {
            const fallback = featureFallback[index];
            const Icon = fallback?.[0] || Leaf;
            const isDbItem = !Array.isArray(item);
            const title = isDbItem
              ? (lang === "nl" ? item.titleNl : item.titleEn) || (lang === "nl" ? item.titleEn : item.titleNl) || ""
              : (lang === "nl" ? item[1] : item[2]);

            return (
              <div key={`benefit-${index}`} className="flex items-center gap-3 px-3 py-6 sm:px-5 lg:px-7">
                <Icon className="h-5 w-5 shrink-0 text-[#064e3b]" />
                <div>
                  <h3 className="text-xs font-extrabold text-stone-900 sm:text-sm">{title}</h3>
                  <p className="mt-0.5 hidden text-[11px] leading-5 text-stone-500 sm:block">
                    {isDbItem ? ((lang === "nl" ? item.descNl : item.descEn) || (lang === "nl" ? item.descEn : item.descNl) || "") : (lang === "nl" ? fallback[3] : fallback[4])}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CATEGORIES — typography only, no decorative imagery */}
      <section id="home-categories" className="bg-[#f7f6f0] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#064e3b]">{lang === "nl" ? "Ons assortiment" : "Our assortment"}</p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-stone-950 sm:text-4xl">
                {t(categorySection, "title", "Categorieën", "Categories")}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
                {t(categorySection, "subtitle", "Een helder assortiment, zorgvuldig geselecteerd.", "A focused assortment, carefully selected.")}
              </p>
            </div>
            <Link href="/categories" className="inline-flex w-fit items-center gap-2 rounded-full border border-[#064e3b]/15 bg-white px-4 py-2 text-xs font-bold text-[#064e3b] transition hover:border-[#064e3b]/30 hover:bg-[#064e3b] hover:text-white">
              {lang === "nl" ? "Bekijk alles" : "View all"} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {categories.length ? (
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categories.slice(0, 6).map((cat: any, index: number) => (
                <Link
                  key={`category-${cat.id}`}
                  href={`/shop?category=${cat.slug}`}
                  className="group relative min-h-[150px] overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#064e3b]/30 hover:shadow-[0_18px_40px_rgba(6,78,59,0.08)]"
                >
                  <span className="absolute right-4 top-4 text-[10px] font-black tracking-[0.15em] text-stone-300 transition group-hover:text-[#064e3b]">{String(index + 1).padStart(2, "0")}</span>
                  <div className="absolute bottom-4 left-5 h-1 w-7 rounded-full bg-[#dc2626] transition-all duration-300 group-hover:w-12" />
                  <div className="flex h-full min-h-[110px] items-end">
                    <span className="max-w-[12ch] text-base font-extrabold leading-5 text-stone-900 transition group-hover:text-[#064e3b] sm:text-lg">
                      {lang === "nl" ? cat.nameNl : cat.nameEn}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-sm text-stone-500">
              {lang === "nl" ? "Categorieën worden binnenkort toegevoegd." : "Categories will be available soon."}
            </div>
          )}
        </div>
      </section>

      {/* HOMEPAGE PRODUCT SECTIONS — only products explicitly selected by the admin */}
      {featuredProducts.length > 0 && <ProductSection
        id="home-featured"
        eyebrow={lang === "nl" ? "Uitgelicht" : "Featured Favorites"}
        title={lang === "nl" ? "Uitgelichte favorieten" : "Featured Favorites"}
        subtitle={lang === "nl" ? "Producten die u op de homepage hebt geselecteerd." : "Products you selected for the homepage."}
        products={featuredProducts}
      />}
      {saleProducts.length > 0 && <ProductSection
        id="home-special"
        eyebrow={lang === "nl" ? "Speciale aanbieding" : "Special Offer"}
        title={lang === "nl" ? "Wekelijkse speciale aanbiedingen" : "Weekly Special Offers"}
        subtitle={lang === "nl" ? "Uw geselecteerde aanbiedingen." : "Your selected special offers."}
        products={saleProducts}
      />}
      {seasonalProducts.length > 0 && <ProductSection
        id="home-seasonal"
        eyebrow={lang === "nl" ? "Vers van het seizoen" : "Fresh This Season"}
        title={lang === "nl" ? "Vers dit seizoen" : "Fresh This Season"}
        subtitle={lang === "nl" ? "Producten die u voor dit seizoen hebt geselecteerd." : "Products you selected for this season."}
        products={seasonalProducts}
      />}

      {/* DELIVERY CTA — quiet premium close */}
      <section id="home-delivery" className="bg-[#064e3b] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">{lang === "nl" ? "Van bestelling tot deur" : "From order to door"}</p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                {t(delivery, "title", "Vers tot aan uw deur", "Freshness delivered to your door")}
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-emerald-50/75 sm:text-base">
                {t(delivery, "content", "Bestel eenvoudig als gast en ontvang uw verse producten gekoeld aan huis.", "Order easily as a guest and receive your fresh products chilled at your doorstep.")}
              </p>
            </div>
            <Link href="/shop" className="group inline-flex w-fit items-center gap-3 rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-[#064e3b] transition hover:-translate-y-0.5 hover:bg-emerald-50">
              {lang === "nl" ? "Bestel nu" : "Order now"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductSection({id,eyebrow,title,subtitle,products}:{id:string;eyebrow:string;title:string;subtitle:string;products:any[]}) {
  return (
    <section id={id} className="border-y border-stone-200 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mb-9 flex items-end justify-between gap-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#064e3b]">{eyebrow}</p>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-stone-950 sm:text-4xl">{title}</h2>
            <p className="mt-2 text-sm text-stone-500">{subtitle}</p>
          </div>
          <Link href="/shop" className="hidden items-center gap-2 text-sm font-bold text-[#064e3b] sm:inline-flex">
            Alle producten <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 8).map((product:any) => (
            <ProductCard key={`home-${id}-${product.id}`} product={{...product, unit:"piece"}} />
          ))}
        </div>
      </div>
    </section>
  );
}
