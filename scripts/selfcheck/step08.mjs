import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function mustExist(p) {
  assert.ok(existsSync(p), `missing: ${p}`);
}

function mustContain(p, needle) {
  const txt = readFileSync(p, "utf8");
  assert.ok(txt.includes(needle), `Expected "${needle}" in ${p}`);
}


mustExist("app/(app)/datasets/[id]/preview/page.tsx");
mustContain("app/(app)/datasets/[id]/preview/page.tsx", "TabsTrigger value=\"qc\"");
mustContain("app/(app)/datasets/[id]/preview/page.tsx", "Caption");


console.log("SELFCHECK STEP 08 OK");
