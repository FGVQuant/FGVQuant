# FGV Quant — visual design review and proposed action plan

**10 October 2026 · Audience priority: institutional partners and sponsors · Status: proposals for review**

## Recommendation

Evolve the site into a more restrained editorial research identity. Keep the deep purple palette, Lora display type, Geist body and data type, and wireframe bull. Give research output, achievements, real people, and the partnership offer more prominence.

The foundation is distinctive. The largest opportunities are the order of information, repeated decorative surfaces, and incomplete content presented at a large scale. A sponsor should quickly understand who the league is, see credible evidence of its work, and find a clear way to collaborate.

These are design recommendations, not measured conversion improvements. Website source and content have not been changed. This report and its screenshots are the deliverables.

## What was verified

| Area | Review performed | Limitation |
| --- | --- | --- |
| English site | Rendered Home, About, Newsletter, Team, Capital, Competitions, Events, and Recruitment | Deeper visual inspection concentrated on Home, Partners, Team, and Capital; Partners was also rendered separately |
| Desktop | 1280 × 720 preview; Home also at 1024 × 768 | Chromium in-app browser, development server |
| Mobile | Home and Partners at 390 × 844; Partners at 320 × 740; Competitions at 390 × 844 | Responsive simulation, not a physical-device test |
| Light theme | Capital page and shared header | Other pages still need a complete light-theme pass |
| Source | Shared tokens, header/menu, hero/canvas, terminal, cards, relevant page composition and content | No production build, performance benchmark, or full accessibility audit |
| Portuguese routes | Browser navigation plus response-header checks for `/` and `/sobre` | Both returned self-redirects locally; Portuguese rendering could not be assessed |

The local Portuguese homepage returned `307` with `Location: /`; `/sobre` returned `307` with `Location: /sobre`. English `/en` and `/en/parceiros` loaded. Treat this as a verified local routing defect requiring investigation; its cause and production behavior are unverified.

### Evidence worth reviewing first

**Desktop identity:** the hero already provides a recognizable brand signature.

![Current desktop homepage](/Users/otavioprestes/Desktop/Claude/FGVQuant/docs/reviews/assets/2026-10-10/home-desktop.jpg)

**Partnership first impression:** the first screen leads into an unconfirmed partner section. The partnership action starts at approximately **y = 1,463 px** on desktop and **y = 1,903 px** at 390 px width, measured from the document top.

![Current partnership page](/Users/otavioprestes/Desktop/Claude/FGVQuant/docs/reviews/assets/2026-10-10/partners-desktop.jpg)

**Repeated decorative covers:** large gradient rectangles provide little information that distinguishes newsletter issues.

![Newsletter presentation on the homepage](/Users/otavioprestes/Desktop/Claude/FGVQuant/docs/reviews/assets/2026-10-10/home-newsletter-desktop.jpg)

**Responsive defects:** at 1024 px, the bull's left horn reaches into the headline area. At 320 px, the English partnership button extends to x ≈ 363 px and creates horizontal overflow.

![Hero at 1024 pixels](/Users/otavioprestes/Desktop/Claude/FGVQuant/docs/reviews/assets/2026-10-10/home-1024.jpg)

![Partnership button clipped at 320 pixels](/Users/otavioprestes/Desktop/Claude/FGVQuant/docs/reviews/assets/2026-10-10/partners-button-320.jpg)

## Design directions to consider

| Direction | Character and scope | Trade-off |
| --- | --- | --- |
| **A — Refine the current treatment** | Repair responsive defects, tune spacing, improve covers and empty states | Smallest intervention; leaves the current recruitment-led structure largely intact |
| **B — Editorial research identity — recommended** | Preserve the brand; add a direct partnership path, elevate evidence, vary section layouts, restrain glow and motion | Moderate layout and copy work; best alignment with the chosen audience |
| **C — Light-first institutional publication** | Make a light editorial presentation the default, using purple as a strong accent | Larger change to the approved dark-first direction; warrants separate mockups before choosing |

Direction B can be delivered incrementally. The existing light theme remains valuable as an alternate reading experience.

