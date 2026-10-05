import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
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
    const couponId = parseInt(id, 10);
    if (isNaN(couponId)) {
      return NextResponse.json({ error: "Ongeldig ID" }, { status: 400 });
    }

    const body = await req.json();
    const { code, discountType, discountValue, minOrderAmount, maxUses, expiresAt, isActive } = body;

    const [updated] = await db
      .update(coupons)
      .set({
        code: code ? code.trim().toUpperCase() : undefined,
        discountType,
        discountValue: discountValue ? parseFloat(discountValue).toFixed(2) : undefined,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount).toFixed(2) : undefined,
        maxUses: maxUses !== undefined ? (maxUses ? parseInt(maxUses, 10) : null) : undefined,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      })
      .where(eq(coupons.id, couponId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Fout bij bijwerken coupon" }, { status: 500 });
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
    const couponId = parseInt(id, 10);
    if (isNaN(couponId)) {
      return NextResponse.json({ error: "Ongeldig ID" }, { status: 400 });
    }

    await db.delete(coupons).where(eq(coupons.id, couponId));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Fout bij verwijderen coupon" }, { status: 500 });
  }
}
