import { readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// On Windows, `new URL('.', import.meta.url).pathname` yields a `/C:/...` path.
// `fileURLToPath()` converts the file URL to a correct platform path.
const dir = fileURLToPath(new URL(".", import.meta.url));

const files = readdirSync(dir)
  .filter((f) => /^step\d+\.mjs$/.test(f))
  .sort();

for (const f of files) {
  const p = join(dir, f);
  // eslint-disable-next-line no-console
  console.log("Running", f);
  await import(pathToFileURL(p).href);
}

// eslint-disable-next-line no-console
console.log("SELFCHECK ALL OK");
