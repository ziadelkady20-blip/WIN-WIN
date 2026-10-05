import { NextResponse } from "next/server";
import { db } from "@/db";
import { coupons } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const subtotal = parseFloat(searchParams.get("subtotal") || "0");

    if (!code) {
      return NextResponse.json({ valid: false, error: "Geen couponcode opgegeven" }, { status: 400 });
    }

    const [coupon] = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.code, code.trim().toUpperCase()), eq(coupons.isActive, true)))
      .limit(1);

    if (!coupon) {
      return NextResponse.json({ valid: false, error: "Ongeldige couponcode" }, { status: 404 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, error: "Deze couponcode is verlopen" }, { status: 400 });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, error: "Deze couponcode heeft het maximale gebruik bereikt" }, { status: 400 });
    }

    const minAmount = parseFloat(coupon.minOrderAmount);
    if (subtotal < minAmount) {
      return NextResponse.json(
        {
          valid: false,
          error: `Minimale bestelwaarde voor deze coupon is €${minAmount.toFixed(2).replace(".", ",")}`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    return NextResponse.json({ valid: false, error: "Fout bij valideren coupon" }, { status: 500 });
  }
}
