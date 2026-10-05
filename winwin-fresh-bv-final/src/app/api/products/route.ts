import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, and, or, ilike, gte, lte, asc, desc } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const filter = searchParams.get("filter"); // featured, seasonal, organic, sale, new
    const sort = searchParams.get("sort") || "popular"; // popular, price_asc, price_desc, newest, featured
    const adminView = searchParams.get("admin") === "true";
    if (adminView) {
      const session = await getAdminSession();
      if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }
    const publishedOnly = !adminView;
    const inStockOnly = searchParams.get("inStock") === "true";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    let conditions: any[] = [];

    if (publishedOnly) {
      conditions.push(eq(products.isPublished, true));
    }

    if (inStockOnly) {
      conditions.push(eq(products.stockStatus, "in_stock"));
    }

    if (categoryId) {
      conditions.push(eq(products.categoryId, parseInt(categoryId, 10)));
    } else if (categorySlug) {
      const [foundCat] = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.slug, categorySlug))
        .limit(1);
      if (foundCat) {
        conditions.push(eq(products.categoryId, foundCat.id));
      }
    }

    if (search && search.trim() !== "") {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(products.nameNl, term),
          ilike(products.nameEn, term),
          ilike(products.descriptionNl, term),
          ilike(products.descriptionEn, term),
          ilike(products.origin, term)
        )
      );
    }

    if (filter === "featured") {
      conditions.push(eq(products.isFeatured, true));
    } else if (filter === "seasonal") {
      conditions.push(eq(products.isSeasonal, true));
    } else if (filter === "organic") {
      conditions.push(eq(products.isOrganic, true));
    } else if (filter === "sale") {
      conditions.push(gte(products.salePricePerKg, "0.01"));
    } else if (filter === "new") {
      conditions.push(eq(products.isNew, true));
    }

    if (minPrice && !isNaN(parseFloat(minPrice))) {
      conditions.push(gte(products.pricePerKg, minPrice));
    }
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      conditions.push(lte(products.pricePerKg, maxPrice));
    }

    let orderByClause: any = asc(products.sortOrder);
    if (sort === "price_asc") {
      orderByClause = asc(products.pricePerKg);
    } else if (sort === "price_desc") {
      orderByClause = desc(products.pricePerKg);
    } else if (sort === "newest") {
      orderByClause = desc(products.createdAt);
    } else if (sort === "featured") {
      orderByClause = desc(products.isFeatured);
    } else {
      orderByClause = asc(products.sortOrder);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
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
      .where(whereClause)
      .orderBy(orderByClause);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ error: "Fout bij ophalen producten" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role === "order_manager") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const body = await req.json();
    const {
      nameNl,
      nameEn,
      descriptionNl,
      descriptionEn,
      categoryId,
      pricePerKg,
      salePricePerKg,
      unit = "kg",
      mainImage,
      additionalImages = [],
      stockQuantity = "100.00",
      stockStatus = "in_stock",
      origin = "Nederland",
      isFeatured = false,
      isSeasonal = false,
      isOrganic = false,
      isNew = false,
      badges = [],
      isPublished = true,
      sortOrder = 0,
      nutrition,
      slug,
    } = body;

    if (!nameNl || !pricePerKg || !mainImage) {
      return NextResponse.json(
        { error: "Productnaam, prijs per kg en hoofdafbeelding zijn verplicht" },
        { status: 400 }
      );
    }

    const generatedSlug = (slug || nameNl)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const [created] = await db
      .insert(products)
      .values({
        nameNl,
        nameEn: nameEn || nameNl,
        descriptionNl: descriptionNl || "",
        descriptionEn: descriptionEn || "",
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        pricePerKg: parseFloat(pricePerKg).toFixed(2),
        salePricePerKg: salePricePerKg ? parseFloat(salePricePerKg).toFixed(2) : null,
        unit,
        mainImage,
        additionalImages: Array.isArray(additionalImages) ? additionalImages : [],
        stockQuantity: parseFloat(stockQuantity).toFixed(2),
        stockStatus,
        origin,
        isFeatured: Boolean(isFeatured),
        isSeasonal: Boolean(isSeasonal),
        isOrganic: Boolean(isOrganic),
        isNew: Boolean(isNew),
        badges: Array.isArray(badges) ? badges : [],
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        sortOrder: parseInt(sortOrder || "0", 10),
        nutrition: nutrition || null,
        slug: generatedSlug,
      })
      .returning();

    return NextResponse.json(created);
  } catch (error: any) {
    console.error("Create product error:", error);
    if (error?.code === "23505") {
      return NextResponse.json({ error: "Een product met deze slug bestaat al" }, { status: 400 });
    }
    return NextResponse.json({ error: "Fout bij opslaan product" }, { status: 500 });
  }
}
