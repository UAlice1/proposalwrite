import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, FileText, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProposalCard } from "@/components/proposals/proposal-card";
import { EmptyState } from "@/components/proposals/empty-state";
import type { Metadata } from "next";
import type { ProposalWithSections } from "@/types";

export const metadata: Metadata = { title: "Dashboard — Pryro Proposals" };

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id as string;

  const proposals = await db.proposal.findMany({
    where: { userId },
    include: { sections: { orderBy: { order: "asc" } } },
    orderBy: { updatedAt: "desc" },
    take: 6,
  }) as ProposalWithSections[];

  const totalCount = await db.proposal.count({ where: { userId } });
  const sentCount = await db.proposal.count({ where: { userId, status: "SENT" } });
  const acceptedCount = await db.proposal.count({ where: { userId, status: "ACCEPTED" } });

  const plan = (session!.user as { plan?: string }).plan ?? "FREE";
  const firstName = session!.user!.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Good to have you, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Here&apos;s a snapshot of your proposals.
          </p>
        </div>
        <Link href="/proposals/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Proposal
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Proposals",
            value: totalCount,
            icon: FileText,
            color: "bg-violet-50 text-violet-600",
          },
          {
            label: "Sent",
            value: sentCount,
            icon: TrendingUp,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Accepted",
            value: acceptedCount,
            icon: CheckCircle,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Plan",
            value: plan === "PRO" ? "Pro ✦" : "Free",
            icon: Clock,
            color: plan === "PRO" ? "bg-amber-50 text-amber-600" : "bg-zinc-100 text-zinc-500",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${color} mb-3`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-zinc-900">{value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Freemium banner */}
      {plan === "FREE" && totalCount >= 2 && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {totalCount >= 3
                ? "You've reached the free plan limit (3 proposals)"
                : `${3 - totalCount} proposal slot${3 - totalCount === 1 ? "" : "s"} remaining on free plan`}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Upgrade to Pro for unlimited proposals, priority AI, and advanced exports.
            </p>
          </div>
          <Button size="sm" className="shrink-0 bg-amber-600 hover:bg-amber-700">
            Upgrade
          </Button>
        </div>
      )}

      {/* Recent proposals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-900">Recent Proposals</h2>
          {totalCount > 6 && (
            <Link
              href="/proposals"
              className="text-xs text-violet-600 hover:underline font-medium"
            >
              View all ({totalCount})
            </Link>
          )}
        </div>

        {proposals.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {proposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
