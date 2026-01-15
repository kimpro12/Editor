import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function mustExist(p) {
  assert.ok(existsSync(p), `missing: ${p}`);
}

function mustContain(p, needle) {
  const txt = readFileSync(p, "utf8");
  assert.ok(txt.includes(needle), `Expected "${needle}" in ${p}`);
}


mustExist("app/(app)/settings/page.tsx");
mustContain("app/(app)/settings/page.tsx", '"use client"');
mustContain("app/(app)/settings/page.tsx", "Ingestion API base");

mustExist("lib/api/baseUrl.ts");
mustContain("lib/api/baseUrl.ts", "localStorage");
mustExist("app/(app)/about/page.tsx");


console.log("SELFCHECK STEP 10 OK");