## Prioritized proposals

Effort is indicative implementation time for one developer after the direction is accepted, including focused verification: **S = a few hours; M = roughly 1–2 working days; L = roughly 3–5 working days**. Shared work overlaps, so these estimates should not be summed mechanically. Asset collection and league decisions are additional dependencies.

### F0 — Restore Portuguese route access before final visual sign-off

**Evidence:** the self-redirects described above prevent review of the default language.

**Action:** investigate locale rewriting and redirects, then validate direct entry, refresh, and PT/EN switching on all public routes. Preserve the intended unprefixed Portuguese URLs and `/en` English URLs.

**Files:** [proxy.ts](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/proxy.ts), [routing.ts](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/i18n/routing.ts), [next.config.ts](/Users/otavioprestes/Desktop/Claude/FGVQuant/next.config.ts).

**Acceptance:** `/`, `/sobre`, and the remaining Portuguese pages render without a redirect cycle; English equivalents continue working. Read the installed Next.js proxy documentation before changing behavior. **Effort: investigation required; do not assume a CSS-level fix.**

### P1.1 — Put partnership intent in the first view

**Evidence:** the global filled button and homepage primary action both say “Join us.” The homepage secondary action opens the newsletter. Partners has no action in its intro, and the unconfirmed logo list precedes the offer.

**Action:** use “Explore partnerships / Conheça as parcerias” as the homepage primary action and “Explore our work / Conheça nosso trabalho” as the secondary action. Make “Partner with us / Seja parceiro” the prominent global action; keep recruitment easy to find in navigation. On Partners, put the offer and LinkedIn contact action in the intro, followed by collaboration formats and evidence. Place the partner roster later.

Use the existing LinkedIn destination until an official email is supplied. Candidate copy is a proposal for league review, particularly any statements about what sponsors receive.

**Files:** [Home](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/app/[locale]/page.tsx), [Partners](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/app/[locale]/parceiros/page.tsx), [header](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/components/layout/site-header.tsx), [mobile navigation](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/components/layout/mobile-nav.tsx), PT/EN messages and navigation configuration.

**Acceptance:** Home and Partners each show a clearly labeled partnership action in the first viewport at 1280 × 720 and 390 × 844. A visitor reaches a usable contact channel within two link activations from Home. Recruitment remains discoverable. **Effort: M.**

### P1.2 — Repair responsive composition

**Evidence:** the 1024 px hero collision and 320 px button overflow are visible above. The shared button primitive uses `shrink-0`, `whitespace-nowrap`, and a fixed height. On the 390 px homepage, the heading starts around y = 327 px; the faint bull occupies much of the space above it.

**Action:** give hero text and artwork separate layout regions at intermediate widths; narrow the copy column or retain a stacked treatment until there is enough room. On phones, test a compact bull above the copy, approximately 112–144 px tall, with 32–48 px of separation. Make long buttons wrap with an automatic height and a 48 px minimum height. Keep the full label accessible. Retain a short mobile “Illustrative simulation” caption: the current detailed caption is hidden below 640 px.

**Files:** [hero layout](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/components/hero/monte-carlo-hero.tsx), [canvas layout](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/components/hero/monte-carlo-canvas.tsx), [buttons](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/components/ui/button.tsx).

**Acceptance:** no text/artwork collisions or page-wide horizontal scrolling at 320, 390, 768, 1024, and 1280 px in both languages. The mobile primary action remains in the initial 844 px-high viewport. Target the mobile headline starting above y = 260 px as a design goal, allowing content to grow with text zoom. **Effort: M.**

### P1.3 — Make incomplete content feel intentionally designed

**Evidence:** Team uses four large question-mark portrait placeholders. Partners opens with a prominent pending block; contact email is also pending. These states are honest, but their scale makes incompleteness central to the presentation.

**Action:** retain clear pending disclosures while replacing the empty portrait gallery with a compact leadership structure until actual names and portraits are available. On Partners, use a compact roster-pending note after the offer. Give the working LinkedIn channel visual priority in the contact area. Once supplied, use consistent 4:5 portraits, crop positions, and color treatment.

