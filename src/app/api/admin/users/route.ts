import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Permission, ASSIGNABLE_ROLES, type UserRole } from "@/lib/permissions";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role  = (session.user as { role?: string }).role ?? "EMPLOYEE";
  const orgId = (session.user as { organizationId?: string }).organizationId;

  if (!orgId)                          return NextResponse.json({ error: "No organization" }, { status: 400 });
  if (!Permission.canManageOrg(role))  return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const users = await db.user.findMany({
    where:   { organizationId: orgId },
    orderBy: { name: "asc" },
    select:  { id: true, name: true, email: true, role: true, createdAt: true, image: true },
  });

  return NextResponse.json(users);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role  = (session.user as { role?: string }).role ?? "EMPLOYEE";
  const orgId = (session.user as { organizationId?: string }).organizationId;

  if (!orgId)                         return NextResponse.json({ error: "No organization" }, { status: 400 });
  if (!Permission.canManageOrg(role)) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { userId, newRole } = (await req.json()) as { userId: string; newRole?: string };
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  if (newRole && !ASSIGNABLE_ROLES.includes(newRole as UserRole)) {
    return NextResponse.json({ error: `Invalid role` }, { status: 400 });
  }
  if (newRole === "SUPER_ADMIN" && role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Cannot assign SUPER_ADMIN role" }, { status: 403 });
  }

  const target = await db.user.findFirst({ where: { id: userId, organizationId: orgId } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const updated = await db.user.update({
    where:  { id: userId },
    data:   { ...(newRole ? { role: newRole as import("@prisma/client").UserRole } : {}) },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role  = (session.user as { role?: string }).role ?? "EMPLOYEE";
  const orgId = (session.user as { organizationId?: string }).organizationId;

  if (!orgId)                         return NextResponse.json({ error: "No organization" }, { status: 400 });
  if (!Permission.canManageOrg(role)) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
  if (userId === session.user.id) return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });

  const target = await db.user.findFirst({ where: { id: userId, organizationId: orgId } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  await db.user.update({
    where: { id: userId },
    data:  { organizationId: null, role: "EMPLOYEE" },
  });

  return NextResponse.json({ success: true });
}
