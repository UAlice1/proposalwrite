import type { Metadata } from "next";
import { NewProposalPage } from "@/components/proposals/new-proposal-page";

export const metadata: Metadata = { title: "New Proposal" };

export default function NewProposalRoute() {
  return <NewProposalPage />;
}
