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

## Phase 2 — Design system & signature components (localhost)

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

## Phase 3 — Content model & data (localhost)

| #   | Task                                                                                                                                                           | Who                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 3.1 | Velite schemas for `newsletter` (MDX: title, date, sections, tags, linkedinUrl, cover), `team`, `events`, `competitions`, `partners`, `fund` (monthly returns) | 🤖                       |
| 3.2 | Transcribe the seven newsletter issues (Mar–Set/2026) into MDX from the text the league provided in 0.7, with tags and LinkedIn link-back                      | 🟢 (one agent per batch) |
| 3.3 | Populate team, events, competitions, partners and fund JSON from Phase 0 inputs. Use clearly marked placeholders where inputs are missing                      | 🟢                       |
| 3.4 | Optimize and rename images and logos into `/public`                                                                                                            | 🟢                       |
| 3.5 | Validate the schema build and spot-check the transcriptions against the sources                                                                                | 🤖                       |

## Phase 4 — Pages (localhost)

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

## Phase 5 — English version (localhost)

| #   | Task                                                                                                 | Who     |
| --- | ---------------------------------------------------------------------------------------------------- | ------- |
| 5.1 | Extract all UI strings to `messages/pt.json`                                                         | 🟢      |
| 5.2 | Translate into `messages/en.json` and add EN page copy. Newsletter stays PT with an explanatory note | 🟣      |
| 5.3 | Review the EN tone (finance terminology)                                                             | 🧑 + 🤖 |

## Phase 6 — QA & sign-off (localhost production build)

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

## Phase 7 — Deployment (first time anything leaves localhost)

| #   | Task                                                                                                          | Who                                |
| --- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| 7.1 | Create the Vercel account/team and confirm Hobby vs Pro terms for a student organization                      | 🧑                                 |
| 7.2 | Buy or arrange a domain (for example `fgvquant.com.br` through Registro.br, which requires a CPF/CNPJ holder) | 🧑                                 |
| 7.3 | Connect the GitHub repo to Vercel, or run a CLI deploy, after your explicit go-ahead                          | 🧑 authorizes, 🤖 configures       |
| 7.4 | Enable Vercel Analytics, set production env, check the preview deployment                                     | 🤖                                 |
| 7.5 | DNS records at the registrar                                                                                  | 🧑 (Claude provides exact records) |
| 7.6 | Smoke-test the live site and add the site link to the Linktree, Instagram and LinkedIn                        | 🤖 tests, 🧑 updates profiles      |
| 7.7 | Write `docs/CONTENT-GUIDE.md` covering how to add a newsletter issue or update returns, team and events       | 🟣                                 |

---

## Open risks

- **Content rights:** republishing newsletter issues and partner logos needs the league's OK (0.7, 0.9).
- **Fund performance:** must stay clearly labeled simulated, with a disclaimer.
- **Missing brand assets:** the placeholder palette may shift once the logo arrives, which is cheap because everything uses tokens.
- **Recruitment and team data:** these pages ship with placeholders if Phase 0 inputs are late. They must be filled before Phase 6 sign-off.
