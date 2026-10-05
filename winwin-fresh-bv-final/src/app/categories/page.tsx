import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { CategoriesClient } from "@/components/categories/CategoriesClient";

export const revalidate = 0;

export default async function CategoriesPage() {
  const allCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.id));

  return <CategoriesClient categories={allCategories} />;
}
