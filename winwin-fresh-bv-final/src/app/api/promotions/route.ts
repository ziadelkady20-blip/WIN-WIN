import { NextResponse } from "next/server";
import { db } from "@/db";
import { promotions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    if (searchParams.get("active") !== "true") {
      const session = await getAdminSession();
      if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }
    const activeOnly = searchParams.get("active") === "true";

    if (activeOnly) {
      const activePromos = await db
        .select()
        .from(promotions)
        .where(eq(promotions.isActive, true))
        .orderBy(desc(promotions.createdAt));
      return NextResponse.json(activePromos);
    }

    const allPromos = await db
      .select()
      .from(promotions)
      .orderBy(desc(promotions.createdAt));

    return NextResponse.json(allPromos);
  } catch (error) {
    console.error("Promotions GET error:", error);
    return NextResponse.json({ error: "Fout bij ophalen acties" }, { status: 500 });
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

    if (!titleNl) {
      return NextResponse.json({ error: "Titel is verplicht" }, { status: 400 });
    }

    const [created] = await db
      .insert(promotions)
      .values({
        titleNl,
        titleEn: titleEn || titleNl,
        descriptionNl: descriptionNl || "",
        descriptionEn: descriptionEn || "",
        promoBadge: promoBadge || "ACTIE",
        bannerImage: bannerImage || "",
        discountPercentage: discountPercentage ? parseFloat(discountPercentage).toFixed(2) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        linkUrl: linkUrl || "/shop",
      })
      .returning();

    return NextResponse.json(created);
  } catch (error) {
    console.error("Promotions POST error:", error);
    return NextResponse.json({ error: "Fout bij opslaan actie" }, { status: 500 });
  }
}
