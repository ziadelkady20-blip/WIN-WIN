import { NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getAdminSession, hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "super_admin") {
      return NextResponse.json({ error: "Alleen Super Admin heeft toegang tot gebruikersbeheer" }, { status: 403 });
    }

    const allAdmins = await db
      .select({
        id: admins.id,
        email: admins.email,
        name: admins.name,
        role: admins.role,
        createdAt: admins.createdAt,
      })
      .from(admins)
      .orderBy(desc(admins.createdAt));

    return NextResponse.json(allAdmins);
  } catch (error) {
    return NextResponse.json({ error: "Fout bij ophalen beheerders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "super_admin") {
      return NextResponse.json({ error: "Alleen Super Admin kan nieuwe beheerders aanmaken" }, { status: 403 });
    }

    const body = await req.json();
    const { email, name, password, role = "manager" } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Naam, e-mail en wachtwoord zijn verplicht" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const [created] = await db
      .insert(admins)
      .values({
        email: email.toLowerCase().trim(),
        name: name.trim(),
        passwordHash,
        role,
      })
      .returning({
        id: admins.id,
        email: admins.email,
        name: admins.name,
        role: admins.role,
        createdAt: admins.createdAt,
      });

    return NextResponse.json(created);
  } catch (error: any) {
    if (error?.code === "23505") {
      return NextResponse.json({ error: "Dit e-mailadres is al in gebruik" }, { status: 400 });
    }
    return NextResponse.json({ error: "Fout bij aanmaken beheerder" }, { status: 500 });
  }
}
