import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

function getUserId(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const cookieUser = req.cookies.get("dev_user")?.value;
  return bearer || cookieUser || "anon";
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  const body = await req.json().catch(() => ({}));
  const dataset_id = String(body?.dataset_id ?? "");
  const upload_id = String(body?.upload_id ?? "");
  const content_type = String(body?.content_type ?? "application/octet-stream");

  const key = `raw/${userId}/${dataset_id}/${upload_id}/sheet`;
  // keep extension if image
  const ext = content_type.includes("png") ? "png" : content_type.includes("jpeg") ? "jpg" : "bin";
  const fullKey = `${key}.${ext}`;

  const put_url = `/api/ingestion/mock-storage/put?key=${encodeURIComponent(fullKey)}&contentType=${encodeURIComponent(content_type)}`;
  return Response.json({ put_url, key: fullKey });
}
