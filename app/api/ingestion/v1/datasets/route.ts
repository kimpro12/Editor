import { NextRequest } from "next/server";
import { mockdb } from "@/lib/server/mockDb";

export const dynamic = "force-dynamic";

function getUserId(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const cookieUser = req.cookies.get("dev_user")?.value;
  return bearer || cookieUser || "anon";
}

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  return Response.json(mockdb.list(userId));
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name : "Untitled";
  const asset_type = typeof body?.asset_type === "string" ? body.asset_type : "sprite_sheet";
  const token = typeof body?.token === "string" ? body.token : undefined;
  const created = mockdb.create(userId, { name, asset_type, token });
  return Response.json(created);
}
