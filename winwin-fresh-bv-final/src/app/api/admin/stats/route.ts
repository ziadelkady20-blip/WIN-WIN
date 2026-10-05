import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, customers, orderItems } from "@/db/schema";
import { eq, sql, desc, lte } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    // 1. Total Orders & Pending Orders
    const [ordersCount] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(orders);

    const [pendingCount] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(orders)
      .where(eq(orders.status, "under_review"));

    // 2. Total Revenue (sum of non-cancelled orders)
    const [revenueRes] = await db
      .select({
        totalRevenue: sql<number>`coalesce(sum(case when status != 'cancelled' then cast(total as numeric) else 0 end), 0)`,
      })
      .from(orders);

    // 3. Products & Low Stock
    const [productCount] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(products);

    const lowStockItems = await db
      .select({
        id: products.id,
        nameNl: products.nameNl,
        nameEn: products.nameEn,
        stockQuantity: products.stockQuantity,
        stockStatus: products.stockStatus,
        mainImage: products.mainImage,
      })
      .from(products)
      .where(lte(products.stockQuantity, "100.00"))
      .orderBy(products.stockQuantity)
      .limit(6);

    // 4. Customers count
    const [custCount] = await db
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(customers);

    // 5. Recent 8 orders
    const recentOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(8);

    // 6. Top selling items from order_items
    const topProducts = await db
      .select({
        productName: orderItems.productName,
        totalSoldPieces: sql<number>`round(coalesce(sum(cast(${orderItems.quantity} as numeric)), 0), 1)`,
        totalSales: sql<number>`round(coalesce(sum(cast(${orderItems.totalPrice} as numeric)), 0), 2)`,
      })
      .from(orderItems)
      .groupBy(orderItems.productName)
      .orderBy(desc(sql`sum(cast(${orderItems.quantity} as numeric))`))
      .limit(5);

    // 7. Orders status distribution
    const statusDistribution = await db
      .select({
        status: orders.status,
        count: sql<number>`cast(count(*) as integer)`,
      })
      .from(orders)
      .groupBy(orders.status);

    return NextResponse.json({
      totalOrders: ordersCount?.count || 0,
      pendingOrders: pendingCount?.count || 0,
      totalRevenue: Number(revenueRes?.totalRevenue || 0),
      totalProducts: productCount?.count || 0,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      totalCustomers: custCount?.count || 0,
      recentOrders,
      topProducts,
      statusDistribution,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Fout bij berekenen statistieken" }, { status: 500 });
  }
}
