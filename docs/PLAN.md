# FGV Quant Website — Implementation Plan

Based on [DECISIONS.md](DECISIONS.md) and [RESEARCH.md](RESEARCH.md).

**Deployment rule:** everything runs on **localhost** (`pnpm dev` → http://localhost:3000, or `pnpm build && pnpm start` for production checks) until Phase 6 is signed off. Nothing is pushed to Vercel or any public URL before Phase 7.

Legend:

- 🧑 **You** do it.
- 🤖 **Claude** (organizer) does it.
- 🟣 Sonnet 5.5 subagent.
- 🟢 Haiku 5.5 subagent.

**Stack:**

- Next.js (App Router) + TypeScript
- Tailwind v4 + shadcn/ui
- `motion`
- `next-intl` for i18n
- Velite (MDX/JSON content)
- KaTeX for formulas
- Recharts/Tremor or `lightweight-charts` for the fund chart
- pnpm

---

## Phase 0 — Inputs & permissions (blocking for real content, not for scaffolding)

| #    | Task                                                                                                                                                                                          | Who |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --- |
| 0.1  | Confirm the league wants this site and who approves it (president or diretoria)                                                                                                               | 🧑  |
| 0.2  | ~~Logo, colors and font~~ ✅ done. Palette sampled, Lora confirmed, and the bull traced to SVG (`assets/brand/`, see [BRAND.md](BRAND.md)). **Remaining:** the league approves the traced SVG | 🧑  |
| 0.3  | Get the contact email (the Linktree hides it)                                                                                                                                                 | 🧑  |
| 0.4  | Get the **Projeto AvantGarde** PDF and what it is                                                                                                                                             | 🧑  |
| 0.5  | Get recruitment info: dates, stages, eligibility, form link, FAQ                                                                                                                              | 🧑  |
| 0.6  | Get team data: names, roles, areas/diretorias, photos, LinkedIn URLs, and consent to publish                                                                                                  | 🧑  |
| 0.7  | Get permission to republish newsletter issues on-site, plus the issue text, ideally exported or copy-pasted by the league rather than scraped                                                 | 🧑  |
| 0.8  | Get FGV Quant Capital data: monthly returns series, methodology blurb, and confirmation it may be published (labeled simulated)                                                               | 🧑  |
| 0.9  | Get partner logos and permission to use Itaú Asset, Vault Capital and GVTech names and logos                                                                                                  | 🧑  |
| 0.10 | Get competition details and photos (Desafio Quant AI 2026), events list and photos                                                                                                            | 🧑  |
| 0.11 | Turn the inputs above into a checklist in `docs/INPUTS.md` and track what has arrived                                                                                                         | 🤖  |

## Phase 1 — Scaffold & foundations (localhost) ✅ done 2026-10-08

| #    | Task                                                                                                                                                       | Who                    |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| 1.1  | `git init` and create the Next.js + TS + Tailwind v4 app with pnpm, ESLint and Prettier                                                                    | 🤖                     |
| 1.2  | Write the project `CLAUDE.md` (stack, commands, localhost-only rule, subagent model)                                                                       | 🤖                     |
| 1.3  | Initialize shadcn/ui. Add `motion`, `next-intl` (PT default, `/en`), Velite and KaTeX                                                                      | 🤖                     |
| 1.4  | Set up design tokens (dark default, light theme), fonts (Instrument Serif, Geist Sans/Mono), grid and noise utilities, theme toggle                        | 🤖                     |
| 1.4b | Convert the lockup text to outlined paths using Lora from `@fontsource/lora` (fonttools). Generate favicon, apple-touch and OG PNGs from `icon-square.svg` | 🤖                     |
| 1.5  | Build the app shell: header/nav, language switch, footer with socials, 404 page                                                                            | 🟣                     |
| 1.6  | Optional: create a **private** GitHub repo for backup. Pushing code is not deploying; no hosting is connected                                              | 🧑 decides, 🤖 sets up |

**Exit:** `pnpm dev` serves an empty, themed shell in PT and EN on localhost:3000, and `pnpm build` passes.

**Phase 1 notes:**

- **Stack versions:** Next **16.4** (`cacheComponents`, `proxy.ts` instead of middleware, `next/root-params` for the locale), React 19.3, next-intl 4.14 with `localePrefix: "as-needed"`.
- **Fonts:** Lora, Geist and Geist Mono are self-hosted through `next/font`. Lora replaces Instrument Serif.
- **Tokens:** follow shadcn naming. The brand lavender is `--highlight`. `components.json` is ready for `shadcn add`, with the Magic UI registry configured.
- **Velite:** installed but not wired yet; it gets configured with the real collections in 3.1.
- **OG image:** deferred to 4.10, so it can use the final hero design.
- **Desktop nav breakpoint:** the nav appears at `xl` (1280px). Below that it's the menu button plus the Join CTA, because the 7 nav items don't fit at 1024px.

## Phase 2 — Design system & signature components (localhost) ✅ built and reviewed 2026-10-08

| #   | Task                                                                                                                                   | Who |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | --- |
| 2.1 | **Monte Carlo hero**: canvas GBM fan with percentile band, seeded, pauses off-screen, reduced-motion fallback, light and dark variants | 🤖  |
| 2.2 | **Terminal panel**: typed mission, scoped commands (`/join`, `/newsletter`, `/capital`, `/team`), keyboard accessible                  | 🤖  |
| 2.3 | KPI strip: number tickers and sparklines (Magic UI Number Ticker plus a custom sparkline)                                              | 🟣  |
| 2.4 | Drift timeline: animated vertical timeline driven by events JSON                                                                       | 🟣  |
| 2.5 | Bento grid for focus areas, and a grayscale logo marquee that colorizes on hover                                                       | 🟣  |
| 2.6 | Base cards: newsletter issue card, member card, event card, section headers                                                            | 🟣  |
| 2.7 | `/dev/components` showcase page on localhost only, excluded from the production build                                                  | 🟢  |
| 2.8 | Review the components on localhost and give visual feedback                                                                            | 🧑  |

**Exit:** all components render on the showcase page in both themes, mobile through desktop.

**Phase 2 notes:**

- **Showcase:** http://localhost:3000/dev/components. It returns 404 in production builds.
- **Monte Carlo hero:**
  - Paths are seeded (seed 2021) and the hero runs N=128, μ=8%, σ=24%.
  - The path endpoints assemble into the bull, drawn from `bull-geometry.json`.
  - It pauses when off-screen, re-reads the theme colors when the theme changes, and shows a static final frame under reduced motion.
  - On narrow screens the fan is faded and sits lower.
- **Terminal:** `/help`, `/clear`, Tab autocomplete and command history. Navigation commands use next-intl routing. It has clickable command chips for mouse users.
- **Built by subagents (Sonnet), reviewed and fixed by Claude:**
  - Fixed: the KpiStrip/NumberTicker/Sparkline sparkline label was hardcoded PT.
  - DriftTimeline needed no fixes.
  - Fixed: BentoGrid/BentoCard took an icon prop that wasn't serializable.
  - Fixed: the LogoMarquee duplicate copy was tabbable.
  - Button/Badge/SectionHeader and the cards needed no fixes.
- **Showcase (Haiku):** I fixed the sample fund value (it showed 118.34 instead of +18.34%).
- **Header changes:** it is more opaque when scrolled, and the Join CTA is hidden below `sm`, where it's in the menu panel instead.
- **Known dev-only warning:** next-themes' inline script triggers React 19's "script tag" warning. It's harmless.
- **Your review (2.8):**
  - **Approved as is:** hero speed, and bull size on desktop and at 507×909.
  - **Fixed: skip at the end of the fan.** The fan now interpolates its last segment, and the bull nodes launch from each path's current tip instead of its final endpoint.
  - **Fixed: "com rigor" receded instead of standing out.** Emphasis now uses Lora italic with a luminous gradient (`text-emphasis`): white to `#b99bff` with a glow in dark, `#230042` to `#6b3fc4` in light.
  - **Follow-ups on the desktop hero.**
    - First I tried an "orbit" ring around the bull, which you rejected.
    - Final version is a "flow" layout. The fan sweeps the full width and flows around the bull like a current around an obstacle:
      - Each point is pushed out of an ellipse fitted to the bull's nodes by ρ' = (ρ^2.2 + 1)^(1/2.2).
      - Everything is clipped to outside that ellipse, so the space behind the bull stays clean purple.
      - The paths rejoin and continue past the bull to the right edge.
      - The bull assembles from the points where the paths pass it.
    - The bull is 30% of viewport width (was 34%), centred at ≤74% of the width so the flow past it stays visible.
    - Mobile is unchanged.

## Phase 3 — Content model & data (localhost) ✅ done 2026-10-08 (real content pending Phase 0 inputs)

| #   | Task                                                                                                                                                           | Who                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 3.1 | Velite schemas for `newsletter` (MDX: title, date, sections, tags, linkedinUrl, cover), `team`, `events`, `competitions`, `partners`, `fund` (monthly returns) | 🤖                       |
| 3.2 | Transcribe the seven newsletter issues (Mar–Set/2026) into MDX from the text the league provided in 0.7, with tags and LinkedIn link-back                      | 🟢 (one agent per batch) |
| 3.3 | Populate team, events, competitions, partners and fund JSON from Phase 0 inputs. Use clearly marked placeholders where inputs are missing                      | 🟢                       |
| 3.4 | Optimize and rename images and logos into `/public`                                                                                                            | 🟢                       |
| 3.5 | Validate the schema build and spot-check the transcriptions against the sources                                                                                | 🤖                       |

**Phase 3 notes:**

- **Velite collections:**
  - `newsletter` (MDX, `status: summary|full`)
  - `team`, `areas`, `events` (date precision day/month/semester/year), `competitions`, `partners` (`permission` gate), `fund` (simulated, reported months only), `site`
  - `devSamples`: a dev-only fixture
- **Typed helpers:** `src/lib/content.ts`.
- **MDX rendering:** `MdxContent` (Sonnet), with KaTeX, Callout, heading anchors, locale-aware links and `.prose-fq` styles. Verified in the browser at `/dev/content`.
- **Next integration:** `next.config.ts` is now a phase-aware function. Velite watches under `next dev` and runs an awaited clean build before `next build`. The argv approach didn't work in Next 16.
- **Content written by Claude (facts only):**
  - The 7 issues are our own summaries with LinkedIn links. March and April have no summary yet.
  - The team has 4 placeholder seats.
  - Partners are hidden until permission arrives.
  - The fund has only Jul and Aug 2026, plus the +18.34% cumulative figure.
- **Still pending:** every remaining league input is listed in [INPUTS.md](INPUTS.md).
- **Writing display math:** put `$$` on its own lines. A single-line `$$…$$` renders inline.

## Phase 4 — Pages (localhost) ✅ done 2026-10-09

| #    | Page                                                                                                                                                 | Who           |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| 4.1  | **Home**: Monte Carlo hero, KPI strip, bento focus areas, terminal panel, latest issues, partner marquee, Join CTA                                   | 🤖 integrates |
| 4.2  | **Sobre/About**: mission, PBL method, history since 2021, structure                                                                                  | 🟣            |
| 4.3  | **Newsletter**: archive (filter by tag and month) plus issue page (`/newsletter/[slug]`) with subscribe-on-LinkedIn CTA                              | 🟣            |
| 4.4  | **Time/Team**: leadership and areas, member cards                                                                                                    | 🟣            |
| 4.5  | **Processo seletivo**: timeline, stages, FAQ, application link                                                                                       | 🟣            |
| 4.6  | **FGV Quant Capital**: cumulative and monthly returns chart, table, methodology, a prominent "simulated portfolio, not investment advice" disclaimer | 🟣            |
| 4.7  | **Competições**: Desafio Quant AI 2026 results and team write-ups                                                                                    | 🟣            |
| 4.8  | **Eventos**: drift timeline of classes, visits and workshops                                                                                         | 🟣            |
| 4.9  | **Parceiros & Contato**: logos, contact email, socials                                                                                               | 🟢            |
| 4.10 | Metadata, sitemap, robots, static OG image                                                                                                           | 🟢            |
| 4.11 | Integration pass: navigation, cross-links, consistent spacing                                                                                        | 🤖            |

Pages 4.2–4.9 can run as parallel subagents because each owns its own route folder.

**Phase 4 notes:**

- **Who built what:**
  - Claude: Home, shared prep (per-namespace `messages/{locale}/*.json`, `PageIntro`, `PlaceholderNote`, `getPageLocale`), footer wired to `content/site.json`, and integration.
  - Sonnet agents, in parallel with disjoint route folders: Sobre + Time; Newsletter archive + issue; Capital + Competições; Processo seletivo + Eventos + Parceiros/Contato; SEO (sitemap, robots, OG/Twitter images per locale, `SITE_URL`).
- **Integration fixes:**
  - The terminal's `{cmd}`/`{path}` strings had to be passed with `t.raw`.
  - `DriftTimeline` internal links now use the locale-aware `Link`, which replaced a local `/en` prefix workaround.
  - The Competições list indices ("01/02/03") read as placements and were removed.
  - Placeholder team seats showed "AC" initials; they now show "?" and "A confirmar".
  - `metadataBase` now uses `SITE_URL`, and the hardcoded aria-label is localized.
- **Production check:** `VELITE_STARTED=1 pnpm build` (to coexist with a running dev server) generates 61 pages. Every page is 200 in PT and EN, and `/dev/*` is 404. The sitemap has 32 URLs, plus robots and OG images.
- **Known for Phase 6:**
  - An unknown `/newsletter/<slug>` renders the not-found UI with `noindex` but HTTP 200. That's PPR streaming; a true 404 needs the proxy to reject unknown slugs.
  - The OG images are dynamic (ƒ) instead of static.
  - Ask the league to confirm Sobre's "Grupos de estudo" / "Pesquisa" activity descriptions; they're generic, not sourced.
  - The SEO agent left temp files at `node_modules/.og-tmp/` and `node_modules/.og-run.mjs`. They're harmless and gitignored.

## Phase 5 — English version (localhost) ✅ done 2026-10-09 — awaiting your EN review (5.3)

| #   | Task                                                                                                 | Who     |
| --- | ---------------------------------------------------------------------------------------------------- | ------- |
| 5.1 | Extract all UI strings to `messages/pt.json`                                                         | 🟢      |
| 5.2 | Translate into `messages/en.json` and add EN page copy. Newsletter stays PT with an explanatory note | 🟣      |
| 5.3 | Review the EN tone (finance terminology)                                                             | 🧑 + 🤖 |

**Phase 5 notes:**

- **Parity checker:** `pnpm check:messages` (`scripts/check-messages.mjs`) verifies PT/EN key parity, `{placeholder}` parity and non-empty strings. Currently 359/359 keys.
- **Hardcoded-string audit (Haiku, read-only):** no hardcoded PT shows on `/en`.
  - `DriftTimeline`'s Portuguese default kind labels were a latent risk, so `kindLabels` is now required. That immediately caught one caller.
  - The OG alt text is intentionally bilingual.
- **EN copy pass (Sonnet, `messages/en/*` only):** 61 strings changed for American spelling, finance terminology ("simulated fund", "cumulative return since inception", PBL), emphasis pairs, and consistent "Recruitment process" CTAs. All disclaimers are kept at least as strong as the PT.
- **PT strings it flagged, now fixed by Claude:**
  - The duplicated "em números" eyebrow.
  - The About fund KPI was missing its "(fictício)" label.
  - The Capital risk wording.
  - The Join newsletter item.
- **Reminder:** the newsletter content stays Portuguese by design, and `/en` says so.

## Phase 6 — QA & sign-off (localhost production build) 🔶 QA done 2026-10-09 — awaiting league walkthrough (6.7) and your sign-off (6.8)

| #   | Task                                                                                         | Who                   |
| --- | -------------------------------------------------------------------------------------------- | --------------------- |
| 6.1 | `pnpm build && pnpm start`: verify production build locally                                  | 🤖                    |
| 6.2 | Accessibility audit (contrast in both themes, keyboard navigation, reduced motion, alt text) | 🟣                    |
| 6.3 | Performance audit (Lighthouse ≥ 90, canvas CPU use, font loading, image sizes)               | 🟣                    |
| 6.4 | Responsive check at 375, 768 and 1440 px, in both themes and both languages                  | 🤖 (browser pane)     |
| 6.5 | Link check (internal links and LinkedIn link-backs), typo pass                               | 🟢                    |
| 6.6 | Code review of the full codebase                                                             | 🟣 (code-reviewer)    |
| 6.7 | **League walkthrough on localhost** (screen share or your machine). Collect fixes            | 🧑                    |
| 6.8 | Apply fixes, then get final sign-off: "approved to deploy"                                   | 🤖 fixes, 🧑 approves |

**Phase 6 notes:**

- **Audits.** Four read-only audits ran in parallel against a local production server on :3001:
  - Accessibility (Sonnet): axe in both themes at 375 and 1280px, plus contrast maths.
  - Performance (Sonnet): Lighthouse plus bundle analysis.
  - Links and proofreading (Haiku).
  - Code review (code-reviewer).
- **Fixes.** Applied in three batches with disjoint files:
  - **A, Claude (performance core).** Hero canvas:
    - Deferred to idle.
    - The finished fan is cached to an offscreen canvas and blitted.
    - The twinkle is throttled to about 15fps after it settles.
    - Save-Data gets the static frame.
    - Half the paths on narrow screens, and a DPR cap on low-core devices.

    Also:
    - Fonts trimmed to the `latin` subset; Geist Mono isn't preloaded.
    - No `NEXT_LOCALE` cookie.
    - Modern browserslist.
    - The OG image fonts are read synchronously, so the route builds static (●).
    - Proxy-level real 404 for unknown newsletter slugs, safe against malformed escapes.
    - Branded bilingual `app/global-not-found.tsx` (`experimental.globalNotFound`). Unmatched URLs previously got Next's unstyled default.
    - Sobre's equation is native MathML, so no render-blocking KaTeX CSS there.
    - The decorative formula is SVG text, so there's no false contrast failure.

  - **B, Sonnet (pages and data):**
    - Sign-aware fund returns.
    - Placeholder notes gated on real data flags.
    - An explicit `ranked` flag for competition teams.
    - Local team photos via `s.image()`, with area labels.
    - The bar chart handles 12–36 months. Claude also fixed edge-label clipping, verified with a 24-month test series that was then reverted.
    - Per-page canonical and hreflang (`src/lib/seo.ts`).
    - `h3` heading order, a keyboard-reachable equation, an archive live region, partner logo dimensions, and a zero-issue guard.
  - **C, Sonnet (shared components):**
    - Terminal focus ring and contrast, `aria-disabled` chips.
    - Bento split into a server component with a client glow island.
    - Marquee pause control (WCAG 2.2.2).
    - Timeline: no per-frame re-renders, accessible names that keep the visible text.
    - The ticker server-renders its final value.
    - Mobile menu uses `inert`.
    - Footer target sizes, a darker light-theme red.
    - Localized "opens in a new tab" hints. Claude made these fall back to `Common` messages, so no call sites need changes.
- **Proofreading fixes:** "Fundo fictício" used consistently, sentence-case area titles, punctuation, unused keys removed.
- **Results** (Lighthouse, production build):

  |                              | Performance       | Accessibility | Best Practices | SEO |
  | ---------------------------- | ----------------- | ------------- | -------------- | --- |
  | Desktop, all 5 audited pages | 100               | 100           | 100            | 100 |
  | Mobile                       | 90–92 (was 81–89) | 100           | 100            | 100 |

  Home mobile blocking time went from 170ms to 10ms. SEO 100 needs `NEXT_PUBLIC_SITE_URL` to match the serving origin. That's set in Phase 7; locally the canonical defaults to localhost:3000.

- **Links:** every internal target is 200 in both locales, no `/en` page links to a PT path, and the `#contato` anchor resolves.
- **League walkthrough:** the checklist is in [WALKTHROUGH.md](WALKTHROUGH.md).

## Phase 7 — Deployment (first time anything leaves localhost)

| #   | Task                                                                                                                    | Who                                |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 7.1 | Create the Vercel account/team and confirm Hobby vs Pro terms for a student organization                                | 🧑                                 |
| 7.2 | Buy or arrange a domain (for example `fgvquant.com.br` through Registro.br, which requires a CPF/CNPJ holder)           | 🧑                                 |
| 7.3 | Connect the GitHub repo to Vercel, or run a CLI deploy, after your explicit go-ahead                                    | 🧑 authorizes, 🤖 configures       |
| 7.4 | Enable Vercel Analytics, set production env (incl. `GOOGLE_API_KEY` for `pnpm sync`), check the preview deployment      | 🤖                                 |
| 7.5 | DNS records at the registrar                                                                                            | 🧑 (Claude provides exact records) |
| 7.6 | Smoke-test the live site and add the site link to the Linktree, Instagram and LinkedIn                                  | 🤖 tests, 🧑 updates profiles      |
| 7.7 | Write `docs/CONTENT-GUIDE.md` covering newsletter issues and how a sheet edit reaches the site (redeploy / deploy hook) | 🟣                                 |

---

## Open risks

- **Content rights:** republishing newsletter issues and partner logos needs the league's OK (0.7, 0.9).
- **Fund performance:** must stay clearly labeled simulated, with a disclaimer.
- **Missing brand assets:** the placeholder palette may shift once the logo arrives, which is cheap because everything uses tokens.
- **Recruitment and team data:** these pages ship with placeholders if Phase 0 inputs are late. They must be filled before Phase 6 sign-off.
