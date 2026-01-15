import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">{title}</div>
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
