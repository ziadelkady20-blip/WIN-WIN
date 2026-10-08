import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, products, coupons, customers, deliverySettings, orderStatusHistory } from "@/db/schema";
import crypto from "crypto";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const { getAdminSession } = await import("@/lib/auth");
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    const search = url.searchParams.get("search");
    let whereClause: any = undefined;
    if (search?.trim()) {
      const { or, ilike } = await import("drizzle-orm");
      const term = `%${search.trim()}%`;
      whereClause = or(ilike(orders.orderNumber, term), ilike(orders.customerName, term), ilike(orders.customerEmail, term), ilike(orders.customerPhone, term), ilike(orders.city, term), ilike(orders.postalCode, term));
    }
    const allOrders = await db.select().from(orders).where(whereClause).orderBy(desc(orders.createdAt));
    const ids = allOrders.map(o => o.id);
    const items = ids.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, ids)) : [];
    const itemsMap: Record<number, any[]> = {};
    for (const item of items) (itemsMap[item.orderId] ||= []).push(item);
    return NextResponse.json(allOrders.map(order => ({ ...order, items: itemsMap[order.id] || [] })));
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Fout bij ophalen bestellingen" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerEmail, customerPhone, street, houseNumber, postalCode, city, country = "Nederland", addressExtra = "", orderNotes = "", items = [], couponCode } = body;
    if (!customerName || !customerEmail || !customerPhone || !street || !houseNumber || !postalCode || !city) return NextResponse.json({ error: "Vul alle verplichte velden in voor het bezorgadres en contactgegevens" }, { status: 400 });
    if (!Array.isArray(items) || items.length === 0) return NextResponse.json({ error: "Uw winkelmand is leeg" }, { status: 400 });
    const [settings] = await db.select().from(deliverySettings).limit(1);
    const minOrderVal = settings ? Number(settings.minOrderValue) : 15;
    const freeDeliveryThreshold = settings ? Number(settings.freeDeliveryThreshold) : 35;
    const standardDeliveryFee = settings ? Number(settings.deliveryFee) : 4.95;
    const requested = items.map((it: any) => ({ id: Number(it.id), quantity: Number(it.quantity) })).filter((it: any) => Number.isInteger(it.id) && it.id > 0 && Number.isFinite(it.quantity) && it.quantity > 0);
    if (!requested.length) return NextResponse.json({ error: "Ongeldige winkelmand" }, { status: 400 });
    const productIds = [...new Set(requested.map((it: any) => it.id))];
    const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));
    const productMap = new Map(dbProducts.map(p => [p.id, p]));
    let calculatedSubtotal = 0;
    const preparedItems: any[] = [];
    for (const requestedItem of requested) {
      const product = productMap.get(requestedItem.id);
      if (!product || !product.isPublished || product.stockStatus === "out_of_stock") return NextResponse.json({ error: "Een product in uw winkelmand is niet meer beschikbaar." }, { status: 400 });
      const quantity = product.pricingType === "kg" ? Math.round(requestedItem.quantity * 100) / 100 : Math.round(requestedItem.quantity);
      const stock = Number(product.stockQuantity);
      if (quantity > stock) return NextResponse.json({ error: `${product.nameNl} heeft nog maar ${stock} ${product.pricingType === "kg" ? "kg" : product.pricingType === "pack" ? "packs" : "stuks"} op voorraad.` }, { status: 400 });
      const unitPrice = Number(product.salePricePerKg ?? product.pricePerKg);
      const itemTotal = Math.round(quantity * unitPrice * 100) / 100;
      calculatedSubtotal += itemTotal;
      preparedItems.push({ product, quantity, unitPrice, itemTotal });
    }
    calculatedSubtotal = Math.round(calculatedSubtotal * 100) / 100;
    if (calculatedSubtotal < minOrderVal) return NextResponse.json({ error: `Minimale bestelwaarde is €${minOrderVal.toFixed(2).replace(".", ",")}` }, { status: 400 });
    let discountAmount = 0;
    let appliedCouponCode: string | null = null;
    if (couponCode?.trim()) {
      const cleanCode = couponCode.trim().toUpperCase();
      const [foundCoupon] = await db.select().from(coupons).where(and(eq(coupons.code, cleanCode), eq(coupons.isActive, true))).limit(1);
      if (foundCoupon) {
        const minReq = Number(foundCoupon.minOrderAmount);
        const validDate = !foundCoupon.expiresAt || new Date(foundCoupon.expiresAt) > new Date();
        const usesLeft = foundCoupon.maxUses === null || foundCoupon.usedCount < foundCoupon.maxUses;
        if (calculatedSubtotal >= minReq && validDate && usesLeft) {
          appliedCouponCode = foundCoupon.code;
          discountAmount = foundCoupon.discountType === "percentage" ? Math.round((calculatedSubtotal * Number(foundCoupon.discountValue) / 100) * 100) / 100 : Math.min(calculatedSubtotal, Number(foundCoupon.discountValue));
        }
      }
    }
    const deliveryFee = calculatedSubtotal >= freeDeliveryThreshold ? 0 : standardDeliveryFee;
    const finalTotal = Math.max(0, Math.round((calculatedSubtotal - discountAmount + deliveryFee) * 100) / 100);
    const orderNumber = `WWF-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const confirmationToken = crypto.randomUUID();
    const createdOrder = await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values({ orderNumber, confirmationToken, customerName: customerName.trim(), customerEmail: customerEmail.toLowerCase().trim(), customerPhone: customerPhone.trim(), street: street.trim(), houseNumber: houseNumber.trim(), postalCode: postalCode.toUpperCase().trim(), city: city.trim(), country, addressExtra: addressExtra.trim(), orderNotes: orderNotes.trim(), status: "under_review", subtotal: calculatedSubtotal.toFixed(2), deliveryFee: deliveryFee.toFixed(2), discountAmount: discountAmount.toFixed(2), couponCode: appliedCouponCode, total: finalTotal.toFixed(2), paymentStatus: "pending_on_delivery", paymentMethod: "on_delivery" }).returning();
      await tx.insert(orderStatusHistory).values({ orderId: order.id, status: "under_review", note: "Order placed by customer - awaiting review" });
      for (const item of preparedItems) {
        await tx.insert(orderItems).values({ orderId: order.id, productId: item.product.id, productName: item.product.nameNl, pricePerUnit: item.unitPrice.toFixed(2), pricingType: item.product.pricingType, packQuantity: item.product.packQuantity || 1, quantity: item.quantity.toString(), unit: item.product.pricingType === "kg" ? "kg" : item.product.pricingType === "pack" ? "pack" : "piece", totalPrice: item.itemTotal.toFixed(2), productImage: item.product.mainImage });
        await tx.update(products).set({ stockQuantity: sql`GREATEST(0, ${products.stockQuantity} - ${item.quantity})`, stockStatus: sql`CASE WHEN GREATEST(0, ${products.stockQuantity} - ${item.quantity}) <= 0 THEN 'out_of_stock' WHEN GREATEST(0, ${products.stockQuantity} - ${item.quantity}) <= 20 THEN 'low_stock' ELSE 'in_stock' END`, unit: item.product.pricingType === "kg" ? "kg" : item.product.pricingType === "pack" ? "pack" : "piece", updatedAt: new Date() }).where(eq(products.id, item.product.id));
      }
      if (appliedCouponCode) await tx.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.code, appliedCouponCode));
      const email = customerEmail.toLowerCase().trim();
      const [existing] = await tx.select().from(customers).where(eq(customers.email, email)).limit(1);
      if (existing) await tx.update(customers).set({ name: customerName.trim(), phone: customerPhone.trim(), totalOrders: sql`${customers.totalOrders} + 1`, totalSpent: sql`${customers.totalSpent} + ${finalTotal.toFixed(2)}`, lastOrderDate: new Date(), updatedAt: new Date() }).where(eq(customers.id, existing.id));
      else await tx.insert(customers).values({ name: customerName.trim(), email, phone: customerPhone.trim(), totalOrders: 1, totalSpent: finalTotal.toFixed(2), lastOrderDate: new Date() });
      return order;
    });
    return NextResponse.json({ success: true, order: createdOrder });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Fout bij verwerken van bestelling" }, { status: 500 });
  }
}
