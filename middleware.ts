import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient, isSupabaseConfiguredMiddleware } from "@/lib/supabase/middleware";

const APP_PREFIXES = ["/dashboard", "/datasets", "/settings", "/about"];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isAppRoute = APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!isAppRoute) return NextResponse.next();

  // Dev auth fallback if Supabase env not present
  if (!isSupabaseConfiguredMiddleware()) {
    const devUser = req.cookies.get("dev_user")?.value;
    if (!devUser) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const { supabase, res } = createSupabaseMiddlewareClient(req);
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return res;
}

export const config = {
  matcher: ["/dashboard", "/datasets/:path*", "/settings", "/about"],
};
