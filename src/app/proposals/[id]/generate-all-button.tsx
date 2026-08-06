"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SECTION_ORDER } from "@/types";
import type { SectionTypeKey } from "@/types";
import { regenerateSection, updateSection } from "./actions";

interface GenerateAllButtonProps {
  proposalId: string;
  proposalContext: string;
}

export function GenerateAllButton({
  proposalId,
  proposalContext,
}: GenerateAllButtonProps) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleGenerateAll() {
    setLoading(true);
    setProgress(0);

    for (let i = 0; i < SECTION_ORDER.length; i++) {
      const sectionType = SECTION_ORDER[i] as SectionTypeKey;
      try {
        const content = await regenerateSection(
          proposalId,
          sectionType,
          proposalContext
        );
        await updateSection(proposalId, sectionType, content);
        setProgress(i + 1);
      } catch (error) {
        console.error(`Failed to generate ${sectionType}:`, error);
      }
    }

    setLoading(false);
    setProgress(0);
    // Refresh page to show new content
    window.location.reload();
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleGenerateAll}
      loading={loading}
      disabled={loading}
    >
      <Sparkles className="h-3.5 w-3.5" />
      {loading
        ? `Generating… ${progress}/${SECTION_ORDER.length}`
        : "Generate All"}
    </Button>
  );
}
