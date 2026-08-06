import type { SectionTypeKey } from "@/types";
import { SECTION_META } from "@/types";

export interface ProposalContext {
  title: string;
  clientName: string;
  clientIndustry?: string;
  projectScope: string;
  budgetRange?: string;
  sopContent?: string;
}

const SECTION_PROMPTS: Record<SectionTypeKey, string> = {
  EXECUTIVE_SUMMARY: `Write a compelling Executive Summary for this business proposal. Keep it to 2-3 concise paragraphs that highlight the opportunity, the proposed solution, and the key value delivered. Tone: professional, persuasive, and confident.`,

  PROBLEM_STATEMENT: `Write a clear Problem Statement section. Identify the core challenge or opportunity the client faces, quantify it where possible, and establish urgency. Keep it focused — 1-2 paragraphs. Avoid generic statements; be specific to the client's context.`,

  METHODOLOGY: `Write a detailed Methodology section describing the approach, steps, and processes to deliver the project. If SOP content is provided, reference and integrate it naturally. Structure it with clear phases or steps using bullet points or numbered lists where appropriate.`,

  TIMELINE: `Write an Implementation Timeline section. Break the project into realistic phases with estimated durations and key milestones. Format as a clear table or phased list. Be specific about deliverable dates relative to project kickoff.`,

  DELIVERABLES: `Write a Deliverables section that clearly lists all tangible outputs the client will receive. Group them logically. Each deliverable should be specific and measurable. Use a bullet list format.`,

  PRICING: `Write a professional Pricing & Terms section. Present the investment clearly, broken into line items where appropriate. Include payment milestones, currency (assume USD unless otherwise stated), and any key commercial terms. Be transparent and confident.`,

  CONCLUSION: `Write a strong Conclusion section that reinforces the value proposition, expresses confidence in the partnership, and ends with a clear call to action. Keep it to 1-2 paragraphs. Warm but professional in tone.`,
};

function buildSystemPrompt(ctx: ProposalContext): string {
  return `You are a senior business proposal writer specialising in African SMEs. You write professional, client-ready proposals that are persuasive, concise, and culturally relevant to the African business context. Always use clear language, avoid jargon, and structure content for easy readability. Do not add section headings — the app handles those. Do not include placeholder text or [brackets]. Write real, specific content based on the context provided.

PROPOSAL CONTEXT:
- Title: ${ctx.title}
- Client: ${ctx.clientName}
- Industry: ${ctx.clientIndustry ?? "General Business"}
- Budget: ${ctx.budgetRange ?? "To be discussed"}
- Scope: ${ctx.projectScope}
${ctx.sopContent ? `\nLINKED SOP / METHODOLOGY:\n${ctx.sopContent}` : ""}`;
}

export async function generateSection(
  ctx: ProposalContext,
  sectionType: SectionTypeKey
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Fallback demo content when no API key is set
    return getDemoContent(ctx, sectionType);
  }

  const systemPrompt = buildSystemPrompt(ctx);
  const userPrompt = SECTION_PROMPTS[sectionType];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 600,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message ?? "OpenAI API error");
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() ?? "";
}

export async function generateAllSections(
  ctx: ProposalContext
): Promise<Record<SectionTypeKey, string>> {
  const sectionTypes: SectionTypeKey[] = [
    "EXECUTIVE_SUMMARY",
    "PROBLEM_STATEMENT",
    "METHODOLOGY",
    "TIMELINE",
    "DELIVERABLES",
    "PRICING",
    "CONCLUSION",
  ];

  const results = await Promise.all(
    sectionTypes.map((type) =>
      generateSection(ctx, type).then((content) => [type, content] as const)
    )
  );

  return Object.fromEntries(results) as Record<SectionTypeKey, string>;
}

function getDemoContent(ctx: ProposalContext, type: SectionTypeKey): string {
  const demos: Record<SectionTypeKey, string> = {
    EXECUTIVE_SUMMARY: `${ctx.clientName} stands at an inflection point — the opportunity to ${ctx.projectScope.slice(0, 80)}… is both timely and strategic.\n\nOur team brings deep expertise in ${ctx.clientIndustry ?? "business transformation"}, with a proven track record of delivering measurable results for African SMEs. This proposal outlines a targeted engagement designed to deliver tangible value within the agreed budget of ${ctx.budgetRange ?? "the proposed investment"}.\n\nWe are confident this partnership will produce outcomes that exceed expectations and position ${ctx.clientName} for sustainable growth.`,

    PROBLEM_STATEMENT: `${ctx.clientName} is currently facing challenges that, if left unaddressed, will limit their ability to compete effectively in the ${ctx.clientIndustry ?? "market"}. These include operational inefficiencies, gaps in process standardisation, and the need for scalable solutions that match the pace of business growth.\n\nAddressing these challenges now creates a direct path to improved efficiency, stronger client relationships, and increased revenue — making this engagement both urgent and high-value.`,

    METHODOLOGY: `Our approach is structured, iterative, and built around ${ctx.clientName}'s specific context.\n\n## Phase 1 — Discovery & Assessment\n- Conduct stakeholder interviews and process mapping\n- Identify key bottlenecks and quick wins\n- Deliver an assessment report with prioritised recommendations\n\n## Phase 2 — Solution Design\n- Co-design solutions with the client team\n- Develop standard operating procedures and playbooks\n- Validate approach before full implementation\n\n## Phase 3 — Implementation & Handover\n- Execute approved solutions with clear accountability\n- Train internal teams for sustainability\n- Provide documentation and post-implementation support`,

    TIMELINE: `The project is estimated at 8 weeks from contract signing.\n\n- **Week 1–2:** Discovery & Stakeholder Alignment\n- **Week 3–4:** Solution Design & SOP Development\n- **Week 5–6:** Implementation & Testing\n- **Week 7:** Training & Knowledge Transfer\n- **Week 8:** Final Review, Sign-off & Handover\n\nMilestone approvals will be sought at the end of each phase to ensure alignment before proceeding.`,

    DELIVERABLES: `Upon completion, ${ctx.clientName} will receive:\n\n- Comprehensive assessment report with recommendations\n- Fully documented Standard Operating Procedures (SOPs)\n- Implemented solution with tested workflows\n- Staff training sessions and training materials\n- 30-day post-implementation support\n- Final project report and lessons learned document`,

    PRICING: `The total investment for this engagement is ${ctx.budgetRange ?? "as mutually agreed"}.\n\n- **Phase 1 (Discovery):** 30% on contract signing\n- **Phase 2 (Design):** 40% on Phase 1 sign-off\n- **Phase 3 (Delivery):** 30% on project completion\n\nAll fees are in USD unless otherwise agreed. Invoices are payable within 14 days of issue. Travel and out-of-pocket expenses, if any, will be billed at cost with prior approval. This proposal is valid for 30 days from the date of issue.`,

    CONCLUSION: `We believe ${ctx.clientName} deserves a partner who is as invested in their success as they are. Our team is ready to bring focus, expertise, and energy to this engagement from day one.\n\nTo proceed, simply sign and return this proposal or reach out to schedule a kickoff call. We look forward to building something impactful together.`,
  };
  return demos[type];
}
