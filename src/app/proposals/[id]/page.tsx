import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/header";
import { SectionEditor } from "@/components/section-editor";
import { Button } from "@/components/ui/button";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { SECTION_ORDER, SECTION_META } from "@/types";
import type { SectionTypeKey } from "@/types";
import { updateProposalStatus } from "./actions";
import Link from "next/link";
import { ArrowLeft, Download, Sparkles } from "lucide-react";
import { GenerateAllButton } from "./generate-all-button";

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) redirect("/login");

  const proposal = await db.proposal.findUnique({
    where: { id },
    include: { sections: { orderBy: { order: "asc" } } },
  });

  if (!proposal || proposal.userId !== user.id) notFound();

  // Build context string for AI
  const proposalContext = [
    `Proposal Title: ${proposal.title}`,
    `Client: ${proposal.clientName}`,
    proposal.clientIndustry ? `Industry: ${proposal.clientIndustry}` : "",
    proposal.projectScope ? `Project Scope: ${proposal.projectScope}` : "",
    proposal.budgetRange ? `Budget Range: ${proposal.budgetRange}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  // Map sections by type for easy lookup
  const sectionMap = new Map(proposal.sections.map((s) => [s.type, s.content]));

  const completedSections = SECTION_ORDER.filter(
    (t) => (sectionMap.get(t) ?? "").trim().length > 0
  ).length;

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={{ name: user.name, email: user.email, plan: user.plan }} />

      <main className="flex-1 bg-zinc-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Top bar */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-3">
              <Link
                href="/dashboard"
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900">
                  {proposal.title}
                </h1>
                <p className="text-sm text-zinc-600 mt-0.5">
                  Client: {proposal.clientName}
                  {proposal.clientIndustry && ` · ${proposal.clientIndustry}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={statusBadgeVariant(proposal.status)}>
                {proposal.status.toLowerCase()}
              </Badge>
            </div>
          </div>

          {/* Progress + actions bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4">
            <div>
              <p className="text-sm text-zinc-600">
                <span className="font-semibold text-violet-700">{completedSections}</span>
                {" / "}
                {SECTION_ORDER.length} sections completed
              </p>
              <div className="mt-2 h-2 w-48 rounded-full bg-zinc-100">
                <div
                  className="h-2 rounded-full bg-violet-500 transition-all"
                  style={{
                    width: `${(completedSections / SECTION_ORDER.length) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <GenerateAllButton proposalId={id} proposalContext={proposalContext} />
              <Link href={`/proposals/${id}/export`}>
                <Button variant="outline" size="sm">
                  <Download className="h-3.5 w-3.5" />
                  Export
                </Button>
              </Link>
              {proposal.status === "DRAFT" && (
                <form
                  action={async () => {
                    "use server";
                    await updateProposalStatus(id, "SENT");
                  }}
                >
                  <Button type="submit" size="sm">
                    Mark as Sent
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Section editors */}
          <div className="space-y-4">
            {SECTION_ORDER.map((sectionType) => (
              <SectionEditor
                key={sectionType}
                proposalId={id}
                sectionType={sectionType as SectionTypeKey}
                initialContent={sectionMap.get(sectionType) ?? ""}
                proposalContext={proposalContext}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
