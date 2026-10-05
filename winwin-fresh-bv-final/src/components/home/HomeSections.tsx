"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { formatPrice } from "@/lib/i18n";
import { ProductCard } from "@/components/ProductCard";
import {
  Truck,
  ShieldCheck,
  Leaf,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  PhoneCall,
  Clock,
  HeartHandshake
} from "lucide-react";

interface HomeSectionsProps {
  sections: any[];
  categories: any[];
  featuredProducts: any[];
  seasonalProducts: any[];
  saleProducts: any[];
}

export function HomeSections({
  sections,
  categories,
  featuredProducts,
  seasonalProducts,
  saleProducts,
}: HomeSectionsProps) {
  const { lang, t } = useLanguage();

  const renderSection = (section: any) => {
    const title = lang === "nl" ? section.titleNl : (section.titleEn || section.titleNl);
    const subtitle = lang === "nl" ? section.subtitleNl : (section.subtitleEn || section.subtitleNl);
    const content = lang === "nl" ? section.contentNl : (section.contentEn || section.contentNl);
    const buttonText = lang === "nl" ? section.buttonTextNl : (section.buttonTextEn || section.buttonTextNl);

    switch (section.sectionType) {
      case "hero":
        return (
          <section key={section.id} className="relative overflow-hidden bg-stone-900 text-white">
            {/* Background Image with Dark Vignette */}
            <div className="absolute inset-0 z-0">
              <img
                src={section.imageUrl || "https://images.pexels.com/photos/12932209/pexels-photo-12932209.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600"}
                alt="Fresh produce"
                className="w-full h-full object-cover opacity-35 object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/70 to-transparent" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
              <div className="max-w-2xl space-y-6">
                {/* Dutch Quality Origin Tag */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-xs">
                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WIN &amp; WIN FRESH BV • NEDERLANDSE KWALITEIT</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
                  {title}
                </h1>

                <p className="text-lg sm:text-xl text-stone-300 font-normal leading-relaxed max-w-xl">
                  {subtitle}
                </p>

                {/* CTAs */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    href={section.buttonLink || "/shop"}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                  >
                    <span>{buttonText || (lang === "nl" ? "Bekijk producten" : "Shop Products")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/categories"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-xs border border-white/20 transition-all"
                  >
                    <span>{lang === "nl" ? "Ontdek categorieën" : "Explore Categories"}</span>
                  </Link>
                </div>

                {/* Sub features pill */}
                <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-white/10 text-xs text-stone-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{lang === "nl" ? "Verkoop per kilo" : "Sold per kg"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{lang === "nl" ? "Geen account nodig" : "Guest checkout"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{lang === "nl" ? "Betaal bij bezorging" : "Pay upon delivery"}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case "features":
        const items = section.config?.items || [
          {
            titleNl: "Verse Kwaliteit",
            titleEn: "Fresh Quality",
            descNl: "Dagelijks vers ingekocht van Nederlandse telers en veilingen.",
            descEn: "Procured daily directly from Dutch auction floors and prime growers."
          },
          {
            titleNl: "Zorgvuldig Geselecteerd",
            titleEn: "Carefully Selected",
            descNl: "Elk stuk groente en fruit wordt handmatig gecontroleerd op rijpheid en smaak.",
            descEn: "Every piece of produce is manually inspected for ripeness and flavor."
          },
          {
            titleNl: "Breed Assortiment",
            titleEn: "Wide Assortment",
            descNl: "Van oer-Hollandse seizoensgroenten tot exotisch fruit per kilo.",
            descEn: "From authentic Dutch staple produce to pristine exotic fruits."
          },
          {
            titleNl: "Betrouwbare Bezorging",
            titleEn: "Reliable Cold Delivery",
            descNl: "Vakkundig verpakt en in gekoelde bestelwagens bezorgd.",
            descEn: "Professionally packed and delivered in temperature-controlled vans."
          }
        ];

        return (
          <section key={section.id} className="border-b border-stone-200/80 bg-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {items.map((it: any, i: number) => {
                  const icons = [<Leaf className="w-5 h-5" />, <ShieldCheck className="w-5 h-5" />, <Award className="w-5 h-5" />, <Truck className="w-5 h-5" />];
                  return (
                    <div key={i} className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                        {icons[i % 4]}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-stone-900">
                          {lang === "nl" ? it.titleNl : (it.titleEn || it.titleNl)}
                        </h4>
                        <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                          {lang === "nl" ? it.descNl : (it.descEn || it.descNl)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );

      case "categories":
        return (
          <section key={section.id} className="py-16 bg-[#fcfbf7]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-1 text-sm text-stone-600">{subtitle}</p>
                  )}
                </div>
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
                >
                  <span>{buttonText || (lang === "nl" ? "Alle categorieën bekijken" : "View all categories")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.map((cat) => {
                  const catName = lang === "nl" ? cat.nameNl : (cat.nameEn || cat.nameNl);
                  return (
                    <Link
                      key={cat.id}
                      href={`/shop?category=${cat.slug}`}
                      className="group relative rounded-xl overflow-hidden bg-white border border-stone-200/80 hover:border-emerald-600/40 hover:shadow-md transition-all flex flex-col"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100">
                        <img
                          src={cat.image}
                          alt={catName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3 text-center">
                        <h3 className="font-semibold text-xs sm:text-sm text-stone-900 group-hover:text-emerald-800 transition-colors">
                          {catName}
                        </h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );

      case "featured_products":
        return (
          <section key={section.id} className="py-16 bg-white border-y border-stone-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === "nl" ? "Aanbevolen door onze keurmeesters" : "Recommended Produce"}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-1 text-sm text-stone-600">{subtitle}</p>
                  )}
                </div>
                <Link
                  href="/shop?filter=featured"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
                >
                  <span>{buttonText || (lang === "nl" ? "Bekijk alle favorieten" : "View all favorites")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        );

      case "special_offers":
        if (saleProducts.length === 0) return null;
        return (
          <section key={section.id} className="py-16 bg-[#fcfbf7]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 uppercase tracking-wider mb-1">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <span>{lang === "nl" ? "Tijdelijk extra voordeel per kg" : "Special per-kg pricing"}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-1 text-sm text-stone-600">{subtitle}</p>
                  )}
                </div>
                <Link
                  href="/shop?filter=sale"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
                >
                  <span>{buttonText || (lang === "nl" ? "Naar alle aanbiedingen" : "View all special offers")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {saleProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        );

      case "seasonal_products":
        if (seasonalProducts.length === 0) return null;
        return (
          <section key={section.id} className="py-16 bg-white border-y border-stone-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === "nl" ? "Nu op zijn lekkerst" : "Peak seasonal harvest"}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mt-1 text-sm text-stone-600">{subtitle}</p>
                  )}
                </div>
                <Link
                  href="/shop?filter=seasonal"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
                >
                  <span>{buttonText || (lang === "nl" ? "Ontdek het seizoen" : "Discover seasonal")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {seasonalProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        );

      case "about":
        return (
          <section key={section.id} className="py-20 bg-[#fbf9f4]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <HeartHandshake className="w-4 h-4 text-emerald-600" />
                    <span>WIN &amp; WIN FRESH BV</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
                    {title}
                  </h2>

                  {subtitle && (
                    <p className="text-lg font-medium text-emerald-900">
                      {subtitle}
                    </p>
                  )}

                  <p className="text-stone-600 leading-relaxed text-sm sm:text-base">
                    {content}
                  </p>

                  <div className="pt-2">
                    <Link
                      href={section.buttonLink || "/about"}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-emerald-900 hover:bg-emerald-950 text-white font-semibold text-sm transition-all"
                    >
                      <span>{buttonText || (lang === "nl" ? "Lees meer over ons" : "Read our story")}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-200/80 aspect-[4/3] bg-stone-100">
                  <img
                    src={section.imageUrl || "https://images.pexels.com/photos/5677717/pexels-photo-5677717.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1200"}
                    alt="WIN & WIN FRESH BV team and produce"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs p-4 rounded-xl border border-stone-200/70 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-stone-900">WIN &amp; WIN FRESH BV</p>
                      <p className="text-[11px] text-stone-500">Amsterdam • Westland • Barendrecht</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                      100% Vers
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case "quality":
        return (
          <section key={section.id} className="py-16 bg-emerald-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto text-center space-y-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-800 border border-emerald-700 text-emerald-300 mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {title}
                </h2>

                <p className="text-emerald-200 text-sm sm:text-base leading-relaxed">
                  {subtitle || content}
                </p>

                <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                  <div className="bg-emerald-950/60 p-5 rounded-xl border border-emerald-800/50">
                    <h4 className="font-semibold text-white text-sm mb-1">
                      {lang === "nl" ? "1. Dagelijkse Keuring" : "1. Daily Inspection"}
                    </h4>
                    <p className="text-xs text-emerald-200/80 leading-relaxed">
                      {lang === "nl"
                        ? "Elke partij groenten en fruit ondergaat een strenge rijpheids- en smaakcontrole."
                        : "Every incoming batch of produce undergoes strict ripeness and freshness checks."}
                    </p>
                  </div>

                  <div className="bg-emerald-950/60 p-5 rounded-xl border border-emerald-800/50">
                    <h4 className="font-semibold text-white text-sm mb-1">
                      {lang === "nl" ? "2. Gekoeld Transport" : "2. Cold-Chain Integrity"}
                    </h4>
                    <p className="text-xs text-emerald-200/80 leading-relaxed">
                      {lang === "nl"
                        ? "Geen temperatuurschommelingen: vers geplukt blijft gegarandeerd vers."
                        : "No temperature breaks: farm-fresh produce stays crisp until arrival."}
                    </p>
                  </div>

                  <div className="bg-emerald-950/60 p-5 rounded-xl border border-emerald-800/50">
                    <h4 className="font-semibold text-white text-sm mb-1">
                      {lang === "nl" ? "3. Versgarantie" : "3. Freshness Guarantee"}
                    </h4>
                    <p className="text-xs text-emerald-200/80 leading-relaxed">
                      {lang === "nl"
                        ? "Mocht er onverhoopt iets niet naar wens zijn, lossen wij dat direct voor u op."
                        : "If any item does not meet expectations, we promptly replace or refund it."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );

      case "delivery":
        return (
          <section key={section.id} className="py-16 bg-white border-t border-stone-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-stone-50 rounded-2xl border border-stone-200 p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>{lang === "nl" ? "Gekoelde Bezorging in Nederland" : "Refrigerated Delivery in NL"}</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                    {title}
                  </h2>

                  <p className="text-sm text-stone-600 leading-relaxed">
                    {subtitle || content}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs font-medium text-stone-700 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-700" />
                      <span>{lang === "nl" ? "Levering binnen 24-48 uur" : "Delivery in 24-48 hrs"}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>{lang === "nl" ? "Gratis bezorgd vanaf €35,-" : "Free delivery over €35"}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>{lang === "nl" ? "Betaling bij bezorger" : "Pay upon receipt"}</span>
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    href={section.buttonLink || "/shop"}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-sm transition-all shadow-md active:scale-95"
                  >
                    <span>{buttonText || (lang === "nl" ? "Direct Bestellen als Gast" : "Order as Guest")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-0">
      {sections.map((section) => renderSection(section))}
    </div>
  );
}
