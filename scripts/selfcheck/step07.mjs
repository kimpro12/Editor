import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function mustExist(p) {
  assert.ok(existsSync(p), `missing: ${p}`);
}

function mustContain(p, needle) {
  const txt = readFileSync(p, "utf8");
  assert.ok(txt.includes(needle), `Expected "${needle}" in ${p}`);
}


mustExist("components/editor/StageCanvas.tsx");
mustContain("components/editor/StageCanvas.tsx", "Transformer");
mustContain("components/editor/StageCanvas.tsx", "getPointerPosition");
mustExist("lib/editor/store.ts");
mustContain("lib/editor/store.ts", "toggleIgnoreWarning");


console.log("SELFCHECK STEP 07 OK");
