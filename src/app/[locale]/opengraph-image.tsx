import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { routing } from "@/i18n/routing";
import geometry from "../../../assets/brand/bull-geometry.json";
import ptCommon from "../../../messages/pt/common.json";
import enCommon from "../../../messages/en/common.json";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "FGV Quant — Liga de Finanças Quantitativas / Quantitative Finance League";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const copy = { pt: ptCommon.Brand, en: enCommon.Brand };
const [, , vw, vh] = geometry.viewBox;
const nodes = geometry.nodes as Record<string, number[]>;

// Render the mark in a 380px-tall box, preserving the viewBox aspect ratio.
const MARK_H = 380;
const MARK_W = Math.round((MARK_H * vw) / vh);
const point = (name: string) => {
  const [nx, ny] = nodes[name];
  return [nx * MARK_W, ny * MARK_H] as const;
};

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = copy[locale === "en" ? "en" : "pt"];
  const lora = await readFile(
    path.join(process.cwd(), "node_modules/@fontsource/lora/files/lora-latin-400-normal.woff"),
  );
  const loraBold = await readFile(
    path.join(process.cwd(), "node_modules/@fontsource/lora/files/lora-latin-700-normal.woff"),
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        padding: "0 72px",
        color: "#ffffff",
        fontFamily: "Lora",
        backgroundColor: "#130421",
        backgroundImage:
          "radial-gradient(circle at 30% 45%, rgba(120, 60, 200, 0.45) 0%, rgba(35, 0, 66, 0.35) 40%, rgba(19, 4, 33, 0) 70%)",
      }}
    >
      <svg width={MARK_W} height={MARK_H} viewBox={`0 0 ${MARK_W} ${MARK_H}`}>
        {geometry.edges.map(([a, b]) => {
          const [x1, y1] = point(a);
          const [x2, y2] = point(b);
          return (
            <line
              key={`${a}-${b}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#ffffff"
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })}
        {geometry.dots.map((d) => {
          const [cx, cy] = point(d);
          return <circle key={d} cx={cx} cy={cy} r={7} fill="#AE94D6" />;
        })}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", marginLeft: 48, flex: 1 }}>
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: 2, whiteSpace: "nowrap" }}>
          FGV QUANT
        </div>
        <div style={{ fontSize: 32, marginTop: 16, color: "#AE94D6" }}>{t.tagline}</div>
        <div style={{ fontSize: 26, marginTop: 40, color: "rgba(255,255,255,0.75)" }}>
          {t.motto}
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Lora", data: lora, style: "normal", weight: 400 },
        { name: "Lora", data: loraBold, style: "normal", weight: 700 },
      ],
    },
  );
}
