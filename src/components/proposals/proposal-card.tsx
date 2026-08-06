import Link from "next/link";
import { FileText, Clock, ArrowRight } from "lucide-react";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { formatDate, truncate } from "@/lib/utils";
import type { ProposalWithSections } from "@/types";

interface ProposalCardProps {
  proposal: ProposalWithSections;
}

const statusLabel: Record<string, string> = {
  DRAFT: "Draft",
  REVIEW: "In Review",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

export function ProposalCard({ proposal }: ProposalCardProps) {
  const summary = proposal.sections.find(
    (s) => s.type === "EXECUTIVE_SUMMARY"
  );

  return (
    <Link
      href={`/proposals/${proposal.id}`}
      className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm hover:border-violet-200 hover:shadow-md transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50">
          <FileText className="h-4 w-4 text-violet-600" />
        </div>
        <Badge variant={statusBadgeVariant(proposal.status)}>
          {statusLabel[proposal.status] ?? proposal.status}
        </Badge>
      </div>

      <h3 className="font-semibold text-zinc-900 text-sm leading-snug mb-1 group-hover:text-violet-700 transition-colors">
        {proposal.title}
      </h3>
      <p className="text-xs text-zinc-500 mb-1">for {proposal.clientName}</p>

      {summary && (
        <p className="text-xs text-zinc-400 leading-relaxed mt-2 line-clamp-2">
          {truncate(summary.content.replace(/[#*_]/g, ""), 120)}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs text-zinc-400">
          <Clock className="h-3 w-3" />
          {formatDate(proposal.updatedAt)}
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity">
          Open
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}
