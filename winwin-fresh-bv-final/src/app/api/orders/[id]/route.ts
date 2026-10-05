import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, orderItems, orderStatusHistory } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const token = url.searchParams.get("token");
    const admin = await getAdminSession();

    const numId = parseInt(id, 10);
    const condition = !isNaN(numId)
      ? or(eq(orders.id, numId), eq(orders.orderNumber, id))
      : eq(orders.orderNumber, id);

    const [order] = await db.select().from(orders).where(condition).limit(1);
    if (!order) return NextResponse.json({ error: "Bestelling niet gevonden" }, { status: 404 });

    if (!admin && (!token || token !== order.confirmationToken)) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    const history = await db.select().from(orderStatusHistory).where(eq(orderStatusHistory.orderId, order.id)).orderBy(orderStatusHistory.createdAt);
    return NextResponse.json({ ...order, items, statusHistory: history });
  } catch (error) {
    console.error("Order GET error:", error);
    return NextResponse.json({ error: "Fout bij ophalen bestelling" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });

    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) return NextResponse.json({ error: "Ongeldig bestel ID" }, { status: 400 });

    const body = await req.json();
    const allowedStatuses = ["under_review","confirmed","preparing","out_for_delivery","delivered","cancelled"];
    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Ongeldige bestelstatus" }, { status: 400 });
    }

    const current = await db.select({ status: orders.status }).from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!current[0]) return NextResponse.json({ error: "Bestelling niet gevonden" }, { status: 404 });

    const [updated] = await db.transaction(async (tx) => {
      const [updatedOrder] = await tx.update(orders).set({
        status: body.status !== undefined ? body.status : undefined,
        paymentStatus: body.paymentStatus !== undefined ? body.paymentStatus : undefined,
        orderNotes: body.orderNotes !== undefined ? body.orderNotes : undefined,
        updatedAt: new Date(),
      }).where(eq(orders.id, orderId)).returning();

      if (body.status !== undefined && body.status !== current[0].status) {
        await tx.insert(orderStatusHistory).values({
          orderId,
          status: body.status,
          note: typeof body.note === "string" ? body.note.slice(0, 500) : "",
        });
      }
      return [updatedOrder];
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Fout bij bijwerken status" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session || session.role === "order_manager") return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    const { id } = await params;
    const orderId = parseInt(id, 10);
    if (isNaN(orderId)) return NextResponse.json({ error: "Ongeldig bestel ID" }, { status: 400 });
    await db.delete(orders).where(eq(orders.id, orderId));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Fout bij verwijderen bestelling" }, { status: 500 });
  }
}
