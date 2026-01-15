import { NextRequest } from "next/server";
import { mockdb } from "@/lib/server/mockDb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function getUserId(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const cookieUser = req.cookies.get("dev_user")?.value;
  return bearer || cookieUser || "anon";
}

// Next.js 15: `params` in route handlers is a Promise.
// https://nextjs.org/docs/app/api-reference/file-conventions/route#context-optional
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserId(req);
  const { id: datasetId } = await params;

  const body = await req.json().catch(() => ({}));
  const boxes = Array.isArray(body?.boxes) ? body.boxes : [];
  const dedupe = Boolean(body?.dedupe);

  const res = await mockdb.finalize(userId, datasetId, boxes, dedupe);
  return Response.json(res);
}
