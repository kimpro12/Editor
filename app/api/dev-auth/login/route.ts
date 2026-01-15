import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name : "dev";
  const res = NextResponse.json({ ok: true, name });
  res.cookies.set("dev_user", name, { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}