**Files:** [Team](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/app/[locale]/time/page.tsx), [member cards](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/components/cards/member-card.tsx), Partners, shared footer, and the existing content files.

**Acceptance:** pending states remain explicit; no invented people, affiliations, photos, endorsements, or email addresses. Portraits and logos appear only after the existing consent/permission requirements are satisfied. **Effort: S–M; real assets depend on the league.**

![Current team placeholders](/Users/otavioprestes/Desktop/Claude/FGVQuant/docs/reviews/assets/2026-10-10/team-desktop.jpg)

### P1.4 — Give publications an editorial identity

**Evidence:** the homepage and archive instantiate newsletter cards without covers or issue numbers, producing repeated empty gradient panels. The archive also places five format-explanation cards ahead of the latest issue.

**Action:** develop a cover system using the existing edition date and a confirmed topic: large month/year typography, a small series label, and one restrained topic graphic. Use approved covers when available. Keep a distinctive cover for the featured issue; use compact text-led rows for older issues. Move the format explanation below the latest publication. Show “Summary / Resumo” and “Portuguese / Português” consistently where appropriate; the homepage currently says “Read summary,” while the archive says “Read issue.”

**Files:** [newsletter cards](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/components/cards/newsletter-card.tsx), [archive page](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/app/[locale]/newsletter/page.tsx), [archive component](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/app/[locale]/newsletter/_components/issue-archive.tsx), Home and PT/EN newsletter messages.

**Acceptance:** issues are distinguishable without reading the full title; no large empty covers; no invented issue numbering; summary/full status matches the underlying content. Retain the Portuguese-only publishing policy. **Effort: M.**

### P2.1 — Establish stronger hierarchy through typography and surfaces

**Evidence:** many sections repeat the same eyebrow, large serif heading, italic gradient emphasis, rounded container, and generous vertical padding. Labels and footnotes sometimes use 10–11 px type. The overall page rhythm becomes repetitive despite individually attractive components.

**Action:** retain Lora for major headings, with restrained italic emphasis at major moments. Use Geist Sans for routine card headings and longer explanatory text. Start with body 16–18 px / 1.55–1.7 line height, card titles 20–24 px, metadata 12–13 px, and readable paragraphs around 60–70 characters wide. Establish section-spacing tokens around 64–96 px on desktop and 40–64 px on mobile. Use solid surfaces for reading and data, glass for a few signature elements, and lavender for actions and key emphasis. Test lower headline-glow opacity in a visual comparison.

These sizes are design starting points, not accessibility mandates. Sampled flat token pairs already have good contrast: muted text/background is approximately 8.96:1 in dark mode and 7.18:1 in light mode. This does not certify gradients, transparency, or every state. Stronger hierarchy follows the principles of scale, contrast, and grouping described by [Nielsen Norman Group](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/).

**Files:** [global tokens](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/app/globals.css), [section headings](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/components/ui/section-header.tsx), [page intros](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/components/layout/page-intro.tsx), shared cards.

**Acceptance:** one clear focal point per section, consistent spacing, readable metadata, and distinct interactive states in both themes. **Effort: M.**

### P2.2 — Bring evidence forward and vary the homepage rhythm

**Action:** use this proposed order: **identity and partnership action → compact evidence band → one achievement case study → research/publications → collaboration formats → people and activities → contact**. Reduce the prominence of simulated returns in the top-level evidence band; emphasize the league's work and learning outcomes instead. Keep fund labels and reporting dates wherever returns appear.

Feature the existing competition result with its self-reported qualifier, team context, and source links. Add authentic event or team photography when supplied and cleared. Avoid stock trading-floor imagery or synthetic “league photos.” Keep the interactive terminal, already selected in the design decisions, as a compact optional feature lower on Home or on About; make its introductory content immediately readable. Its current English boot sequence schedules roughly five seconds of typing and pauses before completion.

