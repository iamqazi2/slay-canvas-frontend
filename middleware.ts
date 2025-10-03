import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/workspace", "/chat", "/payment", "/boards"];

// Routes that should redirect to boards if user is authenticated
const authRoutes = ["/form"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get access token from cookies
  const accessToken = request.cookies.get("access_token")?.value;
  const isAuthenticated = !!accessToken;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/form", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes to boards
  if (isAuthRoute && isAuthenticated) {
    const boardsUrl = new URL("/boards", request.url);
    return NextResponse.redirect(boardsUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
