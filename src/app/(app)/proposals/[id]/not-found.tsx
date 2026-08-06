import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProposalNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <p className="text-5xl font-bold text-zinc-200 mb-4">404</p>
      <h2 className="text-lg font-semibold text-zinc-800 mb-2">Proposal not found</h2>
      <p className="text-sm text-zinc-500 mb-6">
        This proposal doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Link href="/proposals">
        <Button variant="outline">Back to Proposals</Button>
      </Link>
    </div>
  );
}
