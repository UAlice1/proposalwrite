import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const proposal = await db.proposal.findFirst({
    where: { id, deletedAt: null },
    include: {
      author:    { select: { id: true, name: true, image: true } },
      sections:  { orderBy: { order: "asc" } },
      versions:  { orderBy: { version: "desc" }, take: 10 },
      activities:{ orderBy: { createdAt: "desc" }, take: 20, include: { user: { select: { id: true, name: true, image: true } } } },
    },
  });

  if (!proposal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(proposal);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  try {
    const proposal = await db.proposal.update({
      where: { id },
      data:  { ...body, updatedAt: new Date() },
    });

    await db.activity.create({
      data: {
        proposalId:  id,
        userId:      session.user.id,
        action:      "updated",
        description: `Updated proposal: ${proposal.title}`,
      },
    });

    return NextResponse.json(proposal);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await db.proposal.update({
    where: { id },
    data:  { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
