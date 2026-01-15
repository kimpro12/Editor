import { NextRequest } from "next/server";
import { mockdb } from "@/lib/server/mockDb";

export const dynamic = "force-dynamic";

function getUserId(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const cookieUser = req.cookies.get("dev_user")?.value;
  return bearer || cookieUser || "anon";
}

function syntheticBoxes() {
  // basic demo boxes with QC warnings
  return [
    { id: crypto.randomUUID(), x: 40, y: 40, w: 96, h: 96, qc_warnings: ["small_box?"] },
    { id: crypto.randomUUID(), x: 180, y: 70, w: 120, h: 140, qc_warnings: [] },
    { id: crypto.randomUUID(), x: 360, y: 60, w: 110, h: 110, qc_warnings: ["near_edge?"] },
  ];
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  const body = await req.json().catch(() => ({}));
  const dataset_id = String(body?.dataset_id ?? "");
  const upload_id = String(body?.upload_id ?? "");
  const asset_type = String(body?.asset_type ?? "sprite_sheet");

  // In this mock, the presign route already determined the key convention.
  // We reconstruct the likely raw key. (Client also has it but doesn't send; OK for mock.)
  const rawKeyPng = `raw/${userId}/${dataset_id}/${upload_id}/sheet.png`;
  const rawKeyJpg = `raw/${userId}/${dataset_id}/${upload_id}/sheet.jpg`;
  const rawKeyBin = `raw/${userId}/${dataset_id}/${upload_id}/sheet.bin`;

  const raw = mockdb.getObject(rawKeyPng) ? rawKeyPng : (mockdb.getObject(rawKeyJpg) ? rawKeyJpg : rawKeyBin);

  mockdb.setRaw(userId, dataset_id, raw);
  const boxes = syntheticBoxes();
  mockdb.setBoxes(userId, dataset_id, boxes);

  return Response.json({
    preview_key: raw,
    boxes,
    status: "PREVIEW_READY",
    asset_type,
  });
}
