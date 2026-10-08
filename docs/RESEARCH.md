# FGV Quant — Research Notes

Research date: 2026-10-08. Gathered by two Sonnet 5.5 subagents. Items marked **[GAP]** couldn't be accessed or verified; confirm them with the league.

## 1. Who they are

- **Name and type:** "FGV Quant – Liga Estudantil", the Liga de Finanças Quantitativas da FGV-SP. It is an independent student entity.
- **Founded:** 2021, in São Paulo. LinkedIn lists it under EAESP, but it seems open to all FGV students.
- **Size:** about 33 members. LinkedIn has about 2,729 followers.
- **Mission:** to produce content on and go deeper into quantitative finance. They use PBL (Problem Based Learning) and apply mathematics, statistics and programming. Topics include derivatives, ML, algorithmic trading and Python.
- **Specialties:** Quantitative Research | Systematic Trading Strategies.
- **No website.** Linktree is their only hub, so a site fills a real gap.
- **Structure and leadership:** **[GAP]**. Hugo Villanova is a former president.

## 2. Channels (from Linktree)

| Channel                  | URL                                                                          |
| ------------------------ | ---------------------------------------------------------------------------- |
| Instagram                | https://www.instagram.com/fgvquant/                                          |
| LinkedIn                 | https://www.linkedin.com/company/fgvquant                                    |
| Newsletter (subscribe)   | https://www.linkedin.com/newsletters/fgv-quant-insights-7435439773789437952/ |
| Email                    | **[GAP]**                                                                    |
| "Projeto AvantGarde" PDF | **[GAP]**: purpose unknown                                                   |

## 3. Newsletter: "FGV Quant Insights"

- **Platform and cadence:** LinkedIn newsletter, monthly, in PT-BR.
- **Recurring sections:**
  - Personalidade da Área
  - Radar de Estratégias
  - Notícias
  - Recomendação Cultural
  - Oportunidades de Estágio/Vagas
  - Fontes
- **Occasional sections:** feature article, guest column, glossary.

| Issue    | Highlights                                                                                                                | URL                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Set/2026 | Guest column by Bruno Drezza (Vault Capital) on VaR/ES and EWMA vs FHS-GARCH; Merton; volatility targeting; _Margin Call_ | https://pt.linkedin.com/pulse/fgv-quant-insights-setembro-2026-fgvquant-aficf      |
| Ago/2026 | Benjamin Graham; alt data and satellite imagery; _Tune Out the Noise_                                                     | https://pt.linkedin.com/pulse/fgv-quant-insights-agosto-de-2026-fgvquant-xlr2f     |
| Jul/2026 | David E. Shaw; prediction-market arbitrage; _Flirting with Models_                                                        | https://pt.linkedin.com/pulse/fgv-quant-insights-julho-de-2026-fgvquant-gfapf      |
| Jun/2026 | Eugene Fama; long straddle (IV vs RV); SoFi acquiring Composer                                                            | https://www.linkedin.com/pulse/fgv-quant-insights-junho-de-2026-fgvquant-phmgf     |
| Mai/2026 | Feature on AI in markets, from ML to LLMs; Robert Almgren; factor investing                                               | https://pt.linkedin.com/pulse/fgv-quant-insights-maio-de-2026-fgvquant-54tbf       |
| Abr/2026 | (contents not fetched)                                                                                                    | https://pt.linkedin.com/pulse/fgv-quant-insights-abril-de-2026-fgvquant-7cyaf      |
| Mar/2026 | (possibly the first issue)                                                                                                | https://pt.linkedin.com/pulse/fgv-quant-insights-mar%C3%A7o-de-2026-fgvquant-ietef |

LinkedIn has no RSS and no subscribe API. The site can only link out to subscribe, or mirror issues as MDX.

## 4. Activities

- **FGV Quant Capital:** a simulated fund with monthly reports.
  - Ago/26: +3.84%
  - Jul/26: +0.29%
  - Since inception: +18.34%
  - The site must label it "simulated".
- **Desafio Quant AI 2026 (Itaú Asset):** Hugo Villanova's "Augur" strategy placed 2nd. Two league teams, "Alpha Helix" and "El Dorado", made the top 10. The league reported this itself; I couldn't verify it independently.
- **Special class with GVTech:** ML and AI in quant finance, taught by Rodrigo Togneri.
- **Company visit:** Vault Capital, August 2026, including a challenge presentation.
- **Processo seletivo (recruitment):** **[GAP]**.

## 5. Partners and brand

- **Partners:** they have worked with Itaú Asset, Vault Capital and GVTech. No formal sponsor list was found.
- **Logo, colors and Instagram visual style:** **[GAP]**. Ask the league for the logo SVG and the palette.
- **Tone and language:** PT-BR, professional and educational, with a pop-culture touch. Bios use English terminology.

## 6. UI component sources

- **21st.dev:** a shadcn-format community registry. Install with `npx shadcn@latest add "https://21st.dev/r/<author>/<component>"`. There is a free daily install limit, and some installs need membership. Its Magic MCP (`npx @21st-dev/cli@latest init --client claude`) adds `/ui <description>` generation and needs an API key.
- **Magic UI** (MIT): Number Ticker, Marquee, Grid/Dot Pattern, Animated Beam, Bento Grid.
- **Aceternity UI** (free and paid Pro): Background Beams, Spotlight, Sparkles, Hero Parallax.
- **Motion Primitives** (MIT): Text Effect, Text Morph, Animated Number, Infinite Slider.
- **React Bits** (MIT with Commons Clause): Aurora, Dither, Decrypted Text, Count Up.
- **shadcn/ui and Blocks, Tremor:** charts, data tables, KPI cards.
- **Others:** Origin UI, Cult UI, Hover.dev, Skiper UI, Eldora UI, Kokonut UI. Check licenses before using these.
- **Charts:** TradingView `lightweight-charts` (open source) for real price-style charts.
- **Fonts:** Geist Sans and Geist Mono, Instrument Serif (display), JetBrains Mono (data).
- **References:** Linear, Vercel, Stripe, Jane Street, Two Sigma, HRT, Citadel.

## 7. Custom components Claude can generate

1. **Monte Carlo hero:** GBM path fan on canvas, with a percentile band. It respects reduced-motion settings.
2. **Ticker tape:** a marquee of club topics, events and milestones in market-ticker style, not real prices.
3. **Terminal panel:** types out the mission and has a command palette (`/join`, `/research`, `/newsletter`).
4. **Equation reveal:** a KaTeX formula such as Black–Scholes or Itô draws itself on scroll.
5. **Efficient-frontier cursor field:** background points drift along a frontier curve toward the pointer.
6. **Newsletter archive:** a tagged, sortable table or heatmap with monospace tag chips.
7. **Team cards with "factor loadings":** each member's skill radar or bars appear on hover.
8. **Semester drift timeline:** events and competitions on an animated timeline.
9. **KPI strip:** number tickers and sparklines for members, issues, competitions and the simulated fund return.
10. **Partner logo cloud:** a grayscale marquee that colorizes on hover.
