import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected route patterns
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/investigations") ||
    pathname.startsWith("/network-analysis") ||
    pathname.startsWith("/ai-assistant") ||
    pathname.startsWith("/reports") ||
    pathname.startsWith("/alerts") ||
    pathname.startsWith("/entities") ||
    pathname.startsWith("/geospatial") ||
    pathname.startsWith("/evidence") ||
    pathname.startsWith("/timeline") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/modules");

  const sessionCookie = request.cookies.get("cipher_session");

  // If user is accessing a protected route without a valid session cookie, redirect to login
  if (isProtectedRoute && (!sessionCookie || !sessionCookie.value)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user has a valid session cookie and visits /login, redirect to /dashboard
  if (pathname === "/login" && sessionCookie && sessionCookie.value) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portal/:path*",
    "/investigations/:path*",
    "/network-analysis/:path*",
    "/ai-assistant/:path*",
    "/reports/:path*",
    "/alerts/:path*",
    "/entities/:path*",
    "/geospatial/:path*",
    "/evidence/:path*",
    "/timeline/:path*",
    "/search/:path*",
    "/settings/:path*",
    "/modules/:path*",
    "/login",
  ],
};
