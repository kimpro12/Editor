import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

function mustExist(p) {
  assert.ok(existsSync(p), `missing: ${p}`);
}

function mustContain(p, needle) {
  const txt = readFileSync(p, "utf8");
  assert.ok(txt.includes(needle), `Expected "${needle}" in ${p}`);
}


mustExist("middleware.ts");
mustContain("middleware.ts", "dev_user");
mustExist("lib/supabase/client.ts");
mustContain("lib/supabase/client.ts", "createBrowserClient");
mustExist("lib/supabase/server.ts");
mustContain("lib/supabase/server.ts", "createServerClient");
mustExist("app/(auth)/login/page.tsx");


console.log("SELFCHECK STEP 02 OK");
