"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

type UserLabel = { label: string };

export function useCurrentUser(): UserLabel {
  const configured = isSupabaseConfigured();
  const supabase = useMemo(() => (configured ? createSupabaseBrowserClient() : null), [configured]);
  const [label, setLabel] = useState<string>(() => (configured ? "..." : "dev"));

  useEffect(() => {
    if (!supabase) {
      // Dev mode: read cookie indirectly by calling a tiny endpoint? We'll just show "dev".
      setLabel("dev");
      return;
    }
    supabase.auth.getUser().then(({ data }) => setLabel(data.user?.email ?? "user"));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setLabel(session?.user?.email ?? "user");
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  return { label };
}
