import { db } from "@/lib/db";

export interface AIProvider {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
}

const DEFAULT_MODELS: Record<string, string> = {
  openai:      "gpt-4o-mini",
  anthropic:   "claude-3-5-sonnet-20241022",
  groq:        "llama-3.3-70b-versatile",
  openrouter:  "openai/gpt-4o-mini",
  deepseek:    "deepseek-chat",
  mistral:     "mistral-small-latest",
  custom:      "",
};

const DEFAULT_BASE_URLS: Record<string, string> = {
  openai:     "https://api.openai.com/v1",
  anthropic:  "https://api.anthropic.com/v1",
  groq:       "https://api.groq.com/openai/v1",
  openrouter: "https://openrouter.ai/api/v1",
  deepseek:   "https://api.deepseek.com/v1",
  mistral:    "https://api.mistral.ai/v1",
};

export async function getAISettings(userId: string): Promise<AIProvider> {
  const settings = await db.aISettings.findUnique({ where: { userId } });
  const provider = settings?.provider ?? "openai";
  const model    = settings?.model && settings.model !== ""
    ? settings.model
    : DEFAULT_MODELS[provider] ?? "gpt-4o-mini";
  const apiKey = settings?.apiKey ?? process.env.OPENAI_API_KEY ?? "";
  const baseUrl = settings?.baseUrl ?? undefined;
  return { provider, model, apiKey, baseUrl };
}

export type ProposalType = "CONSULTING" | "CONSTRUCTION" | "CREATIVE" | "IT_SOFTWARE" | "FREELANCE" | "GENERAL";
export type TonePreference = "PROFESSIONAL" | "CONVERSATIONAL" | "EXECUTIVE";

const PROPOSAL_TYPE_LABELS: Record<ProposalType, string> = {
  CONSULTING:   "Consulting",
  CONSTRUCTION: "Construction / Bid",
  CREATIVE:     "Creative Agency",
  IT_SOFTWARE:  "IT / Software",
  FREELANCE:    "Freelance / General",
  GENERAL:      "General Business",
};

const TONE_INSTRUCTIONS: Record<TonePreference, string> = {
  PROFESSIONAL:    "Use formal, polished, corporate language. Be precise and authoritative.",
  CONVERSATIONAL:  "Use friendly, clear, approachable language. Avoid jargon. Speak directly to the reader.",
  EXECUTIVE:       "Use concise, high-level executive language. Lead with value and ROI. Avoid operational detail.",
};

const TYPE_INSTRUCTIONS: Record<ProposalType, string> = {
  CONSULTING:   "Focus on strategic recommendations, methodology, measurable deliverables, and ROI. Emphasise expertise and past results.",
  CONSTRUCTION: "Focus on bid breakdown, materials, labour, safety schedule, compliance requirements, and project milestones.",
  CREATIVE:     "Focus on creative brief, concept overview, deliverables, revision policy, and timeline.",
  IT_SOFTWARE:  "Focus on technical architecture, stack, development milestones, SLAs, IP ownership, and support terms.",
  FREELANCE:    "Keep it concise: clear scope, rate, payment schedule, IP transfer, and revision limits.",
  GENERAL:      "Provide a comprehensive, professional proposal covering all standard sections.",
};

export function buildProposalGenerationPrompt(input: {
  title: string;
  proposalType: ProposalType;
  yourCompanyName: string;
  clientName: string;
  clientIndustry?: string;
  projectDetails: string;
  scope?: string;
  budget?: string;
  timeline?: string;
  tonePreference: TonePreference;
  notes?: string;
}): string {
  const typeLabel = PROPOSAL_TYPE_LABELS[input.proposalType];
  const toneInstr = TONE_INSTRUCTIONS[input.tonePreference];
  const typeInstr = TYPE_INSTRUCTIONS[input.proposalType];

  return `You are an expert business proposal writer for African SMEs. Generate a complete, professional ${typeLabel} proposal.

TONE: ${toneInstr}
TYPE-SPECIFIC GUIDANCE: ${typeInstr}

CONTEXT:
- Proposal Title: ${input.title}
- Our Company: ${input.yourCompanyName}
- Client / Recipient: ${input.clientName}${input.clientIndustry ? ` (${input.clientIndustry})` : ""}
- Project / Service Details: ${input.projectDetails}
${input.scope    ? `- Scope: ${input.scope}` : ""}
${input.budget   ? `- Budget: ${input.budget}` : ""}
${input.timeline ? `- Timeline: ${input.timeline}` : ""}
${input.notes    ? `- Additional Notes: ${input.notes}` : ""}

Generate a complete proposal as valid JSON with exactly this structure:

{
  "title": "Professional proposal title",
  "summary": "One-sentence description for the proposals list view",
  "sections": [
    {
      "key": "cover_letter",
      "title": "Cover Letter",
      "content": "Full cover letter content addressed to the client..."
    },
    {
      "key": "executive_summary",
      "title": "Executive Summary",
      "content": "High-level overview of the proposal, value proposition, and why we are the right choice..."
    },
    {
      "key": "problem_solution",
      "title": "Problem & Proposed Solution",
      "content": "Description of the client's challenge and our specific solution..."
    },
    {
      "key": "scope_of_work",
      "title": "Scope of Work",
      "content": "Detailed breakdown of what is included and excluded..."
    },
    {
      "key": "timeline",
      "title": "Project Timeline",
      "content": "Phase-by-phase timeline with milestones and deliverables..."
    },
    {
      "key": "pricing",
      "title": "Pricing & Investment",
      "content": "Pricing breakdown, payment terms, and investment summary..."
    },
    {
      "key": "terms",
      "title": "Terms & Conditions",
      "content": "Key terms, IP ownership, confidentiality, revision policy, cancellation..."
    },
    {
      "key": "closing",
      "title": "Closing & Call to Action",
      "content": "Closing statement, next steps, and call to action..."
    }
  ]
}

Return ONLY valid JSON, no markdown, no explanation. Make each section substantive and specific to the context provided.`;
}

export function buildSectionRegeneratePrompt(input: {
  sectionKey: string;
  sectionTitle: string;
  proposalTitle: string;
  clientName: string;
  projectDetails: string;
  tonePreference: TonePreference;
  currentContent: string;
}): string {
  const toneInstr = TONE_INSTRUCTIONS[input.tonePreference];
  return `You are an expert business proposal writer. Rewrite the "${input.sectionTitle}" section of a proposal.

TONE: ${toneInstr}
PROPOSAL: ${input.proposalTitle}
CLIENT: ${input.clientName}
PROJECT CONTEXT: ${input.projectDetails}

CURRENT CONTENT TO IMPROVE:
${input.currentContent}

Write an improved, more compelling version of this section. Return ONLY the new section content as plain text — no JSON, no markdown headers, no explanation.`;
}

export async function callAI(prompt: string, settings: AIProvider): Promise<string> {
  const { provider, model, apiKey, baseUrl } = settings;

  if (!apiKey) {
    throw new Error("No API key configured. Go to Settings → AI Provider and add your API key.");
  }
  if (!model) {
    throw new Error("No model selected. Go to Settings → AI Provider and select a model.");
  }

  const baseURL = baseUrl || DEFAULT_BASE_URLS[provider] || "https://api.openai.com/v1";

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI returned an empty response. Please try again.");
  return content;
}
