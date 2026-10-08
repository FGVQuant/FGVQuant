# FGV Quant — Brand Notes

Sources:

- The logo the league provided (`assets/brand/logo-original.jpg`).
- The Instagram grid (@fgvquant) and the LinkedIn banner, both viewed 2026-10-08.

Hex values are sampled from the logo file and from screenshots. The JPEG screenshot values are approximate, so get exact values from the league's design files if they exist.

## Logo

- **Mark:** a low-poly, wireframe **bull head**. White strokes connect node dots, which reads as both "bull market" and "network/graph".
- **Wordmark:** "FGV QUANT" in **Lora** (confirmed by the league), with "Liga de Finanças Quantitativas" set below it.
- **Lockup:** white on the brand purple. A horizontal lockup (bull on the left, wordmark on the right) is used on the LinkedIn banner and Instagram headers.
- **SVG assets (2026-10-08).** The league has no SVG, so Claude hand-traced the bull as node-and-edge geometry. The source is `assets/brand/src/bull_geometry.py`, and you regenerate everything with `python3 -I build_svgs.py`. Outputs in `assets/brand/`:
  - `bull-mark.svg`: uses `currentColor`, so it inherits the theme color.
  - `bull-mark-white.svg` and `bull-mark-purple.svg`.
  - `icon-square.svg`: white bull on purple with rounded corners, for the favicon and app icon.
  - `lockup.svg`, `lockup-white.svg` and `lockup-on-purple.svg`: horizontal logo.
  - `bull-geometry.json`: normalized nodes and edges for the Monte Carlo hero animation.
- **Caveats:**
  - The lockup's text is live `<text>` in Lora, so it falls back to Georgia where Lora isn't installed. In Phase 1 it will be converted to paths.
  - The trace is a faithful redraw, not the original vector, so the league should approve it before launch.

## Palette

| Token         | Hex           | Where it's seen                                              |
| ------------- | ------------- | ------------------------------------------------------------ |
| `brand-950`   | `#130421`     | Darkest corners of Instagram post gradients                  |
| `brand-900`   | `#170537`     | Main post backgrounds                                        |
| `brand-800`   | **`#230042`** | **Logo background (exact, sampled)**: primary brand color    |
| `brand-700`   | `#2B1254`     | Gradient mid-tones and cards                                 |
| `brand-500`   | `#544683`     | Glass highlights and borders                                 |
| `accent`      | `#AE94D6` (≈) | **Lavender highlight words** ("FGV Quant", "Insights", "IA") |
| `accent-soft` | `#D4C8DE` (≈) | Light lavender text and glints                               |
| `fg`          | `#FFFFFF`     | Headlines and the logo                                       |

**Light theme (derived):**

- Background `#F7F5FB`
- Text `#230042`
- Accent darkened to about `#6B4FA0` for WCAG AA contrast

## Visual language (Instagram)

- Deep purple **radial gradients** with soft glows, not flat black.
- Glossy **3D glass objects**, all in purple: a glass bull medallion, a molecule/node network, spheres, ribbon swooshes.
- **Headlines:** a clean geometric sans in white, with a key word picked out in lavender.
- **Buttons:** outlined **pill buttons**, for example "Deslize para saber mais".
- **Header bar:** the small logo at top-left and a series label at top-right ("FGV Quant 2026.2", "Eventos 2026.2", "Fundo Fictício").
- **Tagline in post footers:** **"Excelência. Inovação. Precisão."**
- **Content series:**
  - O que é a FGV Quant
  - O que são Finanças Quantitativas
  - Eventos
  - FGV Quant Insights (monthly newsletter)
  - FGV Quant Capital (labeled **"Fundo Fictício"**)
  - Awards and competitions, for example a trophy photo at FGV EESP

## Implications for the site

- **Dark mode is brand purple, not neutral black.** The base is `brand-950`/`brand-900` with radial `brand-700` glows. The "dark research-firm" direction becomes **"dark purple research-firm"**.
- **One accent:** lavender `#AE94D6`, used for highlight words, links, chart lines and the Monte Carlo percentile band.
- **Type:**
  - Lora (serif) for display, to stay consistent with the logo.
  - Geist Sans or Inter for UI and body, matching the Instagram sans.
  - Geist Mono for numbers and data.
  - This replaces the earlier Instrument Serif proposal.
- **Motif to reuse:** the bull's node-and-edge wireframe. The Monte Carlo hero can resolve its paths into the bull's node graph, and node and edge lines can work as section dividers.
- Glass and glow cards (backdrop blur, `brand-500` hairline borders) echo the 3D glass objects.
- Use pill-outline buttons as the secondary button style.
- Use **"Excelência. Inovação. Precisão."** as the footer and hero sub-tagline.
- Label the fund **"Fundo Fictício / Simulated fund"**, matching their own wording.

## Peer leagues (LinkedIn "similar pages") — benchmark their sites

- Liga Insper Quantitative Finance
- Poli Quant (USP)
- FGV Real Estate
- FGV Finance
