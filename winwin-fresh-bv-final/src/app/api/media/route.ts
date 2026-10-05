import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { desc, eq, and, ilike, or } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder");
    const search = searchParams.get("search");

    let conditions = [];

    if (folder && folder !== "all") {
      conditions.push(eq(media.folder, folder));
    }

    if (search && search.trim() !== "") {
      const term = `%${search.trim()}%`;
      conditions.push(or(ilike(media.name, term), ilike(media.altNl, term), ilike(media.altEn, term)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const files = await db
      .select()
      .from(media)
      .where(whereClause)
      .orderBy(desc(media.createdAt));

    return NextResponse.json(files);
  } catch (error) {
    console.error("Media GET error:", error);
    return NextResponse.json({ error: "Fout bij ophalen media" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role === "order_manager") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const body = await req.json();
    const { name, url, folder = "products", altNl, altEn, mimeType = "image/jpeg", size = 0 } = body;

    if (!name || !url) {
      return NextResponse.json({ error: "Naam en URL zijn verplicht" }, { status: 400 });
    }

    const [created] = await db
      .insert(media)
      .values({
        name,
        url,
        folder,
        altNl: altNl || "",
        altEn: altEn || "",
        mimeType,
        size,
      })
      .returning();

    return NextResponse.json(created);
  } catch (error) {
    console.error("Media POST error:", error);
    return NextResponse.json({ error: "Fout bij toevoegen media" }, { status: 500 });
  }
}
