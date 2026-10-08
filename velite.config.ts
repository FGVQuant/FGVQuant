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
    role: localized,
    area: s.string().optional(),
    /** local image under content/ (e.g. "./photos/ana.jpg") → { src, width, height, blurDataURL } */
    photo: s.image().optional(),
    linkedin: s.string().url().optional(),
    order: s.number().default(100),
    /** true until the league confirms name/role and consent to publish */
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
          strategy: s.string().optional(),
          members: s.array(s.string()).default([]),
          /** true for placed/ranked results (podium, top-10); counted in the KPI strip */
          ranked: s.boolean().default(false),
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
    methodology: localized.optional(),
    source: s.string().url().optional(),
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
  collections: { newsletter, team, areas, events, competitions, partners, fund, site, devSamples },
  mdx: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});
