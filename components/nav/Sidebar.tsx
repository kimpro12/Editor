import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/datasets", label: "Datasets" },
  { href: "/settings", label: "Settings" },
  { href: "/about", label: "About" },
];

export function Sidebar() {
  return (
    <aside className="border-r bg-card">
      <div className="p-4">
        <div className="font-semibold">Ingestion</div>
        <div className="text-xs text-muted-foreground">Mock BFF mode</div>
      </div>
      <nav className="px-2 pb-4 space-y-1">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "block rounded-md px-3 py-2 text-sm hover:bg-muted",
              "text-foreground"
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
