# FGV Quant — website

Website for **FGV Quant**, the Liga de Finanças Quantitativas da FGV-SP. Bilingual (Portuguese by default, English at `/en`), dark theme by default, content-driven.

> **Status:** feature-complete on localhost. It is not deployed yet: the league still has to supply some content (see [docs/INPUTS.md](docs/INPUTS.md)). Anything not yet confirmed by the league is shown as a visible placeholder ("A confirmar com a liga" / "TBD").

## Quick start

Requires Node 20+ and pnpm 10.

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

| Command                    | What it does                                                  |
| -------------------------- | ------------------------------------------------------------- |
| `pnpm dev`                 | Dev server (Velite content runs in watch mode)                |
| `pnpm build && pnpm start` | Production build and local production server                  |
| `pnpm lint`                | ESLint                                                        |
| `pnpm typecheck`           | `tsc --noEmit`                                                |
| `pnpm format`              | Prettier (with the Tailwind class sorter)                     |
| `pnpm content`             | Build the content layer on its own (`content/` → `.velite/`)  |
| `pnpm check:messages`      | Check that `messages/pt` and `messages/en` have the same keys |

No environment variables are needed locally. At deploy time set `NEXT_PUBLIC_SITE_URL` (canonical origin for SEO, sitemap and OG images; defaults to `http://localhost:3000`).

## Stack

- **Next.js 16.4** (App Router, Turbopack, `cacheComponents`/PPR, `typedRoutes`), React 19.3, TypeScript.
- **Tailwind v4** via the `@tailwindcss/turbopack` loader. Design tokens live in [src/app/globals.css](src/app/globals.css) with shadcn naming.
- **next-intl 4** for i18n, **next-themes** for dark/light, **motion** for animation, **lucide-react** for icons.
- **Velite** for typed MDX/JSON content, with KaTeX for formulas (remark-math + rehype-katex).

> ⚠️ Next.js 16 has breaking changes from older versions you may know: `middleware.ts` is now [src/proxy.ts](src/proxy.ts), the locale comes from `next/root-params`, and the config is evaluated in a child process. Before using an API you're unsure of, read the docs bundled in `node_modules/next/dist/docs/`.

## Project layout

```
content/               Site data, validated by velite.config.ts (the single source of facts)
  site.json            League facts, socials, stats
  team/members.json    Members (placeholders until the league confirms)
  areas.json, events.json, competitions.json, partners.json
  fund.json            FGV Quant Capital (simulated fund) monthly returns
  newsletter/*.mdx     One file per newsletter issue
messages/{pt,en}/      UI strings per page namespace (next-intl)
src/
  app/[locale]/        One folder per page; PT slugs (sobre, time, capital, eventos, …)
    */_components/     Components used by only that page
  app/                 Root-level: global-not-found, sitemap, robots, icons, globals.css
  components/          Shared components (layout, hero, sections, cards, data, mdx, ui)
  i18n/                next-intl routing, request config, typed navigation helpers
  lib/content.ts       ALL content access goes through here (sorting, localisation, dates)
  lib/quant/gbm.ts     Geometric Brownian motion simulation for the Monte Carlo hero
  lib/seo.ts           Metadata and hreflang alternates
  proxy.ts             i18n routing plus real 404s for unknown newsletter slugs
assets/brand/          Logo sources (see "Brand" below); public copies are in public/brand/
scripts/               check-messages.mjs (PT/EN key parity)
docs/                  Planning docs: PLAN, DECISIONS, BRAND, RESEARCH, INPUTS, WALKTHROUGH
```

### Routing and i18n

- Locales are `pt` (default, no prefix: `/sobre`) and `en` (`/en/sobre`). Configured in [src/i18n/routing.ts](src/i18n/routing.ts). There's no automatic language detection and no locale cookie, so responses can stay static.
- Use the `Link`/`useRouter` helpers from [src/i18n/navigation.ts](src/i18n/navigation.ts), not `next/link`, so locale prefixes are handled.
- In server components, get the locale with `getPageLocale()` from [src/lib/locale.ts](src/lib/locale.ts).
- Every UI string goes in **both** `messages/pt/<ns>.json` and `messages/en/<ns>.json`. Run `pnpm check:messages` after editing.

### Content

- Pages never import `#site/content` directly. They use the helpers in [src/lib/content.ts](src/lib/content.ts) (`getIssues`, `getEvents`, `getFund`, `tr()` for `{ pt, en }` fields, and so on).
- Bilingual fields are `{ "pt": "...", "en": "..." }`. The newsletter is PT-only by design.
- Unknown facts use `placeholder: true`, which renders a visible "to be confirmed" note. Partners stay hidden until `permission: true`.
- Newsletter issues are `status: "summary"` (our own summary plus a LinkedIn link) until the league provides the full text and permission, which switches them to `"full"`.
- To add a newsletter issue, create `content/newsletter/YYYY-MM-<month>.mdx` with the frontmatter defined in [velite.config.ts](velite.config.ts). The slug comes from the filename, and [src/proxy.ts](src/proxy.ts) picks it up automatically.

### Dev-only pages

`/dev/components` and `/dev/content` are component and content showcases. They return 404 in production builds.

## Ground rules for contributors and agents

1. **Never invent facts** about the league (members, dates, emails, results). Use `placeholder: true` and record the open question in [docs/INPUTS.md](docs/INPUTS.md).
2. **FGV Quant Capital is a simulated fund.** Every page that shows its returns must label it "Fundo Fictício / Simulated fund" (see `capital/_components/disclaimer.tsx`).
3. **Keep PT and EN in sync.** Run `pnpm check:messages`.
4. **Run only one dev server per checkout.** Two `next dev` processes race on `.next/dev/*.json` and corrupt the cache, which shows up as a JSON.parse 500 on every page.
5. **Before committing:** `pnpm lint && pnpm typecheck && pnpm build` should all pass.
6. **No secrets in the repo.** `.env*` is gitignored; the site needs no API keys.

More context for AI agents is in [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md). Design and scope decisions are in [docs/DECISIONS.md](docs/DECISIONS.md).

## Brand

- **Colors:** primary `#230042`; backgrounds `#130421`/`#170537`; lavender accent `#AE94D6`.
- **Type:** Lora (display), Geist Sans (UI), Geist Mono (data), all self-hosted via `next/font`.
- **Logo:** the bull mark is hand-traced geometry in [assets/brand/src/bull_geometry.py](assets/brand/src/bull_geometry.py). To regenerate the SVGs, PNGs and `bull-geometry.json`, run:

  ```bash
  cd assets/brand/src && python3 -I build_svgs.py
  ```

  The lockup text is outlined Lora, produced by `outline.mjs` (uses `opentype.js` and `@fontsource/lora`). Copies used by the site are `public/brand/*.svg`, `src/app/icon.svg`, `apple-icon.png` and `favicon.ico`.

Full details are in [docs/BRAND.md](docs/BRAND.md).

## License

The source code is released under the [MIT License](LICENSE). The FGV Quant name, logo and brand assets (`assets/brand/`, `public/brand/`, the site icons), the site content in `content/` and the documents in `docs/entregas/` are **not** covered: they belong to the league and/or FGV. See the exclusions in [LICENSE](LICENSE).
