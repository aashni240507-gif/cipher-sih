import { NextRequest, NextResponse } from "next/server";
import {
  getAuthenticatedUser,
  SESSION_COOKIE_NAME,
} from "@/lib/auth-service";
import { recordAuditEvent } from "@/lib/user-service";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    if (user) {
      await recordAuditEvent({
        id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        action: "USER_LOGOUT",
        userId: user.id,
        userName: user.name,
        details: "User initiated platform logout",
        timestamp: new Date().toISOString(),
      });
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });

    // Invalidate session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error: any) {
    console.error("[API] POST /api/auth/logout error:", error);
    // Still clear cookie even on error
    const response = NextResponse.json(
      { success: false, message: "Session cleared" },
      { status: 200 }
    );
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
    return response;
  }
}
