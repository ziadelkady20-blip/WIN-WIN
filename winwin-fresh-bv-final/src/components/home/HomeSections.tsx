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

export function HomeSections({ sections, categories, featuredProducts, seasonalProducts, saleProducts }: HomeSectionsProps) {
  const { lang } = useLanguage();
  const sectionMap = new Map<string, any>();
  for (const section of sections) if (!sectionMap.has(section.sectionType)) sectionMap.set(section.sectionType, section);
  const hero = sectionMap.get("hero");
  const features = sectionMap.get("features");
  const categorySection = sectionMap.get("categories");
  const featuredSection = sectionMap.get("featured_products");
  const delivery = sectionMap.get("delivery");

  const text = (s: any, key: "title" | "subtitle" | "content" | "button") => {
    if (!s) return "";
    const nl = s[`${key}Nl`];
    const en = s[`${key}En`];
    return lang === "nl" ? (nl || en || "") : (en || nl || "");
  };

  const fallbackHero = lang === "nl" ? "Verse groenten en fruit, elke dag de beste kwaliteit" : "Fresh fruits and vegetables, the best quality every day";
  const fallbackHeroSub = lang === "nl" ? "Zorgvuldig geselecteerd en gekoeld bezorgd in heel Nederland." : "Carefully selected and delivered chilled across the Netherlands.";
  const fallbackFeatures = [
    [Leaf, lang === "nl" ? "Verse kwaliteit" : "Fresh quality", lang === "nl" ? "Dagelijks zorgvuldig geselecteerde producten." : "Carefully selected fresh produce every day."],
    [ShieldCheck, lang === "nl" ? "Duidelijk assortiment" : "Focused assortment", lang === "nl" ? "Alleen de actuele producten uit onze prijslijst." : "Only the products in our current catalogue."],
    [Award, lang === "nl" ? "Per stuk geprijsd" : "Priced per piece", lang === "nl" ? "Alle prijzen op de website zijn per stuk." : "Every website price is for one piece."],
    [Truck, lang === "nl" ? "Gekoeld bezorgd" : "Chilled delivery", lang === "nl" ? "Vers verpakt en gekoeld geleverd." : "Freshly packed and delivered chilled."],
  ];

  return <div className="bg-[#fcfbf7]">
    <section className="relative min-h-[620px] overflow-hidden bg-stone-950 text-white">
      <img src={hero?.imageUrl || "https://images.pexels.com/photos/12932209/pexels-photo-12932209.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600"} alt="Fresh produce" className="absolute inset-0 h-full w-full object-cover opacity-35" />
      <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/75 to-stone-950/10" />
      <div className="relative z-10 mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[.16em] text-emerald-300"><Leaf className="h-3.5 w-3.5" />WIN &amp; WIN FRESH BV</div>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{text(hero, "title") || fallbackHero}</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-300">{text(hero, "subtitle") || fallbackHeroSub}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={hero?.buttonLink || "/shop"} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-500"><span>{text(hero, "button") || (lang === "nl" ? "Bekijk producten" : "Shop products")}</span><ArrowRight className="h-4 w-4" /></Link>
            <Link href="/categories" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15">{lang === "nl" ? "Ontdek categorieën" : "Explore categories"}</Link>
          </div>
          <div className="mt-9 grid grid-cols-1 gap-3 border-t border-white/10 pt-6 text-sm text-stone-300 sm:grid-cols-3">
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" />{lang === "nl" ? "Per stuk" : "Per piece"}</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" />{lang === "nl" ? "Gast bestellen" : "Guest checkout"}</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" />{lang === "nl" ? "Betalen bij levering" : "Pay on delivery"}</div>
          </div>
        </div>
      </div>
    </section>

    <section className="border-b border-stone-200 bg-white py-11">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-7 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {(features?.config?.items?.slice(0,4) || fallbackFeatures).map((it: any, i: number) => {
          const Icon = fallbackFeatures[i][0];
          const title = features?.config?.items?.[i] ? (lang === "nl" ? it.titleNl : (it.titleEn || it.titleNl)) : it[1];
          const desc = features?.config?.items?.[i] ? (lang === "nl" ? it.descNl : (it.descEn || it.descNl)) : it[2];
          return <div key={i} className="flex gap-3.5"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800"><Icon className="h-5 w-5" /></div><div><h3 className="text-sm font-bold">{title}</h3><p className="mt-1 text-xs leading-relaxed text-stone-500">{desc}</p></div></div>;
        })}
      </div>
    </section>

    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-9 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-emerald-800">WIN &amp; WIN FRESH</p><h2 className="mt-1 text-3xl font-black tracking-tight">{text(categorySection, "title") || (lang === "nl" ? "Categorieën" : "Categories")}</h2><p className="mt-2 text-sm text-stone-500">{text(categorySection, "subtitle") || (lang === "nl" ? "Ons actuele assortiment." : "Our current assortment.")}</p></div><Link href="/categories" className="hidden items-center gap-1 text-sm font-bold text-emerald-800 sm:inline-flex">{lang === "nl" ? "Alle categorieën" : "All categories"}<ArrowRight className="h-4 w-4" /></Link></div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.slice(0,6).map((cat:any)=><Link key={cat.id} href={`/shop?category=${cat.slug}`} className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg"><div className="aspect-[4/3] overflow-hidden bg-stone-100"><img src={cat.image} alt={lang === "nl" ? cat.nameNl : cat.nameEn} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></div><div className="p-3 text-center text-sm font-bold">{lang === "nl" ? cat.nameNl : cat.nameEn}</div></Link>)}
        </div>
      </div>
    </section>

    <section className="border-y border-stone-200 bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-9 flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-emerald-800">{lang === "nl" ? "Actuele prijslijst" : "Current price list"}</p><h2 className="mt-1 text-3xl font-black tracking-tight">{text(featuredSection, "title") || (lang === "nl" ? "Onze producten" : "Our products")}</h2><p className="mt-2 text-sm text-stone-500">{lang === "nl" ? "Alle prijzen zijn per stuk." : "All prices are per piece."}</p></div><Link href="/shop" className="hidden items-center gap-1 text-sm font-bold text-emerald-800 sm:inline-flex">{lang === "nl" ? "Alle producten" : "All products"}<ArrowRight className="h-4 w-4" /></Link></div>
        {featuredProducts.length ? <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{featuredProducts.slice(0,8).map((p:any)=><ProductCard key={p.id} product={{...p,unit:"piece"}} />)}</div> : <div className="rounded-2xl border border-dashed border-stone-300 bg-[#fcfbf7] p-12 text-center text-sm text-stone-500">{lang === "nl" ? "Er zijn momenteel geen producten geselecteerd." : "No products are currently selected."}</div>}
      </div>
    </section>

    <section className="bg-[#0a3528] py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">{lang === "nl" ? "Gekoelde levering" : "Chilled delivery"}</p><h2 className="mt-2 text-3xl font-black tracking-tight">{text(delivery, "title") || (lang === "nl" ? "Vers tot aan uw deur" : "Freshness delivered to your door")}</h2><p className="mt-4 leading-relaxed text-emerald-50/75">{text(delivery, "content") || (lang === "nl" ? "Bestel eenvoudig als gast en ontvang uw verse producten gekoeld aan huis." : "Order easily as a guest and receive your fresh products chilled at your doorstep.")}</p><Link href="/shop" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-emerald-950 hover:bg-emerald-50">{lang === "nl" ? "Bestel nu" : "Order now"}<ArrowRight className="h-4 w-4" /></Link></div></div>
    </section>
  </div>;
}
