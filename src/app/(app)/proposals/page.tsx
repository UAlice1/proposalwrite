import type { Metadata } from "next";
import { ProposalsClient } from "@/components/proposals/proposals-client";
import { PageTransition } from "@/components/page-transition";

export const metadata: Metadata = { title: "My Proposals" };

export default function ProposalsPage() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
      <PageTransition><ProposalsClient /></PageTransition>
    </div>
  );
}
