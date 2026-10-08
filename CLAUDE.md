@AGENTS.md

# FGV Quant — website

Website for **FGV Quant**, the Liga de Finanças Quantitativas da FGV-SP. Planning docs live in `docs/`:

- [PLAN.md](docs/PLAN.md): phases, and who does what.
- [DECISIONS.md](docs/DECISIONS.md): what the user chose, plus the subagent model.
- [BRAND.md](docs/BRAND.md): palette, type and logo assets.
- [RESEARCH.md](docs/RESEARCH.md): source facts.

## Hard rules

1. **Localhost only until Phase 7.** Run `pnpm dev` or `pnpm build && pnpm start` on http://localhost:3000. Never run `vercel`, connect a host, or publish anything before the user gives explicit go-ahead in the deploy phase. Pushing to a private GitHub repo only happens if the user asks.
2. **Never delete files.** The parent workspace rule applies: candidates go to `Desktop/Claude/Bin/YYYY-MM-DD_<name>/`.
3. **Next.js 16.4 has breaking changes.** Read `node_modules/next/dist/docs/` before using an API you're unsure of. See AGENTS.md.
4. **Label FGV Quant Capital as simulated** ("Fundo Fictício / Simulated fund") on every page that shows returns.
5. **No invented facts.** Missing league data (team, recruitment, email) gets clearly marked placeholders and is tracked in `docs/PLAN.md` Phase 0.
6. **One dev server per checkout.** Before starting a preview, check whether something is already serving port 3000 (`lsof -iTCP:3000 -sTCP:LISTEN`). If the user's `npm run dev` is up, use it and don't start another. Two `next dev` processes in this folder race on `.next/dev/*.json` and corrupt the cache, which shows up as a JSON.parse 500 on every page. To repair it, truncate the broken manifest to its valid JSON; don't delete the cache.

## Stack

- Next.js 16.4 (App Router, `src/`, Turbopack, `cacheComponents`), React 19.3, TypeScript.
- Tailwind v4 via `@tailwindcss/turbopack`. Design tokens live in `src/app/globals.css`.
- `next-intl`: `pt` is the default (no prefix) and `en` lives at `/en`. Messages are in `messages/{pt,en}.json`.
- `next-themes`: dark by default, with a light theme.
- `motion` for animation and `lucide-react` for icons.
- `velite` for MDX/JSON content, and KaTeX for formulas.
- shadcn-style primitives in `src/components/ui`. Free registries only (Magic UI, Motion Primitives, Aceternity free, 21st.dev copy prompts); no 21st.dev MCP.
- pnpm.

## Commands

| Command                    | What it does                 |
| -------------------------- | ---------------------------- |
| `pnpm dev`                 | Dev server on localhost:3000 |
| `pnpm build && pnpm start` | Local production check       |
| `pnpm lint`                | ESLint                       |
| `pnpm typecheck`           | `tsc --noEmit`               |
| `pnpm format`              | Prettier                     |

## Brand

- **Colors:** primary `#230042`; base `#130421`/`#170537`; lavender accent `#AE94D6`.
- **Type:** Lora for display, Geist Sans for UI, Geist Mono for data.
- **Logo:** the bull mark is hand-traced geometry in `assets/brand/src/bull_geometry.py`. Regenerate the SVGs, PNGs and `bull-geometry.json` with `cd assets/brand/src && python3 -I build_svgs.py`. The lockup text is outlined Lora, produced by `outline.mjs`, which needs `opentype.js` and `@fontsource/lora`.
- The public copies the site uses are `public/brand/*.svg`, plus `src/app/icon.svg`, `apple-icon.png` and `favicon.ico`.

## Subagents

Claude (Opus) organizes. Delegate as follows:

- **Sonnet 5.5** (`model: "sonnet"`, default effort): components, pages, translation, audits.
- **Haiku 5.5** (`model: "haiku"`): mechanical work such as content transcription, data files, link checks and lint fixes.

Give agents running in parallel disjoint file sets. Verify with `pnpm build` after merging their work.
