import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, looksLikeSessionToken } from "@/lib/session";

/**
 * First gate for the admin surface: bounce requests with no session cookie.
 * The real check (database lookup: exists, not expired, not revoked) runs in
 * requireAdmin() / currentAdmin() on every admin page, action and API route.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  if (looksLikeSessionToken(request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
