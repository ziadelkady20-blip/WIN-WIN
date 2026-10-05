import { db } from "@/db";
import { homepageSections, categories, products } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { HomeSections } from "@/components/home/HomeSections";

export const revalidate = 0;

const fallbackSections = [
  { id: "fallback-hero", sectionType: "hero", titleNl: "Verse groenten en fruit, elke dag de beste kwaliteit", titleEn: "Fresh fruits and vegetables, the best quality every day", subtitleNl: "Zorgvuldig geselecteerd en gekoeld bezorgd in heel Nederland.", subtitleEn: "Carefully selected and delivered chilled across the Netherlands.", imageUrl: "https://images.pexels.com/photos/12932209/pexels-photo-12932209.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600", buttonTextNl: "Bekijk producten", buttonTextEn: "Shop products", buttonLink: "/shop", sortOrder: 1 },
  { id: "fallback-features", sectionType: "features", titleNl: "", titleEn: "", config: {}, sortOrder: 2 },
  { id: "fallback-categories", sectionType: "categories", titleNl: "Categorieën", titleEn: "Categories", subtitleNl: "Ons actuele assortiment.", subtitleEn: "Our current assortment.", sortOrder: 3 },
  { id: "fallback-featured", sectionType: "featured_products", titleNl: "Uitgelichte producten", titleEn: "Featured products", sortOrder: 4 },
  { id: "fallback-delivery", sectionType: "delivery", titleNl: "Vers tot aan uw deur", titleEn: "Freshness delivered to your door", contentNl: "Bestel eenvoudig als gast en ontvang uw verse producten gekoeld aan huis.", contentEn: "Order easily as a guest and receive your fresh products chilled at your doorstep.", sortOrder: 5 },
];

const allowedSectionTypes = new Set(["hero", "features", "categories", "delivery"]);

export default async function HomePage() {
  let activeSections: any[] = [];
  let activeCategories: any[] = [];
  let publishedProducts: any[] = [];
  try {
    const [sections, cats, prods] = await Promise.all([
      db.select().from(homepageSections).where(eq(homepageSections.isActive, true)).orderBy(asc(homepageSections.sortOrder), asc(homepageSections.id)),
      db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder), asc(categories.id)),
      db.select().from(products).where(eq(products.isPublished, true)).orderBy(asc(products.sortOrder), asc(products.id)),
    ]);

    const seenTypes = new Set<string>();
    const legacyProductTitles = new Set([
      "Featured Favorites",
      "Weekly Special Offers",
      "Fresh This Season",
    ]);

    activeSections = sections.filter((section) => {
      // Ignore the old demo homepage product sections entirely.
      if (legacyProductTitles.has(section.titleEn) || legacyProductTitles.has(section.titleNl)) return false;
      if (!allowedSectionTypes.has(section.sectionType) || seenTypes.has(section.sectionType)) return false;
      seenTypes.add(section.sectionType);
      return true;
    });
    activeCategories = cats.filter((cat, index, arr) => arr.findIndex((x) => x.slug === cat.slug) === index);
    publishedProducts = prods.filter((p, index, arr) => arr.findIndex((x) => x.id === p.id) === index).map((p) => ({ ...p, unit: "piece" }));
  } catch (error) {
    console.error("Homepage database read failed:", error);
  }

  const sections = activeSections.length ? activeSections : fallbackSections;
  const featuredProducts = publishedProducts.filter((p) => Array.isArray(p.homepagePlacements) && p.homepagePlacements.includes("featured")).slice(0, 8);
  const saleProducts = publishedProducts.filter((p) => Array.isArray(p.homepagePlacements) && p.homepagePlacements.includes("special")).slice(0, 8);
  const seasonalProducts = publishedProducts.filter((p) => Array.isArray(p.homepagePlacements) && p.homepagePlacements.includes("seasonal")).slice(0, 8);

  return <div className="min-h-screen bg-[#fcfbf7]"><HomeSections sections={sections} categories={activeCategories} featuredProducts={featuredProducts} seasonalProducts={seasonalProducts} saleProducts={saleProducts} /></div>;
}
