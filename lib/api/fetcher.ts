import { resolveApiBaseUrl } from "@/lib/api/baseUrl";
import { createSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function getAuthHeader(): Promise<Record<string, string>> {
  // In dev-auth mode, BFF doesn't require Authorization.
  if (!isSupabaseConfigured()) return {};
  try {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const base = resolveApiBaseUrl();
  const url = base.replace(/\/$/, "") + path;

  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string> | undefined),
  };

  if (opts.json !== undefined) headers["Content-Type"] = "application/json";

  const auth = await getAuthHeader();
  Object.assign(headers, auth);

  const res = await fetch(url, {
    ...opts,
    headers,
    body: opts.json !== undefined ? JSON.stringify(opts.json) : opts.body,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const msg =
      (payload && typeof payload === "object" && "message" in payload && typeof (payload as any).message === "string")
        ? (payload as any).message
        : `Request failed (${res.status})`;
    throw new ApiError(res.status, msg, payload);
  }

  return payload as T;
}
