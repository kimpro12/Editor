import { Button } from "@/components/ui/button";

export function ErrorState({ title, error, onRetry }: { title: string; error: unknown; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-muted-foreground break-words">
        {error instanceof Error ? error.message : String(error)}
      </div>
      {onRetry ? <Button variant="outline" onClick={onRetry} aria-label="Retry">Retry</Button> : null}
    </div>
  );
}
