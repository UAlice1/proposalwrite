import Link from "next/link";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 py-20 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 mb-4">
        <FileText className="h-6 w-6 text-violet-500" />
      </div>
      <h3 className="font-semibold text-zinc-900 mb-1">No proposals yet</h3>
      <p className="text-sm text-zinc-500 max-w-xs mb-6">
        Create your first AI-powered proposal in minutes — just fill in a few details and we handle the rest.
      </p>
      <Link href="/proposals/new">
        <Button>
          <Plus className="h-4 w-4" />
          Create your first proposal
        </Button>
      </Link>
    </div>
  );
}
