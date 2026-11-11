import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "rean-secure-editorial-secret-key-salt-2026"
);

const COOKIE_NAME = "rean_admin_session";

export interface AdminSession {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

export async function createSessionToken(session: AdminSession): Promise<string> {
  return await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      displayName: payload.displayName as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export async function setAdminSessionCookie(session: AdminSession) {
  const token = await createSessionToken(session);
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getAdminSession(req?: NextRequest): Promise<AdminSession | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }
  } else {
    try {
      const cookieStore = cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      // In static or edge contexts where cookies() is unavailable
      return null;
    }
  }

  if (!token) return null;
  return await verifySessionToken(token);
}
