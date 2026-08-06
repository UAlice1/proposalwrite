import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateSection } from "@/lib/ai";
import type { SectionType } from "@prisma/client";
import type { SectionTypeKey } from "@/types";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/proposals/[id]/regenerate">
) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  // Get proposal
  const proposal = await db.proposal.findFirst({
    where: { id, userId: session.user.id },
    select: {
      title: true,
      clientName: true,
      clientIndustry: true,
      projectScope: true,
      budgetRange: true,
      linkedSopId: true,
    },
  });

  if (!proposal) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const { section } = await request.json();
  if (!section) {
    return Response.json({ error: "section is required" }, { status: 400 });
  }

  // Generate fresh content
  const content = await generateSection(
    {
      title: proposal.title,
      clientName: proposal.clientName,
      clientIndustry: proposal.clientIndustry ?? undefined,
      projectScope: proposal.projectScope ?? "",
      budgetRange: proposal.budgetRange ?? undefined,
    },
    section as SectionTypeKey
  );

  // Update the section
  await db.proposalSection.update({
    where: {
      proposalId_type: {
        proposalId: id,
        type: section as SectionType,
      },
    },
    data: { content },
  });

  return Response.json({ content });
}
