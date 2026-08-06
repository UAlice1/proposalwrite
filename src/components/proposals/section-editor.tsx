"use client";

import { useState, useTransition } from "react";
import { Pencil, RefreshCw, Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { SectionTypeKey } from "@/types";
import { SECTION_META } from "@/types";

interface SectionEditorProps {
  proposalId: string;
  sectionType: SectionTypeKey;
  content: string;
  onUpdate: (type: SectionTypeKey, newContent: string) => void;
}

export function SectionEditor({
  proposalId,
  sectionType,
  content,
  onUpdate,
}: SectionEditorProps) {
  const meta = SECTION_META[sectionType];
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [regenerating, startRegenerate] = useTransition();
  const [saving, startSave] = useTransition();

  function startEdit() {
    setDraft(content);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(content);
    setEditing(false);
  }

  function saveEdit() {
    startSave(async () => {
      await fetch(`/api/proposals/${proposalId}/sections`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: sectionType, content: draft }),
      });
      onUpdate(sectionType, draft);
      setEditing(false);
    });
  }

  function regenerate() {
    startRegenerate(async () => {
      const res = await fetch(`/api/proposals/${proposalId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: sectionType }),
      });
      if (res.ok) {
        const { content: newContent } = await res.json();
        onUpdate(sectionType, newContent);
        setDraft(newContent);
      }
    });
  }

  // Render markdown-like content simply
  function renderContent(text: string) {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("## "))
        return (
          <h2 key={i} className="text-base font-semibold text-zinc-900 mt-3 mb-1">
            {line.replace("## ", "")}
          </h2>
        );
      if (line.startsWith("# "))
        return (
          <h1 key={i} className="text-lg font-bold text-zinc-900 mt-2 mb-2">
            {line.replace("# ", "")}
          </h1>
        );
      if (line.startsWith("- ") || line.startsWith("• "))
        return (
          <li key={i} className="ml-4 text-sm text-zinc-700 leading-relaxed list-disc">
            {line.replace(/^[-•]\s/, "")}
          </li>
        );
      if (line.startsWith("**") && line.endsWith("**"))
        return (
          <p key={i} className="text-sm font-semibold text-zinc-800">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      if (line.trim() === "") return <div key={i} className="h-2" />;
      return (
        <p key={i} className="text-sm text-zinc-700 leading-relaxed">
          {line}
        </p>
      );
    });
  }

  return (
    <div
      className={cn(
        "group rounded-xl border bg-white transition-all duration-150",
        editing ? "border-violet-300 shadow-sm" : "border-zinc-200 hover:border-zinc-300"
      )}
    >
      {/* Section header */}
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">{meta.title}</h3>
          <p className="text-xs text-zinc-400 mt-0.5">{meta.description}</p>
        </div>
        {!editing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={regenerate}
              disabled={regenerating}
              title="Regenerate this section"
            >
              {regenerating ? (
                <Spinner className="h-3.5 w-3.5" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={startEdit}
              title="Edit this section"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        {editing ? (
          <div className="space-y-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={10}
              className="font-mono text-xs leading-relaxed"
              autoFocus
            />
            <div className="flex items-center gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={saveEdit}
                loading={saving}
              >
                <Check className="h-3.5 w-3.5" />
                Save
              </Button>
            </div>
          </div>
        ) : regenerating ? (
          <div className="flex items-center gap-2 py-6 text-sm text-zinc-400">
            <Spinner className="h-4 w-4 text-violet-500" />
            Regenerating section…
          </div>
        ) : (
          <div className="prose-sm space-y-0.5">{renderContent(content)}</div>
        )}
      </div>
    </div>
  );
}
