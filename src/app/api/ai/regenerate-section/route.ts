import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAISettings, callAI, buildSectionRegeneratePrompt } from "@/lib/ai";
import { z } from "zod";

const schema = z.object({
  proposalId:     z.string(),
  sectionKey:     z.string(),
  sectionTitle:   z.string(),
  currentContent: z.string(),
  tonePreference: z.enum(["PROFESSIONAL","CONVERSATIONAL","EXECUTIVE"]).default("PROFESSIONAL"),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const proposal = await db.proposal.findUnique({
    where: { id: parsed.data.proposalId },
    select: { title: true, clientName: true, description: true },
  });

  if (!proposal) return NextResponse.json({ error: "Proposal not found" }, { status: 404 });

  try {
    const settings = await getAISettings(session.user.id);
    const prompt   = buildSectionRegeneratePrompt({
      sectionKey:     parsed.data.sectionKey,
      sectionTitle:   parsed.data.sectionTitle,
      proposalTitle:  proposal.title,
      clientName:     proposal.clientName ?? "the client",
      projectDetails: proposal.description ?? "",
      tonePreference: parsed.data.tonePreference,
      currentContent: parsed.data.currentContent,
    });

    const result = await callAI(prompt, settings);
    return NextResponse.json({ content: result.trim() });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Regeneration failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
