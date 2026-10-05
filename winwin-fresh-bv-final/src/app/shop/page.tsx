import React, { Suspense } from "react";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { ShopClient } from "@/components/shop/ShopClient";

export const revalidate = 0;

export default async function ShopPage() {
  const allCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true))
    .orderBy(asc(categories.sortOrder), asc(categories.id));

  const allProducts = await db
    .select({
      id: products.id,
      slug: products.slug,
      nameNl: products.nameNl,
      nameEn: products.nameEn,
      descriptionNl: products.descriptionNl,
      descriptionEn: products.descriptionEn,
      categoryId: products.categoryId,
      categoryNameNl: categories.nameNl,
      categoryNameEn: categories.nameEn,
      categorySlug: categories.slug,
      pricePerKg: products.pricePerKg,
      salePricePerKg: products.salePricePerKg,
      unit: products.unit,
      mainImage: products.mainImage,
      additionalImages: products.additionalImages,
      stockQuantity: products.stockQuantity,
      stockStatus: products.stockStatus,
      origin: products.origin,
      isFeatured: products.isFeatured,
      isSeasonal: products.isSeasonal,
      isOrganic: products.isOrganic,
      isNew: products.isNew,
      badges: products.badges,
      isPublished: products.isPublished,
      sortOrder: products.sortOrder,
      nutrition: products.nutrition,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isPublished, true))
    .orderBy(asc(products.sortOrder));

  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-stone-500">
          Versassortiment laden...
        </div>
      }
    >
      <ShopClient initialProducts={allProducts} categories={allCategories} />
    </Suspense>
  );
}
