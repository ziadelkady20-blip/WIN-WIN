import { db } from "@/db";
import { homepageSections, categories, products } from "@/db/schema";
import { asc, eq, and } from "drizzle-orm";
import { HomeSections } from "@/components/home/HomeSections";

export const revalidate = 0; // Ensure fresh data when admin edits CMS

export default async function HomePage() {
  // 1. Fetch active homepage sections in order
  const activeSections = await db
    .select()
    .from(homepageSections)
    .where(eq(homepageSections.isActive, true))
    .orderBy(asc(homepageSections.sortOrder), asc(homepageSections.id));

  // 2. Fetch active categories
  const activeCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.id));

  // 3. Fetch featured products
  const featuredProds = await db
    .select()
    .from(products)
    .where(and(eq(products.isPublished, true), eq(products.isFeatured, true)))
    .orderBy(asc(products.sortOrder))
    .limit(8);

  // 4. Fetch seasonal products
  const seasonalProds = await db
    .select()
    .from(products)
    .where(and(eq(products.isPublished, true), eq(products.isSeasonal, true)))
    .orderBy(asc(products.sortOrder))
    .limit(8);

  // 5. Fetch sale products
  const allPublished = await db
    .select()
    .from(products)
    .where(eq(products.isPublished, true))
    .orderBy(asc(products.sortOrder));

  const saleProds = allPublished.filter((p) => p.salePricePerKg !== null);

  return (
    <div className="min-h-screen">
      <HomeSections
        sections={activeSections}
        categories={activeCategories}
        featuredProducts={featuredProds}
        seasonalProducts={seasonalProds}
        saleProducts={saleProds}
      />
    </div>
  );
}
