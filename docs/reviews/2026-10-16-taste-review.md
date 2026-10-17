# FGV Quant: taste review against Impeccable, Taste Skill and Emil Kowalski

**16 October 2026 · Status: proposals only, no site source changed · Localhost dev server, Playwright (Chromium) at 1440×900 and 390×844, dark and light**

Sources:

- [pbakaus/impeccable](https://github.com/pbakaus/impeccable): the craft floor, the refuse list and the anti-pattern detector.
- [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill): v2 house rules, the tells registry and the motion reference.
- [emilkowalski/skills](https://github.com/emilkowalski/skills): `emil-design-eng` and the `review-animations` standards.

Screenshots are in `assets/2026-10-16/`.

## The verdict in one paragraph

The site is honest, accessible and fast. Its one authored idea, the Monte Carlo fan that resolves into the bull, is genuinely good and passes Taste's "competitor test": no other league could use it. Everything around that idea, though, uses one generic grammar. Each section has a mono letter-spaced eyebrow, a Lora headline with one italic gradient word, a muted paragraph and a grid of identical rounded icon cards.

That grammar appears **43 times across 9 pages**, and all three sources name it as the signature of a generated landing page. Purple makes it worse, because purple glow plus gradient text is the first item on both Impeccable's and Taste's tell lists.

The fix isn't a redesign. Keep the brand, the hero and the content discipline. Take away the repeated decorative grammar, merge the pages that say the same thing twice, and let the content (issues, the competition result, the fund numbers) carry the visuals.

## What to keep

| Keep | Why |
| --- | --- |
| Monte Carlo hero + bull | The one authored, subject-derived moment. Both Impeccable and Taste want exactly one. |
| Hero caption `N = 128 · μ = 8% · σ = 24% · p5–p95` | A legitimate use of mono: it is real data about the picture. |
| Topic illustrations in the area cards (payoff, network, candles, scatter, code) | They are content, not decoration. |
| Placeholder and "a confirmar" system, simulated-fund labels, `selfReported` badge | Matches "never invent proof" in all three sources. |
| Static `NumberTicker` (no count-up) | Already follows Emil's rule against animating facts. Only the name is misleading. |
| Light theme | It reads more editorial than the dark one (`l-hero.jpg`). See "Add" item 6. |

## Delete

Ordered by impact.

1. **The eyebrow-on-every-section pattern** (`SectionHeader` and `PageIntro`, 43 uses). Impeccable: kicker above a heading is "a ban, not a default". Taste: no tiny letter-spaced uppercase labels. Keep the page-intro eyebrow on inner pages at most, and drop it from every `SectionHeader`.
2. **Gradient and glow on the emphasised word** (`text-emphasis` in `globals.css:271`, 18 `<Em>` uses). Gradient text and a chromatic drop-shadow glow are tells in all three sources. Keep `<Em>` only in the hero, as plain Lora italic in `--highlight` with no gradient and no `filter`. Everywhere else, write the headline straight.
3. **Repeated content blocks.**
   - Sobre repeats Home's KPI strip and the full 5-card areas bento.
   - Processo seletivo lists the same areas a third time as 8 icon cards.
   - Capital shows the identical disclaimer block twice.
   - Home shows +18,34% twice (KPI strip and Capital teaser).

   Each fact should live in one place, with links to it.
4. **The Home terminal section** (`v-home-5400.jpg`). It is the third telling of the mission, sits mostly empty (about 220px of blank panel), and matches Impeccable's "fake blinking cursor" tell. You did choose it, so rather than delete it, move it to the 404 page or a hidden `/sobre` easter egg, where play is welcome.
5. **Icon-on-top card grids.** These are:
   - Sobre's "Da teoria à prática" (6 cards).
   - Parceiros' "Seja parceiro" (4) and "Fale com a gente" (4).
   - Processo's "O que você vai desenvolver" (8).
   - Newsletter's "O formato" (5, numbered 01–05).

   Impeccable calls this `icon-tile-stack` and Taste bans rows of identical cards. Replace them with plain lists or `divide-y` rows.
6. **Lucide icons inside the bento cards** (`page.tsx:318`). The illustration already says "derivatives". The icon is a second, weaker label.
7. **Background layers.** There are five stacked: grain, site dots, section tones, radial glows and the intro dot spotlight. The detector flags feTurbulence grain and radial spotlight glows. Keep the dots, which read as chart paper and suit a quant site, and the tone step. Drop the grain and the radial glows.
8. **"FGV Quant Insights:" prefix on every issue title.** The rows read as the same title 7 times. Use the topic as the title (for example "Risco é uma estimativa: VaR, ES e FHS-GARCH") and put the month in the date column.
9. **"Resumo" badge on March and April**, which have no summary ("Resumo em breve"). The badge claims something that isn't there.

## Change

### Structure and navigation

- **The nav has 7 links, PT/EN, theme and a CTA.** Taste asks for a wordmark, 3–5 links and one action. Proposal:
  - Merge Time into Sobre until real names exist. The Time page is currently four "Nome a confirmar" rows and 40% empty width (`d-time.jpg`).
  - Merge Competições into Eventos as a kind, since the timeline already includes it.
  - Result: Sobre · Newsletter · Capital · Eventos · Parceiros + one CTA.
- **The primary CTA leads to a page with no information.** The header and hero send everyone to "Processo seletivo", which says "inscrições a confirmar". The 10 Oct review chose partners as the priority audience. Until recruitment dates exist, make "Seja parceiro" the filled button and "Processo seletivo" the outline. Flip them when inscriptions open, ideally from a `recruitment.open` flag in `site.json`.
- **Section rhythm.** Every section uses the same `section-y` (96px) and the same left-header-then-grid layout. Taste wants section gaps clearly larger than in-section gaps (120–220px on desktop) and neighbouring sections that don't share a layout. Alternate: full-bleed figure, then a two-column text-and-data block, then a list.

### Home, section by section

| Section | Change |
| --- | --- |
| KPI strip | Impeccable's banned "hero-metric template". Keep the facts but make them a single sentence-style band ("33 membros · 7 edições · 2º lugar no Desafio Quant AI"). Drop the fund figure here; it lives in the Capital block. |
| Quem somos + competition card | Good. Fix "Augur" rendering as a lone mono word under "2º lugar". Label it "estratégia Augur" in sans. |
| Áreas bento | Keep the illustrations, drop the icons, drop the outlines in favour of a tone step. Consider making the tiles link somewhere (newsletter tag filter). Today they are dead ends. |
| Newsletter | The featured cover is still a mostly empty gradient box with a month name, and it is a card nested inside a card. See "Add" item 1 for the cover. Give the older issues text-only rows with no box. |
| Capital teaser | Merge with the KPI fund number, as one place for the number. |
| Atividades timeline | The alternating zigzag spends about 1,300px on 4 items (`v-home-4500.jpg`). Use a compact list with a semester rail on the left, and keep the animated "drift" line only on /eventos. |
| Final CTA | Fine. Remove the radial glow and dot spotlight, and use a tone step. |

### Typography

- **Big numbers in Geist Mono look broken in PT.** The full-width mono comma renders "+18,34%" as "+18 , 34%" (`v-home-900.jpg`). Set display numbers in Geist Sans with `tabular-nums`, or Lora lining figures. Keep mono for tables, code and the hero caption only.
- **Mono micro-labels.** There are 12 `tracking-[0.18em]` uppercase labels, plus all tags rendered as uppercase mono pills. Make them sentence-case Geist Sans 13px.
- **Measure.** 11 paragraphs on Home measure wider than about 85ch at 1440px; the newsletter-row excerpts run about 900px wide. Cap them at `max-w-[65ch]`.
- **Light text on dark.** Bump body line-height to 1.6 and set muted text to weight 400 at least. Impeccable recommends one step heavier on dark.

### Surfaces and colour

- Replace "1px border + card fill + 16px radius" on everything with **tone steps**: `--card` a touch lighter than `--background`, and no border at rest. Keep borders for inputs and the focus ring. That one change removes most of the generated look.
- Keep a single lavender accent, but stop putting it on eyebrows, tags, dates, links and emphasis at once. Reserve it for actions and data (chart bars, the fan band).
- The hard elliptical rim around the bull reads a little like a portal. It is optional, and you approved the flow layout, so this is a note, not a recommendation.

### Motion (Emil's rules)

- Add tokens:
  - `--ease-out: cubic-bezier(0.23,1,0.32,1)`
  - `--ease-in-out: cubic-bezier(0.77,0,0.175,1)`
  - `--ease-drawer: cubic-bezier(0.32,0.72,0,1)`

  The mobile nav already uses `[0.16,1,0.3,1]`, which is fine. Make it the token.
- Fix `transition-all` in `bento-grid.tsx:104` (list `transform, color`).
- Give pressable elements press feedback (`active:scale-[0.97]`, 160ms ease-out). There is none today.
- Gate hover effects behind `@media (hover:hover) and (pointer:fine)`. Today, tapping on touch leaves the bento glow and arrow nudge stuck. None of the hover styles are gated.
- Replace the global `0.01ms` reduced-motion kill (`globals.css:154`) with "fewer and gentler": keep opacity and colour transitions, drop translate, scale and the timeline draw. Impeccable's `audit` flags the blanket kill.
- Keep the timeline's 500ms colour transitions. They are under-scroll ambience, not UI.

### Copy

- "Rigor" appears in three headlines (hero, Áreas, Sobre). Keep it in the hero only.
- Avoid the paired-headline cadence ("Cinco frentes, um mesmo rigor."). It is Taste's aphoristic tell.
- The link labels "Ver todas as edições", "Ver todos os eventos" and "Ver competições" are fine.

## Add

1. **Content-derived newsletter covers.** Each issue gets one small real figure from its own subject: the September cover is a loss distribution with the VaR/ES cut; July is a Kalshi/Polymarket spread; June is a long-straddle payoff. These are drawn as SVG with the same line language as the area illustrations. This is the site's second authored idea and it makes each issue distinguishable at a glance. It is also generative, so the league needs no designer.
2. **A real "Pesquisa" proof point.** Take one issue (September VaR vs FHS-GARCH) and render an interactive figure on the issue page with KaTeX formulas. A sponsor sees work, not adjectives.
3. **Partner one-pager.** A compact "what you get / formats / audience numbers" block plus a PDF media kit when the league supplies it. The LinkedIn CTA stays until an email exists.
4. **Photography slots.** The site has zero images of people. Add designed slots (4:5 portraits, one wide event photo on Home and Sobre) that switch on with a content flag, as the partners permission gate does.
5. **Browser polish:**
   - `caret-color: var(--highlight)`.
   - Themed scrollbars (`scrollbar-color`).
   - `text-underline-offset` tokens.
   - `tabular-nums` on every numeric column.
6. **Light theme as the reading default for issue pages.** Optional, but long-form MDX reads better light, and Impeccable asks that dark or light come from the use scene, not habit. Sponsors read on office laptops; students browse at night.
7. **A `prefers-reduced-motion` "settled" hero frame and a pause button** on the hero, if the twinkle loop stays. WCAG 2.2.2 applies to loops longer than 5s.

## Suggested order

1. **Distill (S–M):** delete items 1–9 plus the background trim. This is mostly removing code, carries the biggest visual change, and is low risk.
2. **Surfaces and type (M):** tone steps, number font, micro-labels, measure.
3. **Structure (M):** merge Time into Sobre and Competições into Eventos, swap the CTA order, compact the timeline.
4. **Motion polish (S):** tokens, press feedback, hover gating, reduced-motion rewrite.
5. **Authored additions (M–L):** content-derived covers, research figure, partner one-pager.

## How changes will be verified

- **Locally only.** Nothing is pushed, especially now that the repo belongs to the official FGVQuant account. The local `origin` still points to `Ottoprestes/FGVQuant`, which GitHub redirects.
- **Playwright.** Before-and-after screenshots at 320, 390, 768, 1024 and 1440px, in both themes and both locales. Plus an overflow check (`scrollWidth`), keyboard focus, and the reduced-motion emulation.
- **Figma.** The official Figma MCP is available in this session but wasn't used for this review. Each phase's before and after frames go into a review file so you can compare side by side and comment. The separate Figma plugin connector needs authorising in claude.ai settings if you want it, but it isn't required.
- **Checks.** `pnpm lint`, `pnpm typecheck`, `pnpm check:messages` and `pnpm build` after each phase.
