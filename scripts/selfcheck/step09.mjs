import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function mustExist(p) {
  assert.ok(existsSync(p), `missing: ${p}`);
}

function mustContain(p, needle) {
  const txt = readFileSync(p, "utf8");
  assert.ok(txt.includes(needle), `Expected "${needle}" in ${p}`);
}


mustExist("app/(app)/datasets/[id]/finalize/page.tsx");
mustExist("app/api/ingestion/v1/datasets/[id]/finalize/route.ts");
mustExist("app/api/ingestion/v1/downloads/presign/route.ts");


console.log("SELFCHECK STEP 09 OK");
