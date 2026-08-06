import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3 text-zinc-400">
      <Spinner className="h-5 w-5 text-violet-500" />
      <span className="text-sm">Loading proposal…</span>
    </div>
  );
}
