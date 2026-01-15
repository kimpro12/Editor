import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function mustExist(p) {
  assert.ok(existsSync(p), `missing: ${p}`);
}

function mustContain(p, needle) {
  const txt = readFileSync(p, "utf8");
  assert.ok(txt.includes(needle), `Expected "${needle}" in ${p}`);
}


mustExist("app/(app)/datasets/page.tsx");
mustExist("app/api/ingestion/v1/datasets/route.ts");
mustContain("app/api/ingestion/v1/datasets/route.ts", "export async function GET");
mustContain("app/api/ingestion/v1/datasets/route.ts", "export async function POST");


console.log("SELFCHECK STEP 04 OK");
