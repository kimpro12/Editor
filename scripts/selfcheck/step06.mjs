import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function mustExist(p) {
  assert.ok(existsSync(p), `missing: ${p}`);
}

function mustContain(p, needle) {
  const txt = readFileSync(p, "utf8");
  assert.ok(txt.includes(needle), `Expected "${needle}" in ${p}`);
}


mustExist("app/(app)/datasets/[id]/upload/page.tsx");
mustContain("app/(app)/datasets/[id]/upload/page.tsx", "XMLHttpRequest");
mustExist("app/api/ingestion/v1/uploads/presign/route.ts");
mustExist("app/api/ingestion/v1/uploads/complete/route.ts");


console.log("SELFCHECK STEP 06 OK");
