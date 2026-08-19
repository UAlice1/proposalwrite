"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft, Star, FileDown, ChevronDown, Loader2,
  MoreHorizontal, Trash2, FileText, Activity, Sparkles,
  Calendar, RefreshCw, Plus,
} from "lucide-react";
import { STATUS_LABELS, STATUS_COLORS, PROPOSAL_TYPE_LABELS, TONE_LABELS, formatDateTime } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ProposalToast } from "@/lib/toast";

interface Section {
  id: string;
  key: string;
  title: string;
  content: string;
  order: number;
}

interface ActivityItem {
  id: string;
  action: string;
  description: string | null;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
}

interface ProposalData {
  id: string;
  title: string;
  clientName: string | null;
  clientIndustry: string | null;
  proposalType: string;
  status: string;
  tonePreference: string;
  description: string | null;
  budget: string | null;
  timeline: string | null;
  notes: string | null;
  isAIGenerated: boolean;
  isFavorite: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
  author: { name: string | null; image: string | null };
  sections: Section[];
  activities: ActivityItem[];
}

const TABS = [
  { id: "sections", label: "Sections",  icon: FileText },
  { id: "activity", label: "Activity",  icon: Activity },
];

export function ProposalDetail({ id }: { id: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [proposal,   setProposal]   = useState<ProposalData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [activeTab,  setActiveTab]  = useState("sections");
  const [exporting,  setExporting]  = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [sectionDrafts,  setSectionDrafts]  = useState<Record<string, string>>({});
  const [regenerating,   setRegenerating]   = useState<string | null>(null);
  const [saving,    setSaving]   = useState(false);

  const fetchProposal = useCallback(async () => {
    const res = await fetch(`/api/proposals/${id}`);
    if (!res.ok) { router.push("/proposals"); return; }
    setProposal(await res.json());
    setLoading(false);
  }, [id, router]);

  useEffect(() => { fetchProposal(); }, [fetchProposal]);

  const handleExport = async (format: "pdf" | "docx" | "html") => {
    if (exporting) return;
    setExporting(format);
    try {
      const res = await fetch(`/api/proposals/${id}/export?format=${format}`);
      if (!res.ok) throw new Error("Export failed");

      if (format === "pdf") {
        // Open in new tab for browser print-to-PDF
        const html = await res.text();
        const blob = new Blob([html], { type: "text/html" });
        const url  = URL.createObjectURL(blob);
        const win  = window.open(url, "_blank");
        setTimeout(() => { win?.print(); URL.revokeObjectURL(url); }, 800);
      } else {
        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href = url;
        a.download = `${proposal?.title ?? "proposal"}.${format}`;
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
      }
      ProposalToast.exported(format);
    } catch { toast.error("Export failed"); }
    finally { setExporting(null); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this proposal permanently?")) return;
    await fetch(`/api/proposals/${id}`, { method: "DELETE" });
    toast.success("Deleted"); router.push("/proposals");
  };

  const handleToggleFavorite = async () => {
    if (!proposal) return;
    await fetch(`/api/proposals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !proposal.isFavorite }),
    });
    fetchProposal();
  };

  const handleSaveSection = async (sectionId: string) => {
    if (!proposal) return;
    setSaving(true);
    const content = sectionDrafts[sectionId];
    const updatedSections = proposal.sections.map((s) =>
      s.id === sectionId ? { ...s, content } : s
    );
    await fetch(`/api/proposals/${id}/sections`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections: updatedSections }),
    });
    setEditingSection(null);
    setSaving(false);
    fetchProposal();
    toast.success("Section saved");
  };

  const handleRegenerateSection = async (section: Section) => {
    if (!proposal) return;
    setRegenerating(section.id);
    try {
      const res = await fetch("/api/ai/regenerate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId:     id,
          sectionKey:     section.key,
          sectionTitle:   section.title,
          currentContent: section.content,
          tonePreference: proposal.tonePreference,
        }),
      });
      const data = await res.json() as { content?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Regeneration failed");

      const updatedSections = proposal.sections.map((s) =>
        s.id === section.id ? { ...s, content: data.content! } : s
      );
      await fetch(`/api/proposals/${id}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: updatedSections }),
      });
      ProposalToast.sectionRegenerated(section.title);
      fetchProposal();
    } catch (err: unknown) {
      ProposalToast.error("Regenerate section", err instanceof Error ? err.message : undefined);
    } finally { setRegenerating(null); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  );
  if (!proposal) return null;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Top bar */}
      <div className="flex items-center justify-between px-3 py-3 md:px-6 border-b border-border shrink-0">
        <button onClick={() => router.push("/proposals")}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Proposals
        </button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleToggleFavorite} className="h-8 w-8">
            <Star className={cn("w-4 h-4", proposal.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground")} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-1.5">
                {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                Export <ChevronDown className="w-3 h-3 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("pdf")}>PDF</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("docx")}>Word (DOCX)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("html")}>HTML</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Delete Proposal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Title block */}
      <div className="px-3 pt-4 pb-2 md:px-6 shrink-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          {proposal.isAIGenerated && <Badge variant="secondary" className="text-xs">AI Generated</Badge>}
          <Badge variant="outline" className="text-xs">
            {PROPOSAL_TYPE_LABELS[proposal.proposalType] ?? proposal.proposalType}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {TONE_LABELS[proposal.tonePreference] ?? proposal.tonePreference}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold text-foreground leading-tight">{proposal.title}</h1>
        {proposal.clientName && (
          <p className="text-sm text-muted-foreground mt-1">For {proposal.clientName}{proposal.clientIndustry ? ` · ${proposal.clientIndustry}` : ""}</p>
        )}
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(proposal.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
          {proposal.budget && (
            <span className="text-xs text-muted-foreground">Budget: {proposal.budget}</span>
          )}
          {proposal.timeline && (
            <span className="text-xs text-muted-foreground">Timeline: {proposal.timeline}</span>
          )}
          <Badge className={cn("text-xs ml-auto", STATUS_COLORS[proposal.status])}>
            {STATUS_LABELS[proposal.status]}
          </Badge>
        </div>
      </div>

      {/* Tab bar */}
      <div className="px-3 md:px-6 border-b border-border shrink-0">
        <div className="flex gap-0">
          {TABS.map(({ id: tid, label, icon: Icon }) => (
            <button key={tid} onClick={() => setActiveTab(tid)}
              className={cn("flex items-center gap-1.5 px-4 py-2.5 text-sm border-b-2 transition-colors",
                activeTab === tid
                  ? "border-primary text-foreground font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6 min-w-0">

        {/* Sections tab */}
        {activeTab === "sections" && (
          <div className="space-y-4 max-w-4xl">
            {proposal.sections.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <FileText className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No sections yet</p>
                <p className="text-xs text-muted-foreground text-center">
                  Go back and generate this proposal with AI, or the sections will appear here.
                </p>
              </div>
            ) : (
              proposal.sections.map((section) => (
                <div key={section.id} className="bg-card rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-muted/30">
                    <h3 className="text-sm font-semibold">{section.title}</h3>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost" size="sm" className="h-7 text-xs gap-1.5"
                        disabled={regenerating === section.id}
                        onClick={() => handleRegenerateSection(section)}
                      >
                        {regenerating === section.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <RefreshCw className="w-3 h-3" />}
                        Regenerate
                      </Button>
                      {editingSection === section.id ? (
                        <>
                          <Button size="sm" className="h-7 text-xs" disabled={saving}
                            onClick={() => handleSaveSection(section.id)}>
                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs"
                            onClick={() => setEditingSection(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-7 text-xs"
                          onClick={() => { setEditingSection(section.id); setSectionDrafts((prev) => ({ ...prev, [section.id]: section.content })); }}>
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="px-5 py-4">
                    {editingSection === section.id ? (
                      <Textarea
                        value={sectionDrafts[section.id] ?? section.content}
                        onChange={(e) => setSectionDrafts((prev) => ({ ...prev, [section.id]: e.target.value }))}
                        rows={10}
                        className="resize-none text-sm leading-relaxed"
                        autoFocus
                      />
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{section.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Activity tab */}
        {activeTab === "activity" && (
          <div className="max-w-2xl space-y-3">
            {proposal.activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No activity yet</p>
            ) : (
              proposal.activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 p-3 bg-card border border-border rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm">{act.description ?? act.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(act.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
