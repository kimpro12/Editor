import { NextRequest } from "next/server";
import { mockdb } from "@/lib/server/mockDb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!key) return Response.json({ message: "missing key" }, { status: 400 });

  const obj = mockdb.getObject(key);
  if (!obj) return Response.json({ message: "not found" }, { status: 404 });

  // TypeScript 5.7+ makes TypedArrays generic over `ArrayBufferLike`, so `obj.bytes.buffer`
  // can become `ArrayBuffer | SharedArrayBuffer` which is not assignable to `BodyInit`.
  // Copy into an ArrayBuffer-backed `Uint8Array` to keep typings happy on all platforms.
  const body: Uint8Array<ArrayBuffer> = new Uint8Array(obj.bytes);

  const filename = key.endsWith(".zip") ? "dataset.zip" : key.endsWith(".json") ? "manifest.json" : undefined;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": obj.contentType,
      "Cache-Control": "no-store",
      ...(filename ? { "Content-Disposition": `attachment; filename=\"${filename}\"` } : {}),
      "X-Content-Type-Options": "nosniff",
    },
  });
}
