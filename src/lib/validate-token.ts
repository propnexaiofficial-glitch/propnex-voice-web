import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "propnex_secret_jwt_key_2026_key";
const GLOBAL_LOGOUT_KEY = "global_logout_at";

// Cache the global logout time to avoid DB hit on every request (TTL: 30s)
let cachedLogoutAt: Date | null = null;
let cacheExpiry = 0;

async function getGlobalLogoutAt(): Promise<Date | null> {
  const now = Date.now();
  if (cachedLogoutAt !== null && now < cacheExpiry) return cachedLogoutAt;

  try {
    const setting = await (prisma as any).globalSetting.findUnique({
      where: { key: GLOBAL_LOGOUT_KEY },
    });
    cachedLogoutAt = setting ? new Date(setting.value) : null;
    cacheExpiry = now + 30_000; // refresh cache every 30 seconds
  } catch {
    cachedLogoutAt = null;
  }
  return cachedLogoutAt;
}

/** Invalidate the in-memory cache (called after force-logout) */
export function invalidateLogoutCache() {
  cachedLogoutAt = null;
  cacheExpiry = 0;
}

/**
 * Validate a bearer token from the Authorization header.
 * Returns { userId, decoded } on success or a NextResponse(401) on failure.
 */
export async function validateToken(
  authHeader: string | null
): Promise<{ userId: string; decoded: any } | NextResponse> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split(" ")[1];
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return NextResponse.json({ message: "Session expired. Please log in again." }, { status: 401 });
  }

  // Check global force-logout: if token was issued before the logout timestamp, reject it
  const globalLogoutAt = await getGlobalLogoutAt();
  if (globalLogoutAt && decoded.iat) {
    const tokenIssuedAt = new Date(decoded.iat * 1000);
    if (tokenIssuedAt < globalLogoutAt) {
      return NextResponse.json(
        { message: "You have been logged out by the administrator. Please log in again.", forceLogout: true },
        { status: 401 }
      );
    }
  }

  const userId = decoded.sub || decoded.id;
  if (!userId) {
    return NextResponse.json({ message: "Invalid token payload" }, { status: 401 });
  }

  return { userId, decoded };
}
