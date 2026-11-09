import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-service";
import { updateUserProfile } from "@/lib/user-service";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Valid session required." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error("[API] GET /api/users/me error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve user profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // 1. Authenticate session from secure cookie
    const user = await getAuthenticatedUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Valid session required to update profile." },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await req.json();

    // Disallow unauthorized field mutations
    if (body.id || body.role || body.clearanceLevel || body.clearance || body.badgeNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Permission denied: Security attributes, clearance levels, and role cannot be modified.",
        },
        { status: 403 }
      );
    }

    // 3. Validation
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: "Name is required." },
        { status: 400 }
      );
    }

    const trimmedName = body.name.trim();
    if (trimmedName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    if (trimmedName.length > 60) {
      return NextResponse.json(
        { success: false, error: "Name cannot exceed 60 characters." },
        { status: 400 }
      );
    }

    // 4. Update in database
    const result = await updateUserProfile(user.id, {
      name: trimmedName,
      agencyDivision: body.agencyDivision,
    });

    if (!result.success || !result.user) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to update user profile." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: result.user,
    });
  } catch (error: any) {
    console.error("[API] PATCH /api/users/me error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
