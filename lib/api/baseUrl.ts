const Key = "ingestion_api_base_override";

export function getApiBaseOverride(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(Key);
  } catch {
    return null;
  }
}

export function setApiBaseOverride(value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (!value) localStorage.removeItem(Key);
    else localStorage.setItem(Key, value);
  } catch {}
}

export function resolveApiBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_INGESTION_API_BASE;
  const fallback = "/api/ingestion";
  if (typeof window === "undefined") return env || fallback;
  const override = getApiBaseOverride();
  return override || env || fallback;
}
