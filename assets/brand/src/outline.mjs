// Outline lockup text in Lora 400 to SVG path data. Usage: node outline.mjs <out.json>
import opentype from "opentype.js";
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const font = opentype.loadSync(
  require.resolve("@fontsource/lora/files/lora-latin-400-normal.woff"),
);

function outline(text, size, tracking = 0) {
  const scale = size / font.unitsPerEm;
  let x = 0,
    d = "",
    prev = null;
  for (const ch of text) {
    const g = font.charToGlyph(ch);
    if (prev) x += font.getKerningValue(prev, g) * scale;
    d += g.getPath(x, 0, size).toPathData(2);
    x += g.advanceWidth * scale + tracking;
    prev = g;
  }
  return { d, width: +(x - tracking).toFixed(2) };
}
const out = {
  font: "Lora 400 (@fontsource/lora, OFL)",
  title: outline("FGV QUANT", 370, 10),
  subtitle: outline("Liga de Finanças Quantitativas", 150),
};
writeFileSync(process.argv[2], JSON.stringify(out));
console.log(out.title.width, out.subtitle.width);
