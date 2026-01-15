import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function mustExist(p) {
  assert.ok(existsSync(p), `missing: ${p}`);
}

function mustContain(p, needle) {
  const txt = readFileSync(p, "utf8");
  assert.ok(txt.includes(needle), `Expected "${needle}" in ${p}`);
}


mustExist("app/(app)/datasets/new/page.tsx");
mustContain("app/(app)/datasets/new/page.tsx", "localStorage");


console.log("SELFCHECK STEP 05 OK");
