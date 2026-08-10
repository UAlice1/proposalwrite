import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const original = await db.proposal.findUnique({
    where: { id },
    include: { sections: true },
  });

  if (!original) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const copy = await db.proposal.create({
    data: {
      title:          `${original.title} (Copy)`,
      clientName:     original.clientName,
      clientIndustry: original.clientIndustry,
      proposalType:   original.proposalType,
      tonePreference: original.tonePreference,
      description:    original.description,
      budget:         original.budget,
      timeline:       original.timeline,
      notes:          original.notes,
      isAIGenerated:  original.isAIGenerated,
      status:         "DRAFT",
      authorId:       session.user.id,
      organizationId: original.organizationId,
    },
  });

  if (original.sections.length) {
    await db.proposalSection.createMany({
      data: original.sections.map((s) => ({
        proposalId: copy.id,
        key:     s.key,
        title:   s.title,
        content: s.content,
        order:   s.order,
      })),
    });
  }

  return NextResponse.json({ id: copy.id });
}
