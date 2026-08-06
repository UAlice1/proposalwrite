"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, FileDown } from "lucide-react";

interface ExportActionsProps {
  proposalId: string;
  proposalTitle: string;
}

export function ExportActions({ proposalId, proposalTitle }: ExportActionsProps) {
  const [printing, setPrinting] = useState(false);

  function handlePrintToPdf() {
    setPrinting(true);
    setTimeout(() => {
      window.print();
      setPrinting(false);
    }, 100);
  }

  async function handleExportWord() {
    // Trigger download via API route
    const response = await fetch(`/api/export/${proposalId}?format=docx`);
    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${proposalTitle.replace(/[^a-zA-Z0-9]/g, "_")}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <div className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4 print:hidden">
      <Button variant="primary" size="sm" onClick={handlePrintToPdf} loading={printing}>
        <FileDown className="h-4 w-4" />
        Export as PDF
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportWord}>
        <FileText className="h-4 w-4" />
        Export as Word
      </Button>
      <p className="ml-auto text-xs text-zinc-500 self-center">
        Use browser print dialog to save as PDF
      </p>
    </div>
  );
}
