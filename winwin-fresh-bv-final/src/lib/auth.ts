import crypto from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";

// ADMIN_JWT_SECRET is preferred. SEED_ADMIN_PASSWORD is a server-only fallback
// so the admin login still works when the bootstrap secret is the only secret
// configured in the deployment environment.
const SECRET = process.env.ADMIN_JWT_SECRET || process.env.SEED_ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "dev-only-winwin-admin-secret-change-me");
const COOKIE_NAME = "winwin_admin_session";

export interface AdminPayload {
  id: number;
  email: string;
  name: string;
  role: "super_admin" | "manager" | "order_manager";
  exp: number;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createSessionToken(admin: { id: number; email: string; name: string; role: string }): string {
  const payload: AdminPayload = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role as AdminPayload["role"],
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  if (!SECRET) throw new Error("ADMIN_JWT_SECRET is required");
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): AdminPayload | null {
  try {
    const [data, signature] = token.split(".");
    if (!data || !signature) return null;

    if (!SECRET) return null;
    const expectedSignature = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
    if (signature !== expectedSignature) return null;

    const payload: AdminPayload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export { COOKIE_NAME };
