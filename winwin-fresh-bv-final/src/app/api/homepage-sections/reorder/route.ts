import { NextResponse } from "next/server";
import { db } from "@/db";
import { homepageSections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role === "order_manager") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const { items } = await req.json(); // Array of { id: number, sortOrder: number }
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Ongeldige gegevens" }, { status: 400 });
    }

    for (const item of items) {
      await db
        .update(homepageSections)
        .set({ sortOrder: item.sortOrder, updatedAt: new Date() })
        .where(eq(homepageSections.id, item.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder error:", error);
    return NextResponse.json({ error: "Fout bij herschikken van secties" }, { status: 500 });
  }
}
