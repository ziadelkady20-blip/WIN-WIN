import { NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { comparePassword, createSessionToken, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail en wachtwoord zijn verplicht" }, { status: 400 });
    }

    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email.toLowerCase().trim()))
      .limit(1);

    if (!admin) {
      return NextResponse.json({ error: "Ongeldige inloggegevens" }, { status: 401 });
    }

    const isValid = await comparePassword(password, admin.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Ongeldige inloggegevens" }, { status: 401 });
    }

    const token = createSessionToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const response = NextResponse.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Er is een serverfout opgetreden" }, { status: 500 });
  }
}
