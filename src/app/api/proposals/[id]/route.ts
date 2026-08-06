import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/proposals/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const proposal = await db.proposal.findFirst({
    where: { id, userId: session.user.id },
    include: { sections: { orderBy: { order: "asc" } } },
  });

  if (!proposal) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(proposal);
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/proposals/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const proposal = await db.proposal.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!proposal) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const allowed = ["title", "status", "clientName", "clientIndustry", "budgetRange"];
  const data: Record<string, string> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  const updated = await db.proposal.update({ where: { id }, data });
  return Response.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/proposals/[id]">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  const proposal = await db.proposal.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!proposal) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  await db.proposal.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
