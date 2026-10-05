import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const allCoupons = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
    return NextResponse.json(allCoupons);
  } catch (error) {
    return NextResponse.json({ error: "Fout bij ophalen coupons" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role === "order_manager") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const body = await req.json();
    const { code, discountType = "percentage", discountValue, minOrderAmount = "0.00", maxUses, expiresAt, isActive } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ error: "Couponcode en kortingswaarde zijn verplicht" }, { status: 400 });
    }

    const [created] = await db
      .insert(coupons)
      .values({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue).toFixed(2),
        minOrderAmount: parseFloat(minOrderAmount || "0").toFixed(2),
        maxUses: maxUses ? parseInt(maxUses, 10) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      })
      .returning();

    return NextResponse.json(created);
  } catch (error: any) {
    if (error?.code === "23505") {
      return NextResponse.json({ error: "Deze couponcode bestaat al" }, { status: 400 });
    }
    return NextResponse.json({ error: "Fout bij aanmaken coupon" }, { status: 500 });
  }
}
