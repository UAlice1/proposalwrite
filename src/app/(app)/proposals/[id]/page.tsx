import type { Metadata } from "next";
import { ProposalDetail } from "@/components/proposals/proposal-detail";

export const metadata: Metadata = { title: "Proposal" };

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProposalDetail id={id} />;
}
