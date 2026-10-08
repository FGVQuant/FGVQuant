// Verifies PT/EN message parity: same keys, same {placeholders}, no empty strings.
// Usage: node scripts/check-messages.mjs   (exit 1 on problems)
import { readdirSync, readFileSync } from "node:fs";

const flat = (obj, prefix = "", out = {}) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flat(v, key, out);
    else out[key] = v;
  }
  return out;
};
const load = (locale) =>
  Object.assign(
    {},
    ...readdirSync(`messages/${locale}`)
      .filter((f) => f.endsWith(".json"))
      .map((f) => flat(JSON.parse(readFileSync(`messages/${locale}/${f}`, "utf8")))),
  );
const vars = (s) =>
  [...String(s).matchAll(/\{(\w+)/g)]
    .map((m) => m[1])
    .sort()
    .join(",");

const pt = load("pt");
const en = load("en");
const problems = [];
for (const k of Object.keys(pt)) if (!(k in en)) problems.push(`missing in en: ${k}`);
for (const k of Object.keys(en)) if (!(k in pt)) problems.push(`missing in pt: ${k}`);
for (const k of Object.keys(pt)) {
  if (!(k in en)) continue;
  if (vars(pt[k]) !== vars(en[k]))
    problems.push(`placeholder mismatch: ${k} (pt: ${vars(pt[k])} / en: ${vars(en[k])})`);
  if (String(pt[k]).trim() === "" || String(en[k]).trim() === "") problems.push(`empty: ${k}`);
}
console.log(`${Object.keys(pt).length} pt keys, ${Object.keys(en).length} en keys`);
if (problems.length) {
  console.log(problems.join("\n"));
  process.exit(1);
}
console.log("OK: PT/EN messages are in parity");
