import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const sectionSchema = z.object({
  key:     z.string(),
  title:   z.string(),
  content: z.string(),
  order:   z.number().optional(),
});

const schema = z.object({
  title:          z.string().min(1),
  clientName:     z.string().optional(),
  clientIndustry: z.string().optional(),
  proposalType:   z.enum(["CONSULTING","CONSTRUCTION","CREATIVE","IT_SOFTWARE","FREELANCE","GENERAL"]).default("GENERAL"),
  tonePreference: z.enum(["PROFESSIONAL","CONVERSATIONAL","EXECUTIVE"]).default("PROFESSIONAL"),
  description:    z.string().optional(),
  budget:         z.string().optional(),
  timeline:       z.string().optional(),
  notes:          z.string().optional(),
  sections:       z.array(sectionSchema).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  try {
    const proposal = await db.proposal.create({
      data: {
        title:          data.title,
        clientName:     data.clientName,
        clientIndustry: data.clientIndustry,
        proposalType:   data.proposalType,
        tonePreference: data.tonePreference,
        description:    data.description,
        budget:         data.budget,
        timeline:       data.timeline,
        notes:          data.notes,
        status:         "DRAFT",
        isAIGenerated:  true,
        authorId:       session.user.id,
        organizationId: (session.user as { organizationId?: string }).organizationId,
      },
    });

    if (data.sections?.length) {
      for (let i = 0; i < data.sections.length; i++) {
        const s = data.sections[i];
        await db.proposalSection.create({
          data: {
            proposalId: proposal.id,
            key:     s.key,
            title:   s.title,
            content: s.content,
            order:   s.order ?? i + 1,
          },
        });
      }
    }

    await db.activity.create({
      data: {
        proposalId:  proposal.id,
        userId:      session.user.id,
        action:      "created",
        description: `AI generated proposal: ${proposal.title}`,
      },
    });

    return NextResponse.json({ proposalId: proposal.id, title: proposal.title }, { status: 201 });
  } catch (err) {
    console.error("[generate-proposal] DB error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to save proposal", detail: message }, { status: 500 });
  }
}
