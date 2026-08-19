"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText, Plus, Sparkles, Clock, CheckCircle,
  ArrowRight, PenLine, GitMerge, Activity,
} from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, PROPOSAL_TYPE_LABELS, timeAgo } from "@/lib/utils";

interface RecentProposal {
  id: string;
  title: string;
  status: string;
  isAIGenerated: boolean;
  updatedAt: string;
  version: number;
  clientName: string | null;
  proposalType: string;
  author: { id: string; name: string | null; image: string | null };
}

interface ActivityItem {
  id: string;
  action: string;
  description: string | null;
  createdAt: string;
  proposal?: { id: string; title: string } | null;
  user: { id: string; name: string | null; image: string | null };
}

interface DashboardStats {
  total: number;
  aiGenerated: number;
  drafts: number;
  inReview: number;
  approved: number;
  published: number;
  pendingApprovalCount: number;
  aiUsage: number;
  recent: RecentProposal[];
  pendingApprovalSOPs: unknown[];
  recentActivity: ActivityItem[];
  role: string;
  canViewAll: boolean;
  canApprove: boolean;
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch("/api/dashboard/stats");
  if (!res.ok) throw new Error("Failed to load dashboard");
  return res.json();
}

export function DashboardClient({ userName }: { userName: string }) {
  const { data: stats, isLoading } = useQuery({
    queryKey:  ["dashboard-stats"],
    queryFn:   fetchDashboardStats,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const role       = stats?.role ?? "EMPLOYEE";
  const canCreate  = ["SUPER_ADMIN", "ORG_ADMIN", "MANAGER"].includes(role);

  const statCards = [
    {
      title: "Total Proposals",
      value: stats?.total ?? 0,
      sub:   stats?.canViewAll ? "org-wide" : "your proposals",
      icon:  FileText,
      color: "text-blue-500",
      badge: { label: "All", color: "bg-blue-500 text-white" },
      href:  "/proposals",
    },
    {
      title: "Drafts",
      value: stats?.drafts ?? 0,
      sub:   "in progress",
      icon:  Clock,
      color: "text-yellow-500",
      badge: { label: "Draft", color: "bg-yellow-400 text-yellow-900" },
      href:  "/proposals?status=DRAFT",
    },
    {
      title: "Sent",
      value: stats?.inReview ?? 0,
      sub:   "awaiting response",
      icon:  GitMerge,
      color: "text-violet-500",
      badge: { label: "Sent", color: "bg-violet-500 text-white" },
      href:  "/proposals?status=SENT",
    },
    {
      title: "Accepted",
      value: stats?.published ?? 0,
      sub:   "won proposals",
      icon:  CheckCircle,
      color: "text-green-500",
      badge: { label: "Won", color: "bg-green-500 text-white" },
      href:  "/proposals?status=ACCEPTED",
    },
  ];

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Good {getGreeting()}, {userName.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Here&apos;s your proposal overview
            {stats?.canViewAll ? " across your organization." : "."}
          </p>
        </div>
        {canCreate && (
          <Button asChild>
            <Link href="/proposals/new">
              <Plus className="w-4 h-4 mr-2" /> New Proposal
            </Link>
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        {statCards.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Link href={card.href}>
              <Card className="transition-all cursor-pointer">
                <CardContent className="px-3 py-1.5">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[11px] text-muted-foreground">{card.title}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${card.badge.color}`}>
                      {card.badge.label}
                    </span>
                  </div>
                  {isLoading ? <Skeleton className="h-5 w-8" /> : (
                    <>
                      <p className="text-base font-bold leading-none">{card.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{card.sub}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick actions */}
      {canCreate && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <QuickAction icon={<Sparkles className="w-4 h-4 text-purple-500" />} title="Generate with AI" desc="Describe a project, get a full proposal" href="/proposals/new" />
          <QuickAction icon={<PenLine className="w-4 h-4 text-blue-500" />}    title="New Proposal"      desc="Start from scratch"                  href="/proposals/new" />
          <QuickAction icon={<FileText className="w-4 h-4 text-green-500" />}  title="All Proposals"     desc="Browse your proposal library"         href="/proposals" />
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="lg:col-span-2">
          <RecentProposalsCard proposals={stats?.recent ?? []} loading={isLoading} canCreate={canCreate} />
        </div>
        <div className="space-y-4">
          <ActivityCard activity={stats?.recentActivity ?? []} loading={isLoading} canViewAll={stats?.canViewAll ?? false} />
          <AIStatsCard aiUsage={stats?.aiUsage ?? 0} aiGenerated={stats?.aiGenerated ?? 0} total={stats?.total ?? 0} loading={isLoading} />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, title, desc, href }: { icon: React.ReactNode; title: string; desc: string; href: string }) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:shadow-sm transition-all cursor-pointer group">
        <div className="min-w-0">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground truncate">{desc}</p>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}

function RecentProposalsCard({ proposals, loading, canCreate }: { proposals: RecentProposal[]; loading: boolean; canCreate: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recently Created</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/proposals" className="text-xs text-muted-foreground hover:text-foreground">
            View all <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="px-4 pb-4 space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}</div>
        ) : proposals.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 px-4">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No proposals yet</p>
            <p className="text-xs text-muted-foreground text-center">
              {canCreate ? "Create your first proposal or generate one with AI." : "No proposals have been created yet."}
            </p>
            {canCreate && (
              <Button size="sm" asChild><Link href="/proposals/new"><Plus className="w-4 h-4 mr-1.5" />New Proposal</Link></Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border max-h-[280px] overflow-y-auto">
            {proposals.map((p) => (
              <Link key={p.id} href={`/proposals/${p.id}`} className="flex items-center gap-3 px-4 py-3 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.clientName ? `For ${p.clientName}` : "No client"}
                    {" · "}{PROPOSAL_TYPE_LABELS[p.proposalType] ?? p.proposalType}
                    {" · "}{timeAgo(p.updatedAt)}
                  </p>
                </div>
                <Badge className={`text-xs shrink-0 ${STATUS_COLORS[p.status]}`}>
                  {STATUS_LABELS[p.status]}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityCard({ activity, loading, canViewAll }: { activity: ActivityItem[]; loading: boolean; canViewAll: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{canViewAll ? "Org Activity" : "My Activity"}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="px-4 pb-4 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : activity.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6 px-4">No activity yet</p>
        ) : (
          <div className="divide-y divide-border max-h-[240px] overflow-y-auto">
            {activity.map((act) => (
              <div key={act.id} className="flex items-start gap-3 px-4 py-3">
                <Avatar className="w-6 h-6 mt-0.5 shrink-0">
                  <AvatarImage src={act.user.image ?? ""} />
                  <AvatarFallback className="text-[10px]">{act.user.name?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  {act.proposal ? (
                    <Link href={`/proposals/${act.proposal.id}`} className="text-xs leading-snug transition-colors line-clamp-2">
                      {act.description ?? act.action}
                    </Link>
                  ) : (
                    <p className="text-xs leading-snug line-clamp-2">{act.description ?? act.action}</p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(act.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AIStatsCard({ aiUsage, aiGenerated, total, loading }: { aiUsage: number; aiGenerated: number; total: number; loading: boolean }) {
  const adoptionPct = total > 0 ? Math.round((aiGenerated / total) * 100) : 0;
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">AI Usage</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
        ) : (
          <div className="space-y-3">
            {[
              { label: "Generations", value: aiUsage,       color: "text-purple-600" },
              { label: "AI Proposals",value: aiGenerated,   color: "text-blue-600" },
              { label: "Adoption",    value: `${adoptionPct}%`, color: "text-green-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-sm font-semibold ${color}`}>{value}</p>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full mt-1 text-xs" asChild>
              <Link href="/settings">Configure AI <ArrowRight className="w-3 h-3 ml-1.5" /></Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
