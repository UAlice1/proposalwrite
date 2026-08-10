import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const sectionSchema = z.object({
  id:      z.string().optional(),
  key:     z.string(),
  title:   z.string(),
  content: z.string(),
  order:   z.number(),
});

const bodySchema = z.object({ sections: z.array(sectionSchema) });

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: proposalId } = await params;
  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // Delete existing and recreate
  await db.proposalSection.deleteMany({ where: { proposalId } });
  await db.proposalSection.createMany({
    data: parsed.data.sections.map((s) => ({
      proposalId,
      key:     s.key,
      title:   s.title,
      content: s.content,
      order:   s.order,
    })),
  });

  await db.proposal.update({ where: { id: proposalId }, data: { updatedAt: new Date() } });

  return NextResponse.json({ success: true });
}
