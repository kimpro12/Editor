import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const key = String(body?.key ?? "");
  const get_url = `/api/ingestion/mock-storage/get?key=${encodeURIComponent(key)}`;
  return Response.json({ get_url });
}
