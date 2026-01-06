import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // 👇 Routes that need authentication (all protected routes)
  const protectedRoutes = [
    "/dashboard",
    "/payments",
    "/send-money",
    "/transactions",
    "/add-money",
    "/bills",
    "/insights",
    "/merchant",
    "/scan-qr",
    "/split-bill",
    "/admin"
  ];

  const tryingToAccessProtected = protectedRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  );

  // ❌ If user NOT logged in and trying to access protected route → redirect to login
  if (!token && tryingToAccessProtected) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ✅ If logged in and trying to go to login/signup → redirect to dashboard
  if (token && (req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/payments/:path*",
    "/transactions/:path*",
    "/send-money/:path*",
    "/add-money/:path*",
    "/bills/:path*",
    "/insights/:path*",
    "/merchant/:path*",
    "/scan-qr/:path*",
    "/split-bill/:path*",
    "/admin/:path*",
    "/login",
    "/signup"
  ]
};
