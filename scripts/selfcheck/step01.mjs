import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function mustExist(p) {
  assert.ok(existsSync(p), `missing: ${p}`);
}

function mustContain(p, needle) {
  const txt = readFileSync(p, "utf8");
  assert.ok(txt.includes(needle), `Expected "${needle}" in ${p}`);
}


mustExist("app/(public)/page.tsx");
mustContain("app/(public)/page.tsx", "Go to Dashboard");
mustExist("components/ui/button.tsx");
mustContain("components/ui/button.tsx", "export const Button");
mustExist("app/(app)/layout.tsx");
mustContain("app/(app)/layout.tsx", "Sidebar");


console.log("SELFCHECK STEP 01 OK");
