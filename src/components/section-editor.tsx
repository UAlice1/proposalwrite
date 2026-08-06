"use client";

import { useState, useTransition } from "react";
import { RefreshCw, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SECTION_META } from "@/types";
import type { SectionTypeKey } from "@/types";
import { regenerateSection, updateSection } from "@/app/proposals/[id]/actions";
import { cn } from "@/lib/utils";

interface SectionEditorProps {
  proposalId: string;
  sectionType: SectionTypeKey;
  initialContent: string;
  proposalContext: string;
}

export function SectionEditor({
  proposalId,
  sectionType,
  initialContent,
  proposalContext,
}: SectionEditorProps) {
  const meta = SECTION_META[sectionType];
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isRegenerating, setIsRegenerating] = useState(false);

  function handleSave() {
    startTransition(async () => {
      await updateSection(proposalId, sectionType, content);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  async function handleRegenerate() {
    setIsRegenerating(true);
    try {
      const newContent = await regenerateSection(proposalId, sectionType, proposalContext);
      setContent(newContent);
    } finally {
      setIsRegenerating(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-zinc-50 transition-colors"
      >
        <div>
          <h3 className="font-semibold text-zinc-900 text-sm">{meta.title}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{meta.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {content && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Has content" />
          )}
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-zinc-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-400" />
          )}
        </div>
      </button>

      {/* Collapsible content */}
      {isOpen && (
        <div className="border-t border-zinc-100 px-5 py-4 space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder={`Write the ${meta.title.toLowerCase()} here, or use AI to generate it…`}
            className="font-normal text-zinc-800 leading-relaxed"
          />
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              loading={isRegenerating}
              disabled={isPending}
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isRegenerating && "animate-spin")} />
              Regenerate with AI
            </Button>
            <Button
              variant={saved ? "secondary" : "primary"}
              size="sm"
              onClick={handleSave}
              loading={isPending}
              disabled={isRegenerating}
            >
              {saved ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  Saved
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
