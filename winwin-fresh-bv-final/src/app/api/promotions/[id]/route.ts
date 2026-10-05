import { NextResponse } from "next/server";
import { db } from "@/db";
import { promotions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

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
    const promoId = parseInt(id, 10);
    if (isNaN(promoId)) {
      return NextResponse.json({ error: "Ongeldig ID" }, { status: 400 });
    }

    const body = await req.json();
    const {
      titleNl,
      titleEn,
      descriptionNl,
      descriptionEn,
      promoBadge,
      bannerImage,
      discountPercentage,
      startDate,
      endDate,
      isActive,
      linkUrl,
    } = body;

    const [updated] = await db
      .update(promotions)
      .set({
        titleNl,
        titleEn: titleEn || titleNl,
        descriptionNl,
        descriptionEn,
        promoBadge,
        bannerImage,
        discountPercentage: discountPercentage ? parseFloat(discountPercentage).toFixed(2) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        linkUrl,
        updatedAt: new Date(),
      })
      .where(eq(promotions.id, promoId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Promotions PUT error:", error);
    return NextResponse.json({ error: "Fout bij bijwerken actie" }, { status: 500 });
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
    const promoId = parseInt(id, 10);
    if (isNaN(promoId)) {
      return NextResponse.json({ error: "Ongeldig ID" }, { status: 400 });
    }

    await db.delete(promotions).where(eq(promotions.id, promoId));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Fout bij verwijderen actie" }, { status: 500 });
  }
}
