import { NextResponse } from "next/server";
import { db } from "@/db";
import { media } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";

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
    const mediaId = parseInt(id, 10);
    if (isNaN(mediaId)) {
      return NextResponse.json({ error: "Ongeldig media ID" }, { status: 400 });
    }

    await db.delete(media).where(eq(media.id, mediaId));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Fout bij verwijderen media" }, { status: 500 });
  }
}
