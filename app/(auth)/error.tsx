"use client";

export default function AuthError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="p-6 space-y-2">
      <h2 className="text-lg font-semibold">Auth error</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button className="underline" onClick={() => reset()} aria-label="Retry auth">Try again</button>
    </div>
  );
}
