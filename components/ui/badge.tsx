import { cn } from "@/lib/utils";

export function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" }) {
  const v = variant === "secondary" ? "bg-muted text-foreground" : "bg-foreground text-background";
  return <span className={cn("inline-flex items-center rounded-md px-2 py-1 text-xs font-medium", v, className)} {...props} />;
}
