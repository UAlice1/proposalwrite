import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { ProposalCard } from "@/components/proposal-card";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      proposals: {
        orderBy: { updatedAt: "desc" },
        take: 20,
      },
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={{ name: user.name, email: user.email, plan: user.plan }} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">
                Welcome back, {user.name?.split(" ")[0] ?? "there"}!
              </h1>
              <p className="text-zinc-600 mt-1">
                Manage and create professional proposals
              </p>
            </div>
            <Link href="/proposals/new">
              <Button size="lg">
                <Plus className="h-4 w-4" />
                New Proposal
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid gap-6 sm:grid-cols-3 mb-8">
            <StatCard
              label="Total Proposals"
              value={user.proposals.length}
              color="violet"
            />
            <StatCard
              label="In Progress"
              value={user.proposals.filter((p) => p.status === "DRAFT").length}
              color="amber"
            />
            <StatCard
              label="Sent"
              value={user.proposals.filter((p) => p.status === "SENT").length}
              color="emerald"
            />
          </div>

          {/* Proposals list */}
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 mb-4">
              Recent Proposals
            </h2>
            {user.proposals.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-zinc-200 rounded-xl bg-white">
                <FileText className="h-12 w-12 text-zinc-300 mb-4" />
                <h3 className="text-lg font-semibold text-zinc-900 mb-1">
                  No proposals yet
                </h3>
                <p className="text-sm text-zinc-600 mb-4">
                  Create your first proposal to get started
                </p>
                <Link href="/proposals/new">
                  <Button>
                    <Plus className="h-4 w-4" />
                    Create Proposal
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {user.proposals.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "violet" | "amber" | "emerald";
}) {
  const colorClasses = {
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <p className="text-sm text-zinc-600">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${colorClasses[color]}`}>
        {value}
      </p>
    </div>
  );
}
