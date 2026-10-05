import { NextResponse } from "next/server";
import { db } from "@/db";
import { deliverySettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    let [settings] = await db.select().from(deliverySettings).limit(1);
    if (!settings) {
      [settings] = await db
        .insert(deliverySettings)
        .values({
          deliveryFee: "4.95",
          freeDeliveryThreshold: "35.00",
          minOrderValue: "15.00",
          deliveryZones: ["Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Haarlem", "Almere"],
        })
        .returning();
    }
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: "Fout bij ophalen bezorginstellingen" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role === "order_manager") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const body = await req.json();
    const {
      deliveryFee,
      freeDeliveryThreshold,
      minOrderValue,
      deliveryZones,
      deliveryTimeWindow,
      deliveryNotesNl,
      deliveryNotesEn,
    } = body;

    let [existing] = await db.select().from(deliverySettings).limit(1);

    if (existing) {
      const [updated] = await db
        .update(deliverySettings)
        .set({
          deliveryFee: deliveryFee !== undefined ? parseFloat(deliveryFee).toFixed(2) : undefined,
          freeDeliveryThreshold:
            freeDeliveryThreshold !== undefined ? parseFloat(freeDeliveryThreshold).toFixed(2) : undefined,
          minOrderValue: minOrderValue !== undefined ? parseFloat(minOrderValue).toFixed(2) : undefined,
          deliveryZones: Array.isArray(deliveryZones) ? deliveryZones : undefined,
          deliveryTimeWindow: deliveryTimeWindow || undefined,
          deliveryNotesNl: deliveryNotesNl || undefined,
          deliveryNotesEn: deliveryNotesEn || undefined,
          updatedAt: new Date(),
        })
        .where(eq(deliverySettings.id, existing.id))
        .returning();

      return NextResponse.json(updated);
    } else {
      const [created] = await db
        .insert(deliverySettings)
        .values({
          deliveryFee: parseFloat(deliveryFee || "4.95").toFixed(2),
          freeDeliveryThreshold: parseFloat(freeDeliveryThreshold || "35.00").toFixed(2),
          minOrderValue: parseFloat(minOrderValue || "15.00").toFixed(2),
          deliveryZones: Array.isArray(deliveryZones) ? deliveryZones : ["Amsterdam"],
          deliveryTimeWindow: deliveryTimeWindow || "Binnen 24-48 uur gekoeld bezorgd",
          deliveryNotesNl: deliveryNotesNl || "",
          deliveryNotesEn: deliveryNotesEn || "",
        })
        .returning();

      return NextResponse.json(created);
    }
  } catch (error) {
    console.error("Delivery settings PUT error:", error);
    return NextResponse.json({ error: "Fout bij opslaan bezorginstellingen" }, { status: 500 });
  }
}
