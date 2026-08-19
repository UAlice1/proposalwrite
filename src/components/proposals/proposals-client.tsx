"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Search, FileText, Star, MoreHorizontal,
  Copy, Archive, Trash2, Eye, X,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, PROPOSAL_TYPE_LABELS, timeAgo, truncate } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { ProposalToast } from "@/lib/toast";

interface Proposal {
  id: string;
  title: string;
  clientName: string | null;
  proposalType: string;
  status: string;
  isAIGenerated: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  updatedAt: string;
  createdAt: string;
  author: { id: string; name: string | null; image?: string | null };
  _count: { sections: number };
}

const EMPTY_FILTERS = { status: "", proposalType: "" };

export function ProposalsClient() {
  const searchParams = useSearchParams();
  const filterParam  = searchParams.get("filter") ?? "";

  const [proposals,   setProposals]   = useState<Proposal[]>([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filters,     setFilters]     = useState(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const debouncedSearch = useDebounce(search, 350);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch)      params.set("search",       debouncedSearch);
    if (filters.status)       params.set("status",       filters.status);
    if (filters.proposalType) params.set("proposalType", filters.proposalType);
    if (filterParam === "archived") params.set("archived", "true");
    params.set("page",  String(currentPage));
    params.set("limit", String(PAGE_SIZE));

    const res  = await fetch(`/api/proposals?${params}`);
    const data = await res.json();
    let items: Proposal[] = data.proposals ?? [];

    if (filterParam === "favorites") items = items.filter((p) => p.isFavorite);

    setProposals(items);
    setTotal(filterParam === "favorites" ? items.length : (data.total ?? 0));
    setLoading(false);
  }, [debouncedSearch, filters, filterParam, currentPage]);

  useEffect(() => { fetchProposals(); }, [fetchProposals]);

  const handleDuplicate = async (id: string) => {
    const r = await fetch(`/api/proposals/${id}/duplicate`, { method: "POST" });
    if (r.ok) { ProposalToast.duplicated("Proposal"); fetchProposals(); }
    else ProposalToast.error("Duplicate");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this proposal permanently?")) return;
    const r = await fetch(`/api/proposals/${id}`, { method: "DELETE" });
    if (r.ok) { ProposalToast.deleted("Proposal"); fetchProposals(); }
    else ProposalToast.error("Delete");
  };

  const handleArchive = async (id: string, isArchived: boolean) => {
    const r = await fetch(`/api/proposals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isArchived: !isArchived, ...((!isArchived) ? { archivedAt: new Date() } : {}) }),
    });
    if (r.ok) { isArchived ? ProposalToast.restored("Proposal") : ProposalToast.archived("Proposal"); fetchProposals(); }
    else ProposalToast.error("Archive");
  };

  const handleToggleFavorite = async (id: string, cur: boolean) => {
    const r = await fetch(`/api/proposals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !cur }),
    });
    if (r.ok) fetchProposals();
  };

  const setFilter = (key: keyof typeof EMPTY_FILTERS, value: string) => {
    setCurrentPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };
  const clearAll = () => { setCurrentPage(1); setFilters(EMPTY_FILTERS); };
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const title = filterParam === "favorites" ? "Favorites"
              : filterParam === "archived"  ? "Archived"
              : "My Proposals";

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">{total} proposal{total !== 1 ? "s" : ""}</p>
        </div>
        <Button asChild size="sm">
          <Link href="/proposals/new"><Plus className="w-4 h-4 mr-1.5" />New Proposal</Link>
        </Button>
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-9 h-9" />
          {search && (
            <button className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}>
              <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        <Select value={filters.status} onValueChange={(v) => setFilter("status", v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-36 h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.proposalType} onValueChange={(v) => setFilter("proposalType", v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Types</SelectItem>
            {Object.entries(PROPOSAL_TYPE_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground" onClick={clearAll}>
            <X className="w-3 h-3 mr-1" />Clear
          </Button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      ) : proposals.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
            <FileText className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-medium">No proposals found</p>
          <p className="text-sm text-muted-foreground">
            {activeFilterCount > 0 ? "Try adjusting or clearing your filters." : "Create your first proposal to get started."}
          </p>
          {activeFilterCount > 0
            ? <Button size="sm" variant="outline" onClick={clearAll}><X className="w-4 h-4 mr-1.5" />Clear filters</Button>
            : <Button asChild size="sm"><Link href="/proposals/new"><Plus className="w-4 h-4 mr-1.5" />New Proposal</Link></Button>}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {proposals.map((proposal, i) => (
              <motion.div key={proposal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ delay: i * 0.03 }}>
                <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <Link href={`/proposals/${proposal.id}`} className="font-medium text-sm hover:text-foreground truncate">
                        {proposal.title}
                      </Link>
                      {proposal.isFavorite && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border bg-muted text-muted-foreground shrink-0">
                        {PROPOSAL_TYPE_LABELS[proposal.proposalType] ?? proposal.proposalType}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {proposal.clientName ? `For ${proposal.clientName}` : "No client"}
                      {` · ${proposal._count.sections} section${proposal._count.sections !== 1 ? "s" : ""}`}
                      {` · Updated ${timeAgo(proposal.updatedAt)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={`text-xs ${STATUS_COLORS[proposal.status]}`}>
                      {STATUS_LABELS[proposal.status]}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/proposals/${proposal.id}`}><Eye className="w-4 h-4 mr-2" />View</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleFavorite(proposal.id, proposal.isFavorite)}>
                          <Star className="w-4 h-4 mr-2" />{proposal.isFavorite ? "Unfavorite" : "Favorite"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(proposal.id)}>
                          <Copy className="w-4 h-4 mr-2" />Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchive(proposal.id, proposal.isArchived)}>
                          <Archive className="w-4 h-4 mr-2" />{proposal.isArchived ? "Restore" : "Archive"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(proposal.id)} className="text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!loading && total > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, total)}–{Math.min(currentPage * PAGE_SIZE, total)} of {total} proposals
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8"
              disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8"
              disabled={currentPage >= Math.ceil(total / PAGE_SIZE)} onClick={() => setCurrentPage((p) => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
