import { NextRequest } from "next/server";
import { mockdb } from "@/lib/server/mockDb";

export const dynamic = "force-dynamic";

function getUserId(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const cookieUser = req.cookies.get("dev_user")?.value;
  return bearer || cookieUser || "anon";
}

// Next.js 15: `params` in route handlers is a Promise.
// https://nextjs.org/docs/app/api-reference/file-conventions/route#context-optional
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = getUserId(req);
  const { id } = await params;

  const d = mockdb.get(userId, id);
  if (!d) return Response.json({ message: "Not found" }, { status: 404 });
  return Response.json(d);
}
