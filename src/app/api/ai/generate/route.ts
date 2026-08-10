import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAISettings, callAI, buildProposalGenerationPrompt } from "@/lib/ai";
import { z } from "zod";

const schema = z.object({
  title:           z.string().min(1),
  proposalType:    z.enum(["CONSULTING","CONSTRUCTION","CREATIVE","IT_SOFTWARE","FREELANCE","GENERAL"]).default("GENERAL"),
  yourCompanyName: z.string().min(1),
  clientName:      z.string().min(1),
  clientIndustry:  z.string().optional(),
  projectDetails:  z.string().min(10),
  scope:           z.string().optional(),
  budget:          z.string().optional(),
  timeline:        z.string().optional(),
  tonePreference:  z.enum(["PROFESSIONAL","CONVERSATIONAL","EXECUTIVE"]).default("PROFESSIONAL"),
  notes:           z.string().optional(),
  proposalId:      z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const settings = await getAISettings(session.user.id);
    const prompt   = buildProposalGenerationPrompt(parsed.data);
    const raw      = await callAI(prompt, settings);

    let result;
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "AI returned invalid JSON. Please try again." }, { status: 422 });
    }

    await db.aIGeneration.create({
      data: {
        proposalId: parsed.data.proposalId,
        userId:     session.user.id,
        provider:   settings.provider,
        model:      settings.model,
        prompt:     parsed.data.projectDetails,
        result,
      },
    });

    return NextResponse.json({ result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "AI generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
