import { NextResponse } from "next/server";
import { db } from "@/db";
import { homepageSections } from "@/db/schema";
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
    const sectionId = parseInt(id, 10);
    if (isNaN(sectionId)) {
      return NextResponse.json({ error: "Ongeldig sectie ID" }, { status: 400 });
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

    const [updated] = await db
      .update(homepageSections)
      .set({
        sectionType: sectionType !== undefined ? sectionType : undefined,
        titleNl: titleNl !== undefined ? titleNl : undefined,
        titleEn: titleEn !== undefined ? titleEn : undefined,
        subtitleNl: subtitleNl !== undefined ? subtitleNl : undefined,
        subtitleEn: subtitleEn !== undefined ? subtitleEn : undefined,
        contentNl: contentNl !== undefined ? contentNl : undefined,
        contentEn: contentEn !== undefined ? contentEn : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        buttonTextNl: buttonTextNl !== undefined ? buttonTextNl : undefined,
        buttonTextEn: buttonTextEn !== undefined ? buttonTextEn : undefined,
        buttonLink: buttonLink !== undefined ? buttonLink : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : undefined,
        config: config !== undefined ? config : undefined,
        updatedAt: new Date(),
      })
      .where(eq(homepageSections.id, sectionId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Homepage section PUT error:", error);
    return NextResponse.json({ error: "Fout bij bijwerken sectie" }, { status: 500 });
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
    const sectionId = parseInt(id, 10);
    if (isNaN(sectionId)) {
      return NextResponse.json({ error: "Ongeldig sectie ID" }, { status: 400 });
    }

    await db.delete(homepageSections).where(eq(homepageSections.id, sectionId));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Homepage section DELETE error:", error);
    return NextResponse.json({ error: "Fout bij verwijderen sectie" }, { status: 500 });
  }
}
