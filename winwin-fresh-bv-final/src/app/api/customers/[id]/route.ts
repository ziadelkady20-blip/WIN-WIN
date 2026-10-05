import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers, orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const { id } = await params;
    const customerId = parseInt(id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json({ error: "Ongeldig klant ID" }, { status: 400 });
    }

    const [customer] = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);

    if (!customer) {
      return NextResponse.json({ error: "Klant niet gevonden" }, { status: 404 });
    }

    // Fetch orders matching customer email
    const customerOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.customerEmail, customer.email))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({
      ...customer,
      orders: customerOrders,
    });
  } catch (error) {
    console.error("Customer detail GET error:", error);
    return NextResponse.json({ error: "Fout bij ophalen klantdetails" }, { status: 500 });
  }
}
