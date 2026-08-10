import { Skeleton } from "@/components/ui/skeleton";

export default function ProposalsLoading() {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
      <div className="space-y-3 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-48" />
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
      </div>
    </div>
  );
}
