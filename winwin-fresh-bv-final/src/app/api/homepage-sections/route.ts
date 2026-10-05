import { NextResponse } from "next/server";
import { db } from "@/db";
import { homepageSections } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get("active") === "true";
    if (!activeOnly) {
      const session = await getAdminSession();
      if (!session) return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    if (activeOnly) {
      const activeSections = await db
        .select()
        .from(homepageSections)
        .where(eq(homepageSections.isActive, true))
        .orderBy(asc(homepageSections.sortOrder), asc(homepageSections.id));
      return NextResponse.json(activeSections);
    }

    const sections = await db
      .select()
      .from(homepageSections)
      .orderBy(asc(homepageSections.sortOrder), asc(homepageSections.id));

    return NextResponse.json(sections);
  } catch (error) {
    console.error("Homepage sections GET error:", error);
    return NextResponse.json({ error: "Fout bij ophalen secties" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role === "order_manager") {
      return NextResponse.json({ error: "Geen toegang" }, { status: 403 });
    }

    const body = await req.json();
    const {
      sectionType,
      titleNl,
      titleEn,
      subtitleNl,
      subtitleEn,
      contentNl,
      contentEn,
      imageUrl,
      buttonTextNl,
      buttonTextEn,
      buttonLink,
      isActive,
      sortOrder,
      config,
    } = body;

    if (!sectionType || !titleNl) {
      return NextResponse.json({ error: "Sectietype en titel zijn verplicht" }, { status: 400 });
    }

    const [created] = await db
      .insert(homepageSections)
      .values({
        sectionType,
        titleNl,
        titleEn: titleEn || titleNl,
        subtitleNl: subtitleNl || "",
        subtitleEn: subtitleEn || "",
        contentNl: contentNl || "",
        contentEn: contentEn || "",
        imageUrl: imageUrl || "",
        buttonTextNl: buttonTextNl || "",
        buttonTextEn: buttonTextEn || "",
        buttonLink: buttonLink || "",
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
        config: config || {},
      })
      .returning();

    return NextResponse.json(created);
  } catch (error) {
    console.error("Homepage section POST error:", error);
    return NextResponse.json({ error: "Fout bij aanmaken sectie" }, { status: 500 });
  }
}
