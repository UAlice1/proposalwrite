import Link from "next/link";
import { Calendar, Clock, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Proposal } from "@prisma/client";

interface ProposalCardProps {
  proposal: Proposal;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  return (
    <Link href={`/proposals/${proposal.id}`}>
      <Card className="group transition-all hover:shadow-md hover:border-violet-200">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 group-hover:bg-violet-100">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-zinc-900 truncate group-hover:text-violet-700 transition-colors">
                    {proposal.title}
                  </h3>
                  <p className="text-sm text-zinc-600 mt-0.5">
                    Client: {proposal.clientName}
                  </p>
                </div>
              </div>
            </div>
            <Badge variant={statusBadgeVariant(proposal.status)}>
              {proposal.status.toLowerCase()}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(proposal.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>Updated {formatDate(proposal.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
