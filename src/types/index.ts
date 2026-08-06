import type { Proposal, ProposalSection, SectionType } from "@prisma/client";

export type { Proposal, ProposalSection, SectionType };

export type ProposalWithSections = Proposal & {
  sections: ProposalSection[];
};

export type SectionTypeKey =
  | "EXECUTIVE_SUMMARY"
  | "PROBLEM_STATEMENT"
  | "METHODOLOGY"
  | "TIMELINE"
  | "DELIVERABLES"
  | "PRICING"
  | "CONCLUSION";

export const SECTION_META: Record<
  SectionTypeKey,
  { title: string; description: string; order: number }
> = {
  EXECUTIVE_SUMMARY: {
    title: "Executive Summary",
    description: "High-level overview of the proposal and value proposition",
    order: 0,
  },
  PROBLEM_STATEMENT: {
    title: "Problem Statement",
    description: "The challenge or opportunity this proposal addresses",
    order: 1,
  },
  METHODOLOGY: {
    title: "Methodology",
    description: "Approach, processes, and SOPs that will be used",
    order: 2,
  },
  TIMELINE: {
    title: "Implementation Timeline",
    description: "Project phases, milestones, and delivery schedule",
    order: 3,
  },
  DELIVERABLES: {
    title: "Deliverables",
    description: "Concrete outputs and outcomes to be delivered",
    order: 4,
  },
  PRICING: {
    title: "Pricing & Terms",
    description: "Investment breakdown, payment terms, and conditions",
    order: 5,
  },
  CONCLUSION: {
    title: "Conclusion",
    description: "Summary, call to action, and next steps",
    order: 6,
  },
};

export const SECTION_ORDER: SectionTypeKey[] = [
  "EXECUTIVE_SUMMARY",
  "PROBLEM_STATEMENT",
  "METHODOLOGY",
  "TIMELINE",
  "DELIVERABLES",
  "PRICING",
  "CONCLUSION",
];

export interface ProposalFormData {
  title: string;
  clientName: string;
  clientIndustry: string;
  projectScope: string;
  budgetRange: string;
  linkedSopId?: string;
}
