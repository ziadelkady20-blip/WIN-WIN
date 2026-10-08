import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    const condition = !isNaN(numId) ? or(eq(products.id, numId), eq(products.slug, id)) : eq(products.slug, id);
    const [product] = await db.select({
      id: products.id, slug: products.slug, nameNl: products.nameNl, nameEn: products.nameEn,
      descriptionNl: products.descriptionNl, descriptionEn: products.descriptionEn, categoryId: products.categoryId,
      categoryNameNl: categories.nameNl, categoryNameEn: categories.nameEn, categorySlug: categories.slug,
      pricePerKg: products.pricePerKg, salePricePerKg: products.salePricePerKg, unit: products.unit,
      mainImage: products.mainImage, additionalImages: products.additionalImages, stockQuantity: products.stockQuantity,
      stockStatus: products.stockStatus, origin: products.origin, isFeatured: products.isFeatured, isSeasonal: products.isSeasonal,
      isOrganic: products.isOrganic, isNew: products.isNew, badges: products.badges, homepagePlacements: products.homepagePlacements, isPublished: products.isPublished,
      sortOrder: products.sortOrder, nutrition: products.nutrition, createdAt: products.createdAt,
    }).from(products).leftJoin(categories, eq(products.categoryId, categories.id)).where(condition).limit(1);
    if (!product) return NextResponse.json({ error: "Product niet gevonden" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json({ error: "Fout bij ophalen product" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session || session.role === "order_manager") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    const { id } = await params;
    const prodId = parseInt(id, 10);
    if (isNaN(prodId)) return NextResponse.json({ error: "Ongeldig product ID" }, { status: 400 });
    const body = await req.json();
    const pricingUnit = unit === "kg" ? "kg" : "piece";
    const { nameNl, nameEn, descriptionNl, descriptionEn, categoryId, pricePerKg, salePricePerKg, unit = "piece", mainImage,
      additionalImages, stockQuantity, stockStatus, origin, isFeatured, isSeasonal, isOrganic, isNew, badges, homepagePlacements,
      isPublished, sortOrder, nutrition, slug } = body;
    const [updated] = await db.update(products).set({
      nameNl, nameEn: nameEn || nameNl, descriptionNl: descriptionNl || "", descriptionEn: descriptionEn || "",
      categoryId: categoryId ? parseInt(categoryId, 10) : null, pricePerKg: pricePerKg ? parseFloat(pricePerKg).toFixed(2) : undefined,
      salePricePerKg: salePricePerKg ? parseFloat(salePricePerKg).toFixed(2) : null, unit: pricingUnit, mainImage,
      additionalImages: Array.isArray(additionalImages) ? additionalImages : [], stockQuantity: stockQuantity ? parseFloat(stockQuantity).toFixed(pricingUnit === "kg" ? 2 : 0) : undefined,
      stockStatus: stockStatus || "in_stock", origin: origin || "Nederland", isFeatured: Boolean(isFeatured), isSeasonal: Boolean(isSeasonal),
      isOrganic: Boolean(isOrganic), isNew: Boolean(isNew), badges: Array.isArray(badges) ? badges : [], homepagePlacements: Array.isArray(homepagePlacements) ? homepagePlacements : [],
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true, sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
      nutrition: nutrition || null, slug: slug || undefined, updatedAt: new Date(),
    }).where(eq(products.id, prodId)).returning();
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Fout bij bijwerken product" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session || session.role === "order_manager") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    const { id } = await params;
    const prodId = parseInt(id, 10);
    if (isNaN(prodId)) return NextResponse.json({ error: "Ongeldig product ID" }, { status: 400 });
    await db.delete(products).where(eq(products.id, prodId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Fout bij verwijderen product" }, { status: 500 });
  }
}
