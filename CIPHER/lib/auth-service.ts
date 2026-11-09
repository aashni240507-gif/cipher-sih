import crypto from "crypto";
import { NextRequest } from "next/server";
import {
  getUserById,
  readUsers,
  verifyPassword,
  DEFAULT_CLASSIFIED_PASSWORD,
  UserRecord,
} from "./user-service";

export const SESSION_COOKIE_NAME = "cipher_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "cipher-classified-investigative-auth-secret-key-2026";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function verifyCredentials(
  identifier: string,
  password: string
): { success: boolean; user?: UserRecord; error?: string } {
  if (!identifier || !identifier.trim()) {
    return { success: false, error: "Username or email is required." };
  }
  if (!password || !password.trim()) {
    return { success: false, error: "Password is required." };
  }

  const cleanIdentifier = identifier.trim().toLowerCase();
  const cleanPassword = password.trim();

  const users = readUsers();
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === cleanIdentifier ||
      u.name.toLowerCase() === cleanIdentifier
  );

  if (!user) {
    return {
      success: false,
      error: "Invalid credentials. Please verify your email and password.",
    };
  }

  const isMatch = verifyPassword(DEFAULT_CLASSIFIED_PASSWORD, cleanPassword);
  if (!isMatch) {
    return {
      success: false,
      error: "Invalid credentials. Please verify your email and password.",
    };
  }

  return { success: true, user };
}

export interface SessionPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export function createSessionToken(userId: string, email: string): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + SESSION_MAX_AGE;
  const payload: SessionPayload = { userId, email, iat, exp };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;
  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const payload: SessionPayload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf-8")
    );
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export async function getAuthenticatedUser(req: NextRequest): Promise<UserRecord | null> {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  if (!cookie || !cookie.value) return null;

  const session = verifySessionToken(cookie.value);
  if (!session) return null;

  return getUserById(session.userId);
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}
