import { NextRequest, NextResponse } from "next/server";
import { recordAuditEvent } from "@/lib/user-service";
import {
  verifyCredentials,
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const identifier = (body.identifier || "").trim();
    const password = (body.password || "").trim();

    if (!identifier) {
      return NextResponse.json(
        { success: false, error: "Username or email is required." },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required." },
        { status: 400 }
      );
    }

    // Verify credentials in constant-time
    const authResult = verifyCredentials(identifier, password);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error:
            authResult.error ||
            "Invalid credentials. Please verify your email and password.",
        },
        { status: 401 }
      );
    }

    const user = authResult.user;

    // Generate authenticated session token
    const token = createSessionToken(user.id, user.email);

    // Asynchronously log login audit event without blocking response
    recordAuditEvent({
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      action: "USER_LOGIN",
      userId: user.id,
      userName: user.name,
      details: `User logged in (${req.headers.get("user-agent")?.slice(0, 40) || "client"})`,
      timestamp: new Date().toISOString(),
    }).catch((err) => console.error("Audit log error:", err));

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clearanceLevel: user.clearanceLevel,
        badgeNumber: user.badgeNumber,
        agencyDivision: user.agencyDivision,
      },
    });

    // Set secure httpOnly cookie
    const cookieOptions = getSessionCookieOptions();
    response.cookies.set({
      ...cookieOptions,
      value: token,
    });

    return response;
  } catch (error: any) {
    console.error("[API] POST /api/auth/login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal authentication error." },
      { status: 500 }
    );
  }
}
