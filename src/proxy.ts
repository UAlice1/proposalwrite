import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const PUBLIC_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never touch auth routes
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Allow static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.match(/\.(ico|png|svg|jpg|jpeg|gif|webp|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Use NextAuth v5's auth() to read the session — getToken() is v4 only
  // and cannot decrypt the v5 encrypted cookie (authjs.session-token)
  const session = await auth();
  const isAuthenticated = !!session?.user;

  // Redirect authenticated users away from public pages
  if (PUBLIC_PAGES.some((p) => pathname.startsWith(p))) {
    if (isAuthenticated) return NextResponse.redirect(new URL("/proposals", req.url));
    return NextResponse.next();
  }

  // Require auth everywhere else
  if (!isAuthenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const url = new URL("/login", req.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
