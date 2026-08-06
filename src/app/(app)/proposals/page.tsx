import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProposalCard } from "@/components/proposals/proposal-card";
import { EmptyState } from "@/components/proposals/empty-state";
import type { ProposalWithSections } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Proposals — Pryro" };

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await auth();
  const userId = session!.user!.id as string;
  const { q, status } = await searchParams;

  const proposals = await db.proposal.findMany({
    where: {
      userId,
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
      ...(status ? { status: status as string } : {}),
    },
    include: { sections: { orderBy: { order: "asc" } } },
    orderBy: { updatedAt: "desc" },
  }) as ProposalWithSections[];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Proposals
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {proposals.length} proposal{proposals.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/proposals/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Proposal
          </Button>
        </Link>
      </div>

      {/* Filters (client-side would be nicer; using form submit for simplicity) */}
      <form className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search proposals…"
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="REVIEW">In Review</option>
          <option value="SENT">Sent</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <Button type="submit" variant="secondary" size="md">
          Filter
        </Button>
      </form>

      {proposals.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {proposals.map((p) => (
            <ProposalCard key={p.id} proposal={p} />
          ))}
        </div>
      )}
    </div>
  );
}
