import { defineCollection, defineConfig, s } from "velite";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

/**
 * Content layer. Everything under `content/` is validated here and emitted to `.velite/`
 * (import via `#site/content`). Rules:
 *  - Never invent facts. Unknown values use `placeholder: true` (rendered as "a confirmar"/"TBD").
 *  - Bilingual copy uses `{ pt, en }`; the newsletter is PT-only by design.
 *  - FGV Quant Capital is a SIMULATED fund ("Fundo Fictício") — pages must say so.
 */

const localized = s.object({ pt: s.string(), en: s.string() });

const newsletter = defineCollection({
  name: "NewsletterIssue",
  pattern: "newsletter/*.mdx",
  schema: s
    .object({
      title: s.string().max(140),
      /** month the issue covers, e.g. "2026-09" */
      edition: s.string().regex(/^\d{4}-\d{2}$/),
      date: s.isodate().optional(),
      issue: s.number().int().positive().optional(),
      /** our own short summary (PT) — shown on cards and while the full text is pending */
      excerpt: s.string().max(400),
      tags: s.array(s.string()).default([]),
      /** recurring sections covered in this edition */
      personality: s.string().optional(),
      linkedinUrl: s.string().url(),
      /**
       * "summary": only metadata + our summary is published (default until the league
       * provides the issue text and permission). "full": the MDX body is the full issue.
       */
      status: s.enum(["summary", "full"]).default("summary"),
      featured: s.boolean().default(false),
      /**
       * Topic figure on the cover (src/components/cards/issue-figure.tsx). Illustrative, drawn from
       * formulas or seeded simulations; set only when the issue's topic is known.
       */
      figure: s
        .enum(["tail-risk", "straddle", "prediction-spread", "alt-data", "factors"])
        .optional(),
      path: s.path(),
      body: s.mdx(),
    })
    .transform((d) => ({ ...d, slug: d.path.replace(/^newsletter\//, "") })),
});

const team = defineCollection({
  name: "Member",
  pattern: "team/members.json",
  schema: s.object({
    id: s.string(),
    name: s.string(),
    /** optional for area teams and trainees, where the group already says what they do */
    role: localized.optional(),
    /** id from content/team/groups.json (presidency, an area team or a trainee cohort) */
    group: s.string(),
    /** the director who leads this area team; shown at the top of the team card */
    lead: s.boolean().default(false),
    area: s.string().optional(),
    /** local image under content/ (e.g. "./photos/ana.jpg") → { src, width, height, blurDataURL } */
    photo: s.image().optional(),
    linkedin: s.string().url().optional(),
    order: s.number().default(100),
    /** true until the league confirms name/role and consent to publish */
    placeholder: s.boolean().default(false),
  }),
});

/** How the team is split on Sobre: board, area teams, trainee cohorts. Add a cohort here, not in code. */
const teamGroups = defineCollection({
  name: "TeamGroup",
  pattern: "team/groups.json",
  schema: s.object({
    id: s.string(),
    title: localized,
    order: s.number(),
    /** featured groups (the presidency) render as large portrait cards; the rest as team cards */
    featured: s.boolean().default(false),
    /** list groups that take a full row (trainee cohorts); large groups go full width anyway */
    wide: s.boolean().default(false),
  }),
});

/**
 * Members' accounts of their time in the league, shown on Sobre. Written by the members
 * themselves; never paraphrased or invented. `member` (an id from team/members.json) reuses
 * that person's name and photo. `en` is optional: without it the PT text shows on /en too.
 */
const testimonials = defineCollection({
  name: "Testimonial",
  pattern: "testimonials.json",
  schema: s.object({
    id: s.string(),
    quote: s.object({ pt: s.string(), en: s.string().optional() }).optional(),
    member: s.string().optional(),
    /** used when the person is not on the current team (alumni) */
    name: s.string().optional(),
    /** e.g. "Trainee 2025.1, hoje na Equipe Acadêmica" */
    context: localized.optional(),
    order: s.number(),
    /** true until the league sends the text and the person's consent */
    placeholder: s.boolean().default(false),
  }),
});

const areas = defineCollection({
  name: "Area",
  pattern: "areas.json",
  schema: s.object({
    id: s.string(),
    title: localized,
    description: localized,
    order: s.number().default(100),
  }),
});

const events = defineCollection({
  name: "Event",
  pattern: "events.json",
  schema: s.object({
    id: s.string(),
    date: s.isodate(),
    /** precision of `date`: some events are only known to the month/year */
    datePrecision: s.enum(["day", "month", "semester", "year"]).default("day"),
    period: s.string(),
    kind: s.enum(["event", "competition", "class", "visit", "milestone"]),
    title: localized,
    description: localized.optional(),
    location: s.string().optional(),
    href: s.string().optional(),
    partners: s.array(s.string()).default([]),
    source: s.string().url().optional(),
    /** cropped from the league's own Instagram posts (content/events/photos/) */
    photo: s.image().optional(),
  }),
});

/** Research, fund and trainee projects (from the league's own posts). No page yet. */
const projects = defineCollection({
  name: "Project",
  pattern: "projects.json",
  schema: s.object({
    id: s.string(),
    /** semester, e.g. "2025.2" */
    period: s.string(),
    kind: s.enum(["research", "fund", "trainee"]),
    title: localized,
    summary: localized,
    members: s.array(s.string()).default([]),
    /** topic figure (src/components/cards/issue-figure.tsx); illustrative, never the project's data */
    figure: s
      .enum([
        "pairs",
        "regimes",
        "momentum",
        "clusters",
        "deciles",
        "rates",
        "event-study",
        "vwap",
        "fund",
        "ongoing",
        "straddle",
        "factors",
      ])
      .optional(),
    /** team lead (one of `members`), shown first and marked */
    lead: s.string().optional(),
    partner: s.string().optional(),
    mentor: s.string().optional(),
    /** e.g. a trainee-cycle award */
    award: localized.optional(),
    /** a public write-up (LinkedIn post, paper) */
    link: s.string().url().optional(),
    /** the project's paper, a PDF under public/papers/ (e.g. "/papers/x.pdf"), offered as a download */
    paper: s.string().optional(),
    /** internal page, e.g. "/capital" */
    href: s.string().optional(),
    /** "in-progress" for the current semester's projects */
    status: s.enum(["done", "in-progress"]).default("done"),
    /** true until the league confirms the project and its members */
    placeholder: s.boolean().default(false),
  }),
});

const competitions = defineCollection({
  name: "Competition",
  pattern: "competitions.json",
  schema: s.object({
    id: s.string(),
    name: s.string(),
    organizer: s.string(),
    year: s.number().int(),
    summary: localized,
    teams: s
      .array(
        s.object({
          name: s.string(),
          result: localized,
          strategy: localized.optional(),
          members: s.array(s.string()).default([]),
          /** true for placed/ranked results (podium, top-10); counted in the KPI strip */
          ranked: s.boolean().default(false),
          /** false for teams that competed outside the league (e.g. former members) */
          official: s.boolean().default(true),
        }),
      )
      .default([]),
    source: s.string().url().optional(),
    /** true while the result comes only from the league's own posts */
    selfReported: s.boolean().default(true),
  }),
});

const partners = defineCollection({
  name: "Partner",
  pattern: "partners.json",
  schema: s.object({
    id: s.string(),
    name: s.string(),
    relation: localized,
    url: s.string().url().optional(),
    logo: s.string().optional(),
    /** logos/names are shown only once the league confirms permission */
    permission: s.boolean().default(false),
  }),
});

const fund = defineCollection({
  name: "Fund",
  pattern: "fund.json",
  single: true,
  schema: s.object({
    name: s.string(),
    simulated: s.literal(true),
    inception: s
      .string()
      .regex(/^\d{4}-\d{2}$/)
      .optional(),
    /** cumulative return since inception, in % (as last reported) */
    cumulativeReturn: s.number(),
    cumulativeAsOf: s.string().regex(/^\d{4}-\d{2}$/),
    /** monthly returns in %, only months actually reported by the league */
    monthly: s.array(s.object({ month: s.string().regex(/^\d{4}-\d{2}$/), return: s.number() })),
    /**
     * "Panorama geral" from the latest monthly management report, since inception and as of
     * `cumulativeAsOf`. All figures in % except sharpe, correlation and month counts.
     */
    overview: s
      .object({
        benchmark: s.string(),
        benchmarkReturn: s.number(),
        /** correlation between the two strategies' returns */
        correlation: s.number(),
        rows: s.array(
          s.object({
            id: s.enum(["pairs", "momentum", "fund", "benchmark"]),
            totalReturn: s.number(),
            volatility: s.number().optional(),
            sharpe: s.number().optional(),
            maxDrawdown: s.number().optional(),
            positiveMonths: s.number().int(),
            negativeMonths: s.number().int(),
            monthsAboveBenchmark: s.number().int().optional(),
            monthsBelowBenchmark: s.number().int().optional(),
            bestMonth: s.number(),
            worstMonth: s.number(),
          }),
        ),
      })
      .optional(),
    methodology: localized.optional(),
    source: s.string().url().optional(),
  }),
});

/** The Quant Connect, the event FGV Quant co-organizes; featured on /eventos. Sourced facts only. */
const quantConnect = defineCollection({
  name: "QuantConnect",
  pattern: "quant-connect.json",
  single: true,
  schema: s.object({
    name: s.string(),
    description: localized,
    organizers: s.array(s.string()),
    instagram: s.string().url(),
    linkedin: s.string().url(),
    photos: s
      .array(
        s.object({
          image: s.image(),
          alt: localized,
          /** CSS object-position for the cropped tile, e.g. "top" to keep faces and lose the bottom */
          position: s.string().optional(),
        }),
      )
      .default([]),
    editions: s.array(
      s.object({
        year: s.number().int(),
        number: s.number().int(),
        days: s
          .array(
            s.object({
              date: s.isodate(),
              venue: s.string(),
              area: s.string().optional(),
              /** the day's schedule, as the event published it */
              program: s
                .array(s.object({ time: s.string(), title: s.string(), by: s.string().optional() }))
                .default([]),
            }),
          )
          .default([]),
        hours: s.string().optional(),
        panels: s.number().int().optional(),
        themes: s.array(localized).default([]),
        /** partners the event announced publicly (names only, no logos) */
        partners: s.array(s.string()).default([]),
        source: s.string().url().optional(),
        partnersSource: s.string().url().optional(),
      }),
    ),
  }),
});

const site = defineCollection({
  name: "Site",
  pattern: "site.json",
  single: true,
  schema: s.object({
    founded: s.number().int(),
    members: s.number().int(),
    membersAsOf: s.string(),
    email: s.string().email().optional(),
    instagram: s.string().url(),
    linkedin: s.string().url(),
    newsletterUrl: s.string().url(),
    recruitment: s.object({
      open: s.boolean().optional(),
      formUrl: s.string().url().optional(),
      placeholder: s.boolean().default(true),
    }),
  }),
});

/** Dev-only MDX fixtures for /dev/content (prose + KaTeX check). Never linked in production. */
const devSamples = defineCollection({
  name: "DevSample",
  pattern: "_dev/*.mdx",
  schema: s.object({ title: s.string(), path: s.path(), body: s.mdx() }),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: {
    newsletter,
    team,
    teamGroups,
    testimonials,
    areas,
    events,
    competitions,
    projects,
    partners,
    fund,
    quantConnect,
    site,
    devSamples,
  },
  mdx: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
