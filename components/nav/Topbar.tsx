"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "sonner";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function Topbar() {
  const router = useRouter();
  const user = useCurrentUser();

  async function logout() {
    try {
      if (isSupabaseConfigured()) {
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
      } else {
        await fetch("/api/dev-auth/logout", { method: "POST" });
      }
      toast.success("Signed out");
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="px-6 h-14 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          User: <b className="text-foreground">{user.label}</b>
        </div>
        <Button variant="outline" onClick={logout} aria-label="Logout">Logout</Button>
      </div>
    </header>
  );
}
