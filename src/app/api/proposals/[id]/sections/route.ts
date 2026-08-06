import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { SectionType } from "@prisma/client";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/proposals/[id]/sections">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  // Verify ownership
  const proposal = await db.proposal.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!proposal) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const { type, content } = await request.json();
  if (!type || typeof content !== "string") {
    return Response.json(
      { error: "type and content are required" },
      { status: 400 }
    );
  }

  const section = await db.proposalSection.update({
    where: {
      proposalId_type: {
        proposalId: id,
        type: type as SectionType,
      },
    },
    data: { content },
  });

  return Response.json(section);
}
