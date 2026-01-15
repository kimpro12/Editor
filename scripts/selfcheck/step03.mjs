import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function mustExist(p) {
  assert.ok(existsSync(p), `missing: ${p}`);
}

function mustContain(p, needle) {
  const txt = readFileSync(p, "utf8");
  assert.ok(txt.includes(needle), `Expected "${needle}" in ${p}`);
}


mustExist("components/providers/QueryProvider.tsx");
mustContain("components/providers/QueryProvider.tsx", "QueryClientProvider");
mustExist("lib/api/fetcher.ts");
mustContain("lib/api/fetcher.ts", "Authorization");
mustExist("lib/api/types.ts");
mustContain("lib/api/types.ts", "zod");


console.log("SELFCHECK STEP 03 OK");
