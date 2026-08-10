import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Permission } from "@/lib/permissions";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const role   = (session.user as { role?: string }).role ?? "EMPLOYEE";
  const orgId  = (session.user as { organizationId?: string }).organizationId;

  const canViewAll = Permission.canViewAllOrgProposals(role);

  const scope = canViewAll
    ? { organizationId: orgId ?? undefined, isArchived: false, deletedAt: null }
    : { authorId: userId, isArchived: false, deletedAt: null };

  const [total, aiGenerated, drafts, sent, accepted, recent, recentActivity, aiUsage] = await Promise.all([
    db.proposal.count({ where: scope }),
    db.proposal.count({ where: { ...scope, isAIGenerated: true } }),
    db.proposal.count({ where: { ...scope, status: "DRAFT" } }),
    db.proposal.count({ where: { ...scope, status: "SENT" } }),
    db.proposal.count({ where: { ...scope, status: "ACCEPTED" } }),

    db.proposal.findMany({
      where:   scope,
      orderBy: { updatedAt: "desc" },
      take:    6,
      select:  {
        id: true, title: true, status: true, isAIGenerated: true,
        updatedAt: true, createdAt: true, version: true,
        clientName: true, proposalType: true,
        author: { select: { id: true, name: true, image: true } },
      },
    }),

    db.activity.findMany({
      where:   canViewAll && orgId ? { proposal: { organizationId: orgId } } : { userId },
      orderBy: { createdAt: "desc" },
      take:    10,
      include: {
        proposal: { select: { id: true, title: true } },
        user:     { select: { id: true, name: true, image: true } },
      },
    }),

    db.aIGeneration.count({ where: { userId } }),
  ]);

  return NextResponse.json({
    total,
    aiGenerated,
    drafts,
    inReview: sent,
    approved: accepted,
    published: accepted,
    pendingApprovalCount: 0,
    aiUsage,
    recent,
    pendingApprovalSOPs: [],
    recentActivity,
    role,
    canViewAll,
    canApprove: false,
  });
}
