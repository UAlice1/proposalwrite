"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/navigation";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus, Search, Star, MoreHorizontal,
  Copy, Archive, Trash2, Eye, X,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, PROPOSAL_TYPE_LABELS, timeAgo } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { ProposalToast } from "@/lib/toast";
import type { ColumnDef } from "@/components/kibo-ui/table";
import {
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from "@/components/kibo-ui/table";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam  = searchParams.get("filter") ?? "";

  const [proposals,   setProposals]   = useState<Proposal[]>([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filters,     setFilters]     = useState(EMPTY_FILTERS);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

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

  const columns: ColumnDef<Proposal>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Proposal" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage src={row.original.author.image ?? ""} />
            <AvatarFallback className="text-xs">
              {row.original.author.name?.slice(0, 2)?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{row.original.title}</span>
              {row.original.isFavorite && (
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 shrink-0" />
              )}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {row.original.clientName || "No client"} · {row.original._count.sections} sections
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "proposalType",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">
          {PROPOSAL_TYPE_LABELS[row.original.proposalType] ?? row.original.proposalType}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <Badge className={`text-xs ${STATUS_COLORS[row.original.status]}`}>
          {STATUS_LABELS[row.original.status]}
        </Badge>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <TableColumnHeader column={column} title="Updated" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {timeAgo(row.original.updatedAt)}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/proposals/${row.original.id}`)}>
              <Eye className="w-4 h-4 mr-2" />View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleToggleFavorite(row.original.id, row.original.isFavorite)}>
              <Star className="w-4 h-4 mr-2" />{row.original.isFavorite ? "Unfavorite" : "Favorite"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDuplicate(row.original.id)}>
              <Copy className="w-4 h-4 mr-2" />Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleArchive(row.original.id, row.original.isArchived)}>
              <Archive className="w-4 h-4 mr-2" />{row.original.isArchived ? "Restore" : "Archive"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(row.original.id)} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-muted-foreground text-sm">{total} proposal{total !== 1 ? "s" : ""}</p>
        </div>
        <Button asChild size="sm">
          <a href="/proposals/new"><Plus className="w-4 h-4 mr-1.5" />New Proposal</a>
        </Button>
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search proposals..."
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

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      ) : proposals.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 border rounded-lg">
          <p className="font-medium">No proposals found</p>
          <p className="text-sm text-muted-foreground">
            {activeFilterCount > 0 ? "Try adjusting or clearing your filters." : "Create your first proposal to get started."}
          </p>
          {activeFilterCount > 0
            ? <Button size="sm" variant="outline" onClick={clearAll}><X className="w-4 h-4 mr-1.5" />Clear filters</Button>
            : <Button asChild size="sm"><a href="/proposals/new"><Plus className="w-4 h-4 mr-1.5" />New Proposal</a></Button>}
        </div>
      ) : (
        <TableProvider columns={columns} data={proposals}>
          <TableHeader>
            {({ headerGroup }) => (
              <TableHeaderGroup headerGroup={headerGroup} key={headerGroup.id}>
                {({ header }) => <TableHead header={header} key={header.id} />}
              </TableHeaderGroup>
            )}
          </TableHeader>
          <TableBody>
            {({ row }) => (
              <div 
                onClick={() => router.push(`/proposals/${row.original.id}`)}
                className="cursor-pointer"
              >
                <TableRow 
                  key={row.id} 
                  row={row}
                >
                  {({ cell }) => <TableCell cell={cell} key={cell.id} />}
                </TableRow>
              </div>
            )}
          </TableBody>
        </TableProvider>
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
