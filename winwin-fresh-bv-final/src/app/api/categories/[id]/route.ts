import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = parseInt(id, 10);
    if (isNaN(catId)) {
      return NextResponse.json({ error: "Ongeldig ID" }, { status: 400 });
    }

    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, catId))
      .limit(1);

    if (!category) {
      return NextResponse.json({ error: "Categorie niet gevonden" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "Fout bij ophalen categorie" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session || session.role === "order_manager") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const { id } = await params;
    const catId = parseInt(id, 10);
    if (isNaN(catId)) {
      return NextResponse.json({ error: "Ongeldig ID" }, { status: 400 });
    }

    const body = await req.json();
    const { nameNl, nameEn, descriptionNl, descriptionEn, image, slug, isActive, sortOrder } = body;

    const [updated] = await db
      .update(categories)
      .set({
        nameNl,
        nameEn,
        descriptionNl,
        descriptionEn,
        image,
        slug,
        isActive: isActive !== undefined ? isActive : true,
        sortOrder: sortOrder !== undefined ? sortOrder : 0,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, catId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json({ error: "Fout bij bijwerken categorie" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session || session.role === "order_manager") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const { id } = await params;
    const catId = parseInt(id, 10);
    if (isNaN(catId)) {
      return NextResponse.json({ error: "Ongeldig ID" }, { status: 400 });
    }

    await db.delete(categories).where(eq(categories.id, catId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json({ error: "Fout bij verwijderen categorie" }, { status: 500 });
  }
}
