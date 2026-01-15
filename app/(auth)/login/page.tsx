"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const supabaseConfigured = isSupabaseConfigured();
  const supabase = useMemo(() => (supabaseConfigured ? createSupabaseBrowserClient() : null), [supabaseConfigured]);

  const [devName, setDevName] = useState("dev");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/dashboard");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session) router.replace("/dashboard");
    });
    return () => sub.subscription.unsubscribe();
  }, [router, supabase]);

  async function devLogin() {
    try {
      const res = await fetch("/api/dev-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: devName || "dev" }),
      });
      if (!res.ok) throw new Error("dev login failed");
      toast.success("Dev login ok");
      router.replace("/dashboard");
    } catch (e: any) {
      toast.error(e?.message ?? "Dev login failed");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {supabaseConfigured && supabase ? (
            <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} providers={[]} />
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Supabase env vars are not set. Using <b>Dev Auth</b> (cookie-based) so you can try the full UI with BFF mocks.
              </p>
              <div className="space-y-2">
                <Label htmlFor="devName">Dev username</Label>
                <Input id="devName" value={devName} onChange={(e) => setDevName(e.target.value)} />
              </div>
              <Button className="w-full" onClick={devLogin}>
                Continue
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <Link href="/">← Back to landing</Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
