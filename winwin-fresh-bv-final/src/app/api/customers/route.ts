import { NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { desc, ilike, or } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let whereClause = undefined;
    if (search && search.trim() !== "") {
      const term = `%${search.trim()}%`;
      whereClause = or(
        ilike(customers.name, term),
        ilike(customers.email, term),
        ilike(customers.phone, term)
      );
    }

    const allCustomers = await db
      .select()
      .from(customers)
      .where(whereClause)
      .orderBy(desc(customers.lastOrderDate));

    return NextResponse.json(allCustomers);
  } catch (error) {
    console.error("Customers GET error:", error);
    return NextResponse.json({ error: "Fout bij ophalen klanten" }, { status: 500 });
  }
}
