import { db } from "@/db";
import { homepageSections, categories, products } from "@/db/schema";
import { asc, eq, and } from "drizzle-orm";
import { HomeSections } from "@/components/home/HomeSections";

export const revalidate = 0;

const fallbackSections = [
  {
    id: 1,
    sectionType: "hero",
    titleNl: "Verse groenten en fruit, elke dag de beste kwaliteit",
    titleEn: "Fresh fruits and vegetables, the best quality every day",
    subtitleNl: "Zorgvuldig geselecteerd van toonaangevende telers, rechtstreeks en gekoeld bezorgd in heel Nederland.",
    subtitleEn: "Carefully selected from prime growers, delivered refrigerated directly to your doorstep across the Netherlands.",
    imageUrl: "https://images.pexels.com/photos/12932209/pexels-photo-12932209.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600",
    buttonTextNl: "Bekijk producten",
    buttonTextEn: "Shop Products",
    buttonLink: "/shop",
    sortOrder: 1,
  },
  {
    id: 2,
    sectionType: "features",
    titleNl: "Waarom kiezen voor WIN & WIN FRESH BV",
    titleEn: "Why Choose WIN & WIN FRESH BV",
    subtitleNl: "Nederlandse betrouwbaarheid, pure versheid",
    subtitleEn: "Dutch reliability, pure freshness",
    config: {
      items: [
        { titleNl: "Verse Kwaliteit", titleEn: "Fresh Quality", descNl: "Dagelijks vers ingekocht bij Nederlandse telers.", descEn: "Freshly sourced every day from trusted Dutch growers." },
        { titleNl: "Zorgvuldig Geselecteerd", titleEn: "Carefully Selected", descNl: "Ieder product wordt gecontroleerd op smaak en kwaliteit.", descEn: "Every item is checked for taste, freshness and quality." },
        { titleNl: "Breed Assortiment", titleEn: "Wide Assortment", descNl: "Groenten, fruit, citrus, biologisch en meer.", descEn: "Vegetables, fruit, citrus, organic produce and more." },
        { titleNl: "Gekoelde Bezorging", titleEn: "Cold-Chain Delivery", descNl: "Vers verpakt en gekoeld bij u thuis bezorgd.", descEn: "Professionally packed and delivered chilled to your door." },
      ],
    },
    sortOrder: 2,
  },
  {
    id: 3,
    sectionType: "categories",
    titleNl: "Ontdek Onze Categorieën",
    titleEn: "Explore Our Categories",
    subtitleNl: "Alles vers geselecteerd, overzichtelijk per categorie.",
    subtitleEn: "Freshly selected produce, organized by category.",
    buttonTextNl: "Alle categorieën bekijken",
    buttonTextEn: "View All Categories",
    buttonLink: "/categories",
    sortOrder: 3,
  },
  {
    id: 4,
    sectionType: "featured_products",
    titleNl: "Uitgelichte Favorieten",
    titleEn: "Featured Favorites",
    subtitleNl: "Onze populairste producten van dit moment.",
    subtitleEn: "Our most popular products right now.",
    buttonTextNl: "Bekijk alle producten",
    buttonTextEn: "View All Products",
    buttonLink: "/shop",
    sortOrder: 4,
  },
  {
    id: 5,
    sectionType: "special_offers",
    titleNl: "Wekelijkse Voordeelaanbiedingen",
    titleEn: "Weekly Special Offers",
    subtitleNl: "Extra voordeel op geselecteerde verse producten.",
    subtitleEn: "Extra value on selected fresh products.",
    buttonTextNl: "Bekijk aanbiedingen",
    buttonTextEn: "View Offers",
    buttonLink: "/shop?filter=sale",
    sortOrder: 5,
  },
  {
    id: 6,
    sectionType: "seasonal_products",
    titleNl: "Vers van het Seizoen",
    titleEn: "Fresh This Season",
    subtitleNl: "Producten op hun best, geselecteerd voor het seizoen.",
    subtitleEn: "Produce at its best, selected for the season.",
    buttonTextNl: "Ontdek het seizoen",
    buttonTextEn: "Discover Seasonal Harvest",
    buttonLink: "/shop?filter=seasonal",
    sortOrder: 6,
  },
  {
    id: 7,
    sectionType: "delivery",
    titleNl: "Vers tot aan uw deur",
    titleEn: "Freshness Delivered to Your Door",
    subtitleNl: "Geen account nodig • Gratis bezorging vanaf €35 • Gekoelde levering",
    subtitleEn: "No account required • Free delivery from €35 • Chilled delivery",
    contentNl: "Bestel eenvoudig als gast en ontvang uw verse groenten en fruit gekoeld aan huis.",
    contentEn: "Order easily as a guest and receive fresh produce chilled at your doorstep.",
    buttonTextNl: "Bestel nu",
    buttonTextEn: "Order Now",
    buttonLink: "/shop",
    sortOrder: 7,
  },
];

