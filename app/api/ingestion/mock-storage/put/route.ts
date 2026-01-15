import { NextRequest } from "next/server";
import { mockdb } from "@/lib/server/mockDb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  const contentType = searchParams.get("contentType") || req.headers.get("content-type") || "application/octet-stream";
  if (!key) return Response.json({ message: "missing key" }, { status: 400 });

  const buf = new Uint8Array(await req.arrayBuffer());
  mockdb.putObject(key, buf, contentType);

  return new Response(null, { status: 200, headers: { ETag: `"mock-${buf.length}"` } });
}
