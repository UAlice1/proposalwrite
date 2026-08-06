import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SECTION_META } from "@/types";
import type { SectionTypeKey } from "@/types";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { proposalId, sectionType, proposalContext } = await req.json();

    // Verify ownership
    const proposal = await db.proposal.findUnique({
      where: { id: proposalId },
      include: { user: true },
    });

    if (!proposal || proposal.user.email !== session.user.email) {
      return new Response("Forbidden", { status: 403 });
    }

    const sectionMeta = SECTION_META[sectionType as SectionTypeKey];
    if (!sectionMeta) {
      return new Response("Invalid section type", { status: 400 });
    }

    const prompt = buildPrompt(sectionType, sectionMeta, proposalContext);

    const result = await streamText({
      model: openai("gpt-4o-mini"),
      prompt,
      temperature: 0.7,
      maxTokens: 1000,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Generation error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

function buildPrompt(
  sectionType: string,
  sectionMeta: { title: string; description: string },
  context: string
): string {
  const basePrompt = `You are an expert business proposal writer for African SMEs. Write the "${sectionMeta.title}" section for a proposal.

Context:
${context}

Requirements:
- Use clear, professional, and persuasive language
- Tailor content for African SME audience (culturally relevant, practical)
- Be concise yet comprehensive
- Use bullet points or structured paragraphs as appropriate
- Write 150-300 words

Section purpose: ${sectionMeta.description}

${getSectionGuidance(sectionType)}

Write the section now:`;

  return basePrompt;
}

function getSectionGuidance(sectionType: string): string {
  const guidance: Record<string, string> = {
    EXECUTIVE_SUMMARY:
      "Start with a hook, summarize the opportunity, highlight your unique value, and close with expected impact.",
    PROBLEM_STATEMENT:
      "Describe the client's challenge or opportunity. Use data if possible. Show empathy and understanding.",
    METHODOLOGY:
      "Outline your approach, key steps, and frameworks. If SOPs are linked, reference them. Emphasize reliability and proven methods.",
    TIMELINE:
      "Break into phases with realistic timeframes. Use bullet points for clarity. Include key milestones.",
    DELIVERABLES:
      "List concrete, measurable outputs. Be specific about what the client receives.",
    PRICING:
      "Structure as clear line items or package options. Justify value. Include payment terms if relevant.",
    CONCLUSION:
      "Recap value proposition, express enthusiasm, provide clear call to action and next steps.",
  };
  return guidance[sectionType] ?? "Follow best practices for professional proposals.";
}
