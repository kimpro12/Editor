import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function isSupabaseConfiguredServer() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY);
}

export async function createSupabaseServerClient() {
  if (!isSupabaseConfiguredServer()) {
    throw new Error("Supabase env vars not configured");
  }

  // Next.js 15 `cookies()` is async. Always await it.
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // ignore if called from a Server Component
          }
        },
      },
    }
  );
}
