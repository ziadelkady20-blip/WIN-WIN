import { NextResponse } from "next/server";
import { db } from "@/db";
import { storeSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    let [settings] = await db.select().from(storeSettings).limit(1);
    if (!settings) {
      [settings] = await db.insert(storeSettings).values({}).returning();
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Fout bij ophalen winkelinstellingen" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "super_admin") {
      return NextResponse.json({ error: "Alleen Super Admin kan winkelinstellingen wijzigen" }, { status: 403 });
    }

    const body = await req.json();
    let [existing] = await db.select().from(storeSettings).limit(1);

    if (existing) {
      const [updated] = await db
        .update(storeSettings)
        .set({
          storeName: body.storeName || undefined,
          logoUrl: body.logoUrl || undefined,
          phone: body.phone || undefined,
          email: body.email || undefined,
          address: body.address || undefined,
          kvkNumber: body.kvkNumber || undefined,
          vatNumber: body.vatNumber || undefined,
          openingHoursNl: body.openingHoursNl || undefined,
          openingHoursEn: body.openingHoursEn || undefined,
          currency: body.currency || undefined,
          defaultLanguage: body.defaultLanguage || undefined,
          whatsappNumber: body.whatsappNumber || undefined,
          instagramUrl: body.instagramUrl || undefined,
          facebookUrl: body.facebookUrl || undefined,
          updatedAt: new Date(),
        })
        .where(eq(storeSettings.id, existing.id))
        .returning();

      return NextResponse.json(updated);
    } else {
      const [created] = await db.insert(storeSettings).values(body).returning();
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error("Store settings PUT error:", error);
    return NextResponse.json({ error: "Fout bij opslaan winkelinstellingen" }, { status: 500 });
  }
}
