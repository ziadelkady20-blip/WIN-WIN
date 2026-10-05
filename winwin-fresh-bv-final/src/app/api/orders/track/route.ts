import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, orderStatusHistory } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { orderNumber, phone } = await req.json();
    const cleanOrder = String(orderNumber || "").trim().toUpperCase();
    const cleanPhone = String(phone || "").trim();
    if (!cleanOrder || !cleanPhone) return NextResponse.json({ error: "Order reference and phone number are required." }, { status: 400 });

    const [order] = await db.select({
      id: orders.id, orderNumber: orders.orderNumber, status: orders.status,
      createdAt: orders.createdAt, customerName: orders.customerName,
      subtotal: orders.subtotal, deliveryFee: orders.deliveryFee,
      discountAmount: orders.discountAmount, total: orders.total,
    }).from(orders).where(and(eq(orders.orderNumber, cleanOrder), eq(orders.customerPhone, cleanPhone))).limit(1);

    if (!order) return NextResponse.json({ error: "Order not found. Check the reference and phone number." }, { status: 404 });
    const items = await db.select({ productName: orderItems.productName, quantity: orderItems.quantity, unit: orderItems.unit, totalPrice: orderItems.totalPrice, productImage: orderItems.productImage }).from(orderItems).where(eq(orderItems.orderId, order.id));
    const history = await db.select({ status: orderStatusHistory.status, note: orderStatusHistory.note, createdAt: orderStatusHistory.createdAt }).from(orderStatusHistory).where(eq(orderStatusHistory.orderId, order.id)).orderBy(orderStatusHistory.createdAt);
    return NextResponse.json({ ...order, items, statusHistory: history });
  } catch (error) {
    console.error("Order tracking error:", error);
    return NextResponse.json({ error: "Could not track this order." }, { status: 500 });
  }
}