const fallbackCategories = [
  [1, "groenten", "Groenten", "Vegetables", "https://images.pexels.com/photos/5677717/pexels-photo-5677717.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"],
  [2, "fruit", "Fruit", "Fruits", "https://images.pexels.com/photos/10325095/pexels-photo-10325095.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"],
  [3, "bladgroenten", "Bladgroenten", "Leafy Greens", "https://images.pexels.com/photos/36998708/pexels-photo-36998708.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"],
  [4, "citrusvruchten", "Citrusvruchten", "Citrus Fruits", "https://images.pexels.com/photos/952378/pexels-photo-952378.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"],
  [5, "exotisch-fruit", "Exotisch Fruit", "Exotic Fruits", "https://images.pexels.com/photos/5966631/pexels-photo-5966631.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"],
  [6, "biologisch", "Biologisch", "Organic", "https://images.pexels.com/photos/39566593/pexels-photo-39566593.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200"],
].map(([id, slug, nameNl, nameEn, image]) => ({ id, slug, nameNl, nameEn, image, isActive: true, sortOrder: Number(id) }));

const fallbackProducts = [
  { id: 1, slug: "trostomaten-holland", nameNl: "Hollandse Trostomaten", nameEn: "Dutch Vine Tomatoes", pricePerKg: "2.49", salePricePerKg: "1.99", unit: "kg", mainImage: "https://images.pexels.com/photos/10112724/pexels-photo-10112724.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", origin: "Westland, Nederland", badges: ["SALE", "POPULAR"], stockStatus: "in_stock", isFeatured: true, isSeasonal: false, isPublished: true, sortOrder: 1 },
  { id: 2, slug: "knapperige-komkommer", nameNl: "Hollandse Komkommer", nameEn: "Crisp Dutch Cucumber", pricePerKg: "1.49", salePricePerKg: null, unit: "kg", mainImage: "https://images.pexels.com/photos/39552264/pexels-photo-39552264.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", origin: "Zuid-Holland, Nederland", badges: ["POPULAR"], stockStatus: "in_stock", isFeatured: true, isSeasonal: false, isPublished: true, sortOrder: 2 },
  { id: 3, slug: "bospeen-met-loof", nameNl: "Verse Bospeen", nameEn: "Fresh Bunch Carrots", pricePerKg: "1.89", salePricePerKg: null, unit: "kg", mainImage: "https://images.pexels.com/photos/2914749/pexels-photo-2914749.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", origin: "Flevoland, Nederland", badges: ["SEASONAL"], stockStatus: "in_stock", isFeatured: false, isSeasonal: true, isPublished: true, sortOrder: 3 },
  { id: 4, slug: "aardbeien", nameNl: "Hollandse Aardbeien", nameEn: "Dutch Strawberries", pricePerKg: "6.95", salePricePerKg: "5.49", unit: "kg", mainImage: "https://images.pexels.com/photos/46174/strawberries-berries-fruit-freshness-46174.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", origin: "Limburg, Nederland", badges: ["SALE", "NEW"], stockStatus: "in_stock", isFeatured: true, isSeasonal: true, isPublished: true, sortOrder: 4 },
  { id: 5, slug: "navel-sinaasappels", nameNl: "Navel Sinaasappels", nameEn: "Navel Oranges", pricePerKg: "2.29", salePricePerKg: null, unit: "kg", mainImage: "https://images.pexels.com/photos/161559/background-bitter-orange-oranges-fruit-161559.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", origin: "Spanje", badges: ["POPULAR"], stockStatus: "in_stock", isFeatured: true, isSeasonal: false, isPublished: true, sortOrder: 5 },
  { id: 6, slug: "avocado-hass", nameNl: "Hass Avocado's", nameEn: "Hass Avocados", pricePerKg: "4.99", salePricePerKg: null, unit: "kg", mainImage: "https://images.pexels.com/photos/557659/pexels-photo-557659.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", origin: "Peru", badges: ["ORGANIC", "NEW"], stockStatus: "in_stock", isFeatured: false, isSeasonal: false, isPublished: true, sortOrder: 6 },
];

export default async function HomePage() {
  let activeSections: any[] = [];
  let activeCategories: any[] = [];
  let featuredProds: any[] = [];
  let seasonalProds: any[] = [];
  let saleProds: any[] = [];

  try {
    activeSections = await db.select().from(homepageSections).where(eq(homepageSections.isActive, true)).orderBy(asc(homepageSections.sortOrder), asc(homepageSections.id));
    activeCategories = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder), asc(categories.id));
    featuredProds = await db.select().from(products).where(and(eq(products.isPublished, true), eq(products.isFeatured, true))).orderBy(asc(products.sortOrder)).limit(8);
    seasonalProds = await db.select().from(products).where(and(eq(products.isPublished, true), eq(products.isSeasonal, true))).orderBy(asc(products.sortOrder)).limit(8);
    const allPublished = await db.select().from(products).where(eq(products.isPublished, true)).orderBy(asc(products.sortOrder));
    saleProds = allPublished.filter((p) => p.salePricePerKg !== null);
  } catch (error) {
    console.error("Homepage database read failed; using fallback content.", error);
  }

  return (
    <div className="min-h-screen bg-[#fcfbf7]">
      <HomeSections
        sections={activeSections.length ? activeSections : fallbackSections}
        categories={activeCategories.length ? activeCategories : fallbackCategories}
        featuredProducts={featuredProds.length ? featuredProds : fallbackProducts.filter((p) => p.isFeatured)}
        seasonalProducts={seasonalProds.length ? seasonalProds : fallbackProducts.filter((p) => p.isSeasonal)}
        saleProducts={saleProds.length ? saleProds : fallbackProducts.filter((p) => p.salePricePerKg)}
      />
    </div>
  );
}