The use of clear collaboration categories and visible research outputs is a useful information pattern on [Two Sigma's academic partnerships page](https://www.twosigma.com/academic-partnerships/). Applying it here is a design inference; the league should keep its own scale and identity.

**Files:** Home, [terminal](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/components/terminal/terminal-panel.tsx), competition/event data, relevant shared sections.

**Acceptance:** a visitor can identify one sourced achievement, one publication, and the partnership action in a short scan. Claims retain qualifiers; unavailable photography does not block the text-led layout. **Effort: M–L; photos require league inputs.**

### P2.3 — Make motion and data reinforce precision

**Evidence:** numerical values visibly count through intermediate numbers as they enter view. The hero finishes assembling after about 3.8 seconds, then continues node twinkling; reduced-motion and offscreen handling already exist. The two-month return chart has direct value labels and a screen-reader table, but little visible scale context.

**Action:** show final factual numbers immediately, particularly fund returns; use a short opacity reveal if desired. Let the hero settle completely after its introduction, or provide a user motion control if continuing movement is retained. Preserve the static reduced-motion treatment. Keep the terminal usable without waiting for typing. For Capital, add a visible zero label, percentage scale/context, explicit reporting coverage, and a compact visible data table. Keep cumulative and monthly returns clearly distinct. Never interpolate missing months.

W3C describes when automatically moving content needs a [pause, stop, or hide mechanism](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide). The decorative canvas needs a specific conformance assessment; this review does not declare it a violation. The currently permission-filtered partner marquee already has a pause control in its source.

**Files:** [number ticker](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/components/data/number-ticker.tsx), hero canvas, terminal, [monthly chart](/Users/otavioprestes/Desktop/Claude/FGVQuant/src/app/[locale]/capital/_components/monthly-bars.tsx), Capital page.

**Acceptance:** facts display at their final values on entry; motion never delays reading or navigation; the graphic works statically; the chart remains honest about its two reported months. **Effort: M.**

![Capital in the existing light theme](/Users/otavioprestes/Desktop/Claude/FGVQuant/docs/reviews/assets/2026-10-10/capital-light-desktop.jpg)

## Suggested implementation sequence

1. **Baseline:** resolve F0 and capture Portuguese reference screenshots. Reproduce the 320 px overflow and 1024 px collision before fixing them.
2. **First visual increment:** implement P1.1–P1.3 and the shared spacing/type foundations. Review Home and Partners at desktop and phone widths before propagating the treatment.
3. **Publication and proof increment:** implement P1.4 and P2.2. A text-led version can ship for review while authorized photos and portraits are collected.
4. **Precision pass:** complete P2.3, then verify light theme, mobile menu, keyboard states, and long bilingual labels across the public site.

Start with **F0, P1.1, P1.2, and P1.4** if selecting a smaller package. They address access, sponsor discoverability, visible responsive defects, and the clearest source of visual repetition.

## Acceptance checklist for the chosen proposals

- Capture the same public pages in PT and EN at 320, 390, 768, 1024, and 1280 px; test a larger desktop width as a final spot check.
- Confirm no page-wide horizontal overflow, text/artwork collisions, clipped button labels, or sticky-header obstruction. Include text zoom and [320 CSS pixel reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
- Check normal text at least 4.5:1 and qualifying large text at least 3:1 on the actual rendered backgrounds, per [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).
- Use 44–48 px touch controls as a comfort target. WCAG 2.2 AA's [target-size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) is 24 × 24 CSS pixels with stated exceptions; the current 36 px menu buttons are not automatically a failure.
- Verify keyboard focus, menu open/close and focus return, locale switching, newsletter filtering, reduced motion, and light-theme reading surfaces.
- Retain simulated-fund labels, source/date context, explicit pending states, partner permissions, and publication rights.
- After source changes, run the repository's lint, typecheck, message-parity check, and production build; repeat visual checks on the local production preview. These checks were not run for this review because website source was unchanged.

## Decisions for your review

Choose A, B, or C as the visual direction; identify the proposal IDs you want included or deferred; and decide whether partner-first messaging should apply throughout the shared header or only to Home and Partners. Direction B with the four-item starting package above is my recommendation.
