import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Header } from "@/components/header";
import { SECTION_ORDER, SECTION_META } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ExportActions } from "./export-actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ExportPage({
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

  const sectionMap = new Map(proposal.sections.map((s) => [s.type, s.content]));

  return (
    <div className="flex min-h-screen flex-col">
      <Header user={{ name: user.name, email: user.email, plan: user.plan }} />

      <main className="flex-1 bg-zinc-50">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Link
              href={`/proposals/${id}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900">Export Proposal</h1>
              <p className="text-sm text-zinc-600">Preview and download your proposal</p>
            </div>
          </div>

          <ExportActions proposalId={id} proposalTitle={proposal.title} />

          {/* Proposal Preview */}
          <Card className="mt-6" id="proposal-preview">
            <CardHeader>
              <div className="text-center pb-4 border-b border-zinc-100">
                <h1 className="text-3xl font-bold text-zinc-900">{proposal.title}</h1>
                <p className="text-zinc-600 mt-2">
                  Prepared for: {proposal.clientName}
                  {proposal.clientIndustry && ` · ${proposal.clientIndustry}`}
                </p>
                {proposal.budgetRange && (
                  <p className="text-sm text-zinc-500 mt-1">
                    Budget: {proposal.budgetRange}
                  </p>
                )}
                <p className="text-xs text-zinc-400 mt-3">
                  {formatDate(proposal.createdAt)}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              {SECTION_ORDER.map((sectionType) => {
                const content = sectionMap.get(sectionType);
                if (!content?.trim()) return null;
                const meta = SECTION_META[sectionType];
                return (
                  <div key={sectionType}>
                    <h2 className="text-xl font-bold text-zinc-900 mb-3 pb-2 border-b border-zinc-100">
                      {meta.title}
                    </h2>
                    <div className="text-zinc-700 text-sm leading-relaxed whitespace-pre-line">
                      {content}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
