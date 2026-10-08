# FGV Quant Website — Decisions Log

Decisions captured 2026-10-08 from the selection questionnaire. Background is in [RESEARCH.md](RESEARCH.md) and the build is in [PLAN.md](PLAN.md).

## Pages and sections (all selected)

**Core**

- [x] Home + About/Mission
- [x] Newsletter archive ("FGV Quant Insights")
- [x] Team & structure
- [x] Processo seletivo / Join

**Additional**

- [x] FGV Quant Capital (simulated fund, labeled "simulated" everywhere)
- [x] Competitions & achievements (Desafio Quant AI 2026)
- [x] Events & activities
- [x] Partners + Contact

## Newsletter

- **MDX mirror on-site.** Each issue is republished as `/newsletter/[slug]` with full control, SEO and KaTeX/charts support.
- Each issue page has a "Read on LinkedIn" link and a subscribe CTA pointing to the LinkedIn newsletter.
- We are **not** building our own email list.

## Visual direction

- **Dark research-firm.** Near-black base, one accent color, hairline grids and noise texture.
- **Updated 2026-10-08 after the logo was received.** The direction is now the **dark _purple_ research-firm**, based on the brand rather than neutral black. See [BRAND.md](BRAND.md).
  - Primary `#230042`, base `#130421`/`#170537`, single lavender accent `#AE94D6`.
  - Lora display serif (it matches the logo wordmark), Geist Sans body, Geist Mono for data.
  - The bull wireframe (nodes and edges) is the recurring motif, with glass and glow cards and pill buttons.
  - Tagline: "Excelência. Inovação. Precisão."
- Dark-first, with a **light-theme toggle** (selected extra).

## Components

**Custom signature components (Claude builds)**

- [x] Monte Carlo hero: GBM path fan on canvas with a percentile band. It pauses off-screen and respects `prefers-reduced-motion`.
- [x] Terminal panel: types out the mission and has a command palette (`/join`, `/newsletter`, `/capital`).
- [ ] Ticker tape: not selected.
- [ ] Equation reveal: not selected.

**Supporting components**

- [x] KPI strip with number tickers and sparklines
- [x] Drift timeline for events and milestones
- [x] Bento grid for focus areas, plus the partner logo marquee
- [ ] Team "factor" cards: not selected. Use clean standard member cards instead.

**Sources**

- Registry only, no 21st.dev Magic MCP, so no account or API key is needed.
- Use free libraries: Magic UI, Motion Primitives, Aceternity (free tier), shadcn/ui, and 21st.dev "copy prompt" pages.
- Check each component's license before using it.

## Language

- **PT-BR default, plus an EN toggle**, via `next-intl` with routes `/` and `/en`.
- Newsletter issues stay in PT. EN pages show a "Portuguese only" note.

## Content management

- **MDX/JSON in Git.**
  - Newsletter issues are MDX.
  - Team, events, competitions, partners and fund returns are typed JSON/MDX validated by schema (Velite or Content Collections).
- Zero recurring cost.

## Extras

- [x] Dark/light toggle
- [x] Analytics. Privacy-friendly Vercel Analytics, **enabled only in the deploy phase**.
- [ ] Command palette (⌘K) site-wide: not selected. The terminal panel's commands are scoped to that panel.
- [ ] Auto OG images: not selected. Basic metadata, sitemap and a static OG image are still included as baseline hygiene.

## Hosting and deployment

- **Localhost only** (`localhost:3000`) until the final phase is complete and approved.
- **Final host: Vercel.** Hobby tier is for non-commercial use. A student league site should qualify, but confirm this before deploying.

## Subagent operating model

Claude (Opus 5.5) works as **organizer**:

- Owns architecture, specs, design tokens and integration.
- Reviews every subagent output before merging.
- Delegates bounded tasks with explicit file ownership so parallel agents never touch the same files.

| Model                                | Agent `model` param | Effort                                                             | Use for                                                                                                                                                                                |
| ------------------------------------ | ------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sonnet 5.5** (`claude-sonnet-5-5`) | `sonnet`            | default (don't set `effort`)                                       | Building individual components and pages from a spec, EN translation, writing content schemas, research, a11y/perf audits, code review passes                                          |
| **Haiku 5.5** (`claude-haiku-5-5`)   | `haiku`             | any level: `low` for mechanical work, higher for fiddly transforms | Transcribing newsletter issues into MDX from provided text, populating JSON data files, link checks, image optimization and renaming, lint and type-error fixes, repetitive copy edits |
| **Opus 5.5** (organizer)             | n/a                 | n/a                                                                | Phase planning, design system, signature components (Monte Carlo hero, terminal), final integration and verification                                                                   |

**Rules**

- Each delegated prompt includes target files, the acceptance criteria and the "localhost only, never deploy" constraint.
- Agents that run in parallel get disjoint file sets.
- Claude runs `pnpm build && pnpm lint` after each merge, plus a visual check in the browser pane.
- No subagent runs `vercel`, `git push` or any deploy command before Phase 7.
