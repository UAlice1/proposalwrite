import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_API_PREFIX  = "/api/auth";
const ADMIN_API_PREFIX = "/api/admin";
const PUBLIC_PAGES     = ["/login", "/register"];

const ORG_EXEMPT_API = [
  "/api/auth",
  "/api/register",
  "/api/setup",
  "/api/assistant",
  "/api/chat",
  "/api/ai",
  "/api/proposals",
  "/api/generate-proposal",
  "/api/dashboard",
  "/api/tags",
  "/api/admin/org",
  "/api/profile",
  "/api/user",
  "/api/ai/settings",
  "/api/categories",
  "/api/departments",
  "/api/notifications",
];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always pass NextAuth endpoints through
  if (pathname.startsWith(AUTH_API_PREFIX)) {
    return NextResponse.next();
  }

  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "";

  let token = null;
  try {
    const isSecure = req.url.startsWith("https://");
    const cookieName = isSecure ? "__Secure-authjs.session-token" : "authjs.session-token";
    token = await getToken({ req, secret, cookieName, salt: cookieName });
    if (!token) {
      token = await getToken({ req, secret });
    }
  } catch {
    token = null;
  }

  const isAuthenticated = !!token;
  const role  = (token?.role  as string | undefined) ?? "EMPLOYEE";
  const orgId = (token?.organizationId as string | undefined) ?? null;

  // Auth pages — redirect logged-in users to proposals
  if (PUBLIC_PAGES.includes(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/proposals", req.url));
    }
    return NextResponse.next();
  }

  // Require authentication
  if (!isAuthenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin API guard
  if (pathname.startsWith(ADMIN_API_PREFIX)) {
    if (role !== "SUPER_ADMIN" && role !== "ORG_ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
  }

  // Org isolation (relaxed — all proposal routes exempt)
  const skipOrgCheck = ORG_EXEMPT_API.some((p) => pathname.startsWith(p));
  if (
    pathname.startsWith("/api/") &&
    role !== "SUPER_ADMIN" &&
    !orgId &&
    !skipOrgCheck
  ) {
    return NextResponse.json(
      { error: "You must belong to an organization to access this resource" },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
