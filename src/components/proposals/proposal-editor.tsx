"use client";

import { useState } from "react";
import { Download, FileText, MoreHorizontal, Send } from "lucide-react";
import { SectionEditor } from "./section-editor";
import { Button } from "@/components/ui/button";
import { Badge, statusBadgeVariant } from "@/components/ui/badge";
import { SECTION_ORDER, SECTION_META } from "@/types";
import type { ProposalWithSections, SectionTypeKey } from "@/types";

interface ProposalEditorProps {
  proposal: ProposalWithSections;
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  REVIEW: "In Review",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

export function ProposalEditor({ proposal: initial }: ProposalEditorProps) {
  const [sections, setSections] = useState<Record<SectionTypeKey, string>>(
    () =>
      Object.fromEntries(
        SECTION_ORDER.map((type) => [
          type,
          initial.sections.find((s) => s.type === type)?.content ?? "",
        ])
      ) as Record<SectionTypeKey, string>
  );

  const [status, setStatus] = useState(initial.status);
  const [exporting, setExporting] = useState(false);

  function handleSectionUpdate(type: SectionTypeKey, content: string) {
    setSections((prev) => ({ ...prev, [type]: content }));
  }

  async function handleExport(format: "pdf" | "docx") {
    setExporting(true);
    try {
      const res = await fetch(`/api/proposals/${initial.id}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, sections }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${initial.title.replace(/\s+/g, "_")}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  async function markAsSent() {
    const res = await fetch(`/api/proposals/${initial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "SENT" }),
    });
    if (res.ok) setStatus("SENT");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Sticky toolbar */}
      <div className="sticky top-14 z-30 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-12 max-w-4xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-zinc-400 shrink-0" />
            <h1 className="truncate text-sm font-semibold text-zinc-800">
              {initial.title}
            </h1>
            <Badge variant={statusBadgeVariant(status)}>
              {STATUS_LABELS[status] ?? status}
            </Badge>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Export dropdown (simplified) */}
            <div className="relative group">
              <Button variant="outline" size="sm" disabled={exporting}>
                <Download className="h-3.5 w-3.5" />
                Export
                <span className="hidden sm:inline">▾</span>
              </Button>
              <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-zinc-200 bg-white shadow-lg py-1 hidden group-hover:block z-50">
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExport("docx")}
                  className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  Export as Word
                </button>
              </div>
            </div>

            {status === "DRAFT" && (
              <Button size="sm" onClick={markAsSent}>
                <Send className="h-3.5 w-3.5" />
                Mark as Sent
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        {/* Proposal meta */}
        <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-zinc-400 mb-0.5">Client</p>
              <p className="font-medium text-zinc-800">{initial.clientName}</p>
            </div>
            {initial.clientIndustry && (
              <div>
                <p className="text-xs text-zinc-400 mb-0.5">Industry</p>
                <p className="font-medium text-zinc-800">{initial.clientIndustry}</p>
              </div>
            )}
            {initial.budgetRange && (
              <div>
                <p className="text-xs text-zinc-400 mb-0.5">Budget</p>
                <p className="font-medium text-zinc-800">{initial.budgetRange}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4">
          {SECTION_ORDER.filter((type) => sections[type]).map((type) => (
            <SectionEditor
              key={type}
              proposalId={initial.id}
              sectionType={type}
              content={sections[type]}
              onUpdate={handleSectionUpdate}
            />
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-8 rounded-xl border border-dashed border-violet-200 bg-violet-50 p-5 text-center">
          <p className="text-sm text-violet-700 font-medium mb-1">
            Ready to send?
          </p>
          <p className="text-xs text-violet-500 mb-4">
            Export your proposal as PDF or Word, or mark it as sent to track its status.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("pdf")}
              disabled={exporting}
            >
              <Download className="h-3.5 w-3.5" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport("docx")}
              disabled={exporting}
            >
              <Download className="h-3.5 w-3.5" />
              Word
            </Button>
            {status === "DRAFT" && (
              <Button size="sm" onClick={markAsSent}>
                <Send className="h-3.5 w-3.5" />
                Mark as Sent
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
