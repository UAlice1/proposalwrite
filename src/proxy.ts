import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never touch auth routes
  if (pathname.startsWith("/api/auth")) return NextResponse.next();

  // Allow static assets
  if (pathname.startsWith("/_next") || pathname.startsWith("/images") || pathname.match(/\.(ico|png|svg|jpg|jpeg|gif|webp|css|js)$/)) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";

  let token = null;
  try {
    token = await getToken({ req, secret });
  } catch {
    token = null;
  }

  const isAuthenticated = !!token;

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
    // Only set callbackUrl for non-auth pages to avoid redirect loops
    if (!PUBLIC_PAGES.some((p) => pathname.startsWith(p))) {
      url.searchParams.set("callbackUrl", pathname);
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}


