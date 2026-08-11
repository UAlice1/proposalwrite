import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function isAdmin(role: string) {
  return role === "SUPER_ADMIN" || role === "ORG_ADMIN";
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role  = (session.user as { role?: string }).role ?? "EMPLOYEE";
  const orgId = (session.user as { organizationId?: string }).organizationId;
  if (!orgId)       return NextResponse.json({ error: "No organization" }, { status: 404 });
  if (!isAdmin(role)) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const org = await db.organization.findUnique({
    where:   { id: orgId },
    include: {
      users: {
        orderBy: { name: "asc" },
        select:  { id: true, name: true, email: true, role: true, createdAt: true, image: true },
      },
      _count: { select: { users: true, proposals: true } },
    },
  });

  return NextResponse.json(org);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role  = (session.user as { role?: string }).role ?? "EMPLOYEE";
  const orgId = (session.user as { organizationId?: string }).organizationId;
  if (!orgId)       return NextResponse.json({ error: "No organization" }, { status: 404 });
  if (!isAdmin(role)) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { name, description, brandColor } = await req.json();
  const org = await db.organization.update({
    where: { id: orgId },
    data:  { name, description, brandColor },
  });
  return NextResponse.json(org);
}
