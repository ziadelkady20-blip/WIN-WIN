import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";
    if (!activeOnly) {
      const session = await getAdminSession();
      if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    let query = db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.id));

    if (activeOnly) {
      const results = await db
        .select()
        .from(categories)
        .where(eq(categories.isActive, true))
        .orderBy(asc(categories.sortOrder), asc(categories.id));
      return NextResponse.json(results);
    }

    const results = await query;
    return NextResponse.json(results);
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ error: "Fout bij ophalen categorieën" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role === "order_manager") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const body = await req.json();
    const { nameNl, nameEn, descriptionNl, descriptionEn, image, slug, isActive, sortOrder } = body;

    if (!nameNl || !slug) {
      return NextResponse.json({ error: "Nederlandse naam en slug zijn verplicht" }, { status: 400 });
    }

    const generatedSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const [created] = await db
      .insert(categories)
      .values({
        nameNl,
        nameEn: nameEn || nameNl,
        descriptionNl: descriptionNl || "",
        descriptionEn: descriptionEn || "",
        image: image || "https://images.pexels.com/photos/5677717/pexels-photo-5677717.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
        slug: generatedSlug,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder || 0,
      })
      .returning();

    return NextResponse.json(created);
  } catch (error: any) {
    console.error("Create category error:", error);
    if (error?.code === "23505") {
      return NextResponse.json({ error: "Een categorie met deze slug bestaat al" }, { status: 400 });
    }
    return NextResponse.json({ error: "Fout bij opslaan categorie" }, { status: 500 });
  }
}
