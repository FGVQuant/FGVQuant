// Picks a project's topic illustration (src/components/cards/issue-figure.tsx) from its title and summary.
// Run `node scripts/project-figure.mjs` to check the rules against the projects already published.

/**
 * Topic illustrations for finished projects, picked from the title (then the summary) by keyword, so a
 * project that goes from "Em andamento" to "Concluído" gets one with no code change. First match wins;
 * no match = no illustration (never a made-up topic). In-progress ones get "ongoing", the fund "fund".
 */
const FIGURE_RULES = [
  ["straddle", /straddle/],
  ["vwap", /vwap|volume weighted/],
  ["pairs", /pairs? trading|cointegra/],
  ["momentum", /momentum/],
  ["regimes", /regime/],
  ["rates", /taxa de juros|interest rate|curva de juros|yield curve/],
  ["event-study", /estudo de eventos|event stud/],
  ["clusters", /cluster|factor zoo|\bzoo\b/],
  ["deciles", /\bdecis\b|\bdecil|decile/],
  ["tail-risk", /risco de cauda|tail risk|value at risk/],
  ["alt-data", /dados alternativos|alternative data/],
  ["factors", /\bfator(es)?\b|\bfactors?\b/],
];
const fold = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
export function figureFor(title, summary) {
  for (const text of [title, summary]) {
    const hit = FIGURE_RULES.find(([, re]) => re.test(fold(text)));
    if (hit) return hit[0];
  }
}

// Self-check: the finished projects as of 2026-10, which used to be mapped by hand.
if (import.meta.main) {
  const { strictEqual } = await import("node:assert");
  const cases = [
    [
      "Quantas dimensões tem o zoo? Redundância informacional entre características de retorno",
      "",
      "clusters",
    ],
    [
      "Volatilidade de fundamentos no mercado acionário brasileiro",
      "A estratégia long-short entre os decis extremos",
      "deciles",
    ],
    [
      "Regimes focados em alocação e investimento dinâmico por fatores no mercado acionário brasileiro",
      "",
      "regimes",
    ],
    ["O fator Momentum na B3", "", "momentum"],
    ["Pairs Trading no setor de utilidade pública", "", "pairs"],
    ["Modelo preditivo para a taxa de juros", "", "rates"],
    ["Inteligência artificial e estudo de eventos para trading", "", "event-study"],
    ["Long Straddle", "", "straddle"],
    ["Volume Weighted Average Price (VWAP)", "", "vwap"],
    ["Momentum Trading com Random Forest", "", "momentum"],
    ["Pairs Trading em construtoras (EVEN3 e TRIS3)", "", "pairs"],
    ["Projeto com a B3", "Projeto de pesquisa em andamento.", undefined],
  ];
  for (const [title, summary, want] of cases) strictEqual(figureFor(title, summary), want, title);
  console.log(`ok: ${cases.length} casos`);
}
