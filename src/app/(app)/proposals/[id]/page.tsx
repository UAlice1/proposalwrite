import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProposalEditor } from "@/components/proposals/proposal-editor";
import type { Metadata } from "next";
import type { ProposalWithSections } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const proposal = await db.proposal.findUnique({
    where: { id },
    select: { title: true },
  });
  return {
    title: proposal ? `${proposal.title} — Pryro Proposals` : "Proposal — Pryro",
  };
}

export default async function ProposalPage({ params }: Props) {
  const session = await auth();
  const userId = session!.user!.id as string;
  const { id } = await params;

  const proposal = await db.proposal.findFirst({
    where: { id, userId },
    include: { sections: { orderBy: { order: "asc" } } },
  }) as ProposalWithSections | null;

  if (!proposal) notFound();

  return <ProposalEditor proposal={proposal} />;
}
