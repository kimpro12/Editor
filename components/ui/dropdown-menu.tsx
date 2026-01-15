"use client";

import * as React from "react";

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export function DropdownMenuTrigger({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
export function DropdownMenuContent({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border bg-background p-2 shadow">{children}</div>;
}
export function DropdownMenuItem({ children, onSelect }: { children: React.ReactNode; onSelect?: () => void }) {
  return (
    <button type="button" className="w-full text-left rounded px-2 py-1 text-sm hover:bg-muted" onClick={onSelect}>
      {children}
    </button>
  );
}
