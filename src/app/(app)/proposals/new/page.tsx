import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { NewProposalForm } from "@/components/proposals/new-proposal-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "New Proposal — Pryro" };

export default async function NewProposalPage() {
  const session = await auth();
  const userId = session!.user!.id as string;
  const plan = (session!.user as { plan?: string }).plan ?? "FREE";

  // Freemium gate
  if (plan === "FREE") {
    const count = await db.proposal.count({ where: { userId } });
    if (count >= 3) {
      redirect("/proposals?limit=true");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      {/* Back */}
      <Link
        href="/proposals"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 mb-8 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Proposals
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
            <Sparkles className="h-4 w-4 text-violet-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            New Proposal
          </h1>
        </div>
        <p className="text-sm text-zinc-500 ml-10">
          Fill in the details below and our AI will generate a complete, professional proposal for you.
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm">
        <NewProposalForm />
      </div>

      {/* Help text */}
      <div className="mt-6 rounded-xl bg-violet-50 border border-violet-100 p-4">
        <p className="text-xs font-semibold text-violet-700 mb-1">How it works</p>
        <ol className="space-y-1 text-xs text-violet-600 list-decimal list-inside">
          <li>Fill in your project details and client information</li>
          <li>Our AI generates all 7 proposal sections instantly</li>
          <li>Edit any section inline or regenerate with one click</li>
          <li>Export as PDF or Word and send to your client</li>
        </ol>
      </div>
    </div>
  );
}
