import {
  areas,
  competitions,
  events,
  fund,
  newsletter,
  newsletterLinks,
  partners,
  projects,
  quantConnect,
  site,
  strategies,
  team,
  teamGroups,
  testimonials,
  type Event,
  type NewsletterIssue,
} from "#site/content";
import { cacheLife } from "next/cache";
import type { Locale } from "@/i18n/routing";
import type { TimelineItem } from "@/components/sections/drift-timeline";

/**
 * Typed accessors over the Velite content layer (content/ → .velite/).
 * Pages read content only through these helpers so sorting/localisation stay consistent.
 */

export type Localized = { pt: string; en: string };
export const tr = (value: Localized, locale: Locale) => value[locale];

/** BCP-47 tag used for Intl formatting. */
export const intlLocale = (locale: Locale) => (locale === "pt" ? "pt-BR" : "en-US");

/** Content dates are calendar dates: format in UTC so they never shift a day. */
function fmt(iso: string, locale: Locale, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(intlLocale(locale), { timeZone: "UTC", ...opts }).format(
    new Date(iso),
  );
}

const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);

/** "2026-09" → "Setembro de 2026" / "September 2026" */
export function formatEdition(edition: string, locale: Locale) {
  return capitalize(formatEditionInline(edition, locale));
}

/** Same as `formatEdition` but in the locale's own case, for use mid-sentence ("até agosto de 2026"). */
export function formatEditionInline(edition: string, locale: Locale) {
  return fmt(`${edition}-01`, locale, { month: "long", year: "numeric" });
}

/** Month name and year apart, for typographic covers: "2026-09" → { month: "Setembro", year: "2026" }. */
export function formatEditionParts(edition: string, locale: Locale) {
  const parts = new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: "UTC",
    month: "long",
    year: "numeric",
  }).formatToParts(new Date(`${edition}-01`));
  return {
    month: capitalize(parts.find((p) => p.type === "month")?.value ?? ""),
    year: parts.find((p) => p.type === "year")?.value ?? "",
  };
}

/** Short label for cards, e.g. "Set 2026" / "Sep 2026" (short month without trailing "." + year). */
export function formatEditionShort(edition: string, locale: Locale) {
  const parts = new Intl.DateTimeFormat(intlLocale(locale), {
    timeZone: "UTC",
    month: "short",
    year: "numeric",
  }).formatToParts(new Date(`${edition}-01`));
  const month = (parts.find((p) => p.type === "month")?.value ?? "").replace(/\.$/, "");
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  return `${capitalize(month)} ${year}`.trim();
}

/** Event date honouring its precision (never shows a day we don't actually know). */
export function formatEventDate(event: Event, locale: Locale) {
  switch (event.datePrecision) {
    case "day":
      return fmt(event.date, locale, { day: "numeric", month: "short", year: "numeric" });
    case "month":
      return capitalize(
        fmt(event.date, locale, { month: "short", year: "numeric" }).replace(".", ""),
      );
    case "semester":
      return event.period;
    case "year":
      return fmt(event.date, locale, { year: "numeric" });
  }
}

// ── Newsletter ────────────────────────────────────────────────────────────────

export type Issue = Omit<NewsletterIssue, "body" | "path"> & {
  /** our summary's MDX; absent until it is written */
  body?: string;
  /** the published issue (LinkedIn or Substack), from the sheet */
  url: string;
};

/**
 * All issues, newest edition first: one per row of the sheet's Newsletter tab, with our summary from
 * the sheet (or content/newsletter/) when it exists. Without one, the issue still lists, as "resumo em breve".
 */
export function getIssues(): Issue[] {
  return newsletterLinks
    .map(({ edition, url, issue }): Issue => {
      // the sheet's summary (content/sheet/newsletter/) wins over a hand-written one, keeping the
      // hand-written cover figure and featured flag, which the sheet doesn't hold
      const sheet = newsletter.find((i) => i.edition === edition && i.path.startsWith("sheet/"));
      const hand = newsletter.find((i) => i.edition === edition && !i.path.startsWith("sheet/"));
      const summary = sheet
        ? { ...sheet, figure: hand?.figure, featured: hand?.featured ?? false }
        : hand;
      if (summary) return { ...summary, url, issue: issue ?? summary.issue };
      const title = formatEdition(edition, "pt");
      const month = title.split(" ")[0].normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
      return {
        title: `FGV Quant Insights: ${title}`,
        edition,
        issue,
        excerpt: "Resumo em breve.",
        tags: [],
        status: "summary",
        featured: false,
        // same slug the summary file will get (2026-10-outubro.mdx), so the link survives it
        slug: `${edition}-${month}`,
        url,
      };
    })
    .sort((a, b) => b.edition.localeCompare(a.edition));
}

export function getIssue(slug: string) {
  return getIssues().find((i) => i.slug === slug);
}

export function getFeaturedIssue() {
  return getIssues().find((i) => i.featured) ?? getIssues()[0];
}

// ── Team, areas, partners, competitions ─────────────────────────────────────────

export const getTeam = () => [...team].sort((a, b) => a.order - b.order);

/**
 * Today's academic term as [year, 1 | 2] (Jan–Jun = 1, Jul–Dec = 2). Cached for a day, so a
 * prerendered page picks up the new term on its own, without a redeploy.
 */
export async function currentTerm(): Promise<[number, 1 | 2]> {
  "use cache";
  cacheLife("days");
  const now = new Date();
  return [now.getUTCFullYear(), now.getUTCMonth() < 6 ? 1 : 2];
}

/** Semester a member is in now: entered "2024.1" → 2026.2 is the 6th. Undefined if not started. */
export function currentSemester(enrolled: string | undefined, [year, half]: [number, 1 | 2]) {
  if (!enrolled) return undefined;
  const [y, h] = enrolled.split(".").map(Number);
  const n = (year - y) * 2 + (half - h) + 1;
  return n >= 1 ? n : undefined;
}

/** Testimonials in display order, with the referenced team member (name, photo) resolved. */
export const getTestimonials = () =>
  [...testimonials]
    .sort((a, b) => a.order - b.order)
    .map((t) => ({ ...t, person: t.member ? team.find((m) => m.id === t.member) : undefined }));

/** Team groups in display order, each with its members (members sorted by `order`). */
export const getTeamGroups = () =>
  [...teamGroups]
    .sort((a, b) => a.order - b.order)
    .map((g) => ({ ...g, members: getTeam().filter((m) => m.group === g.id) }));
export const getAreas = () => [...areas].sort((a, b) => a.order - b.order);
export const getCompetitions = () => [...competitions].sort((a, b) => b.year - a.year);

/** Projects, newest semester first. */
export const getProjects = () => [...projects].sort((a, b) => b.period.localeCompare(a.period));

/** Partners; by default only those whose name/logo the league has cleared for publication. */
export function getPartners({ includeUnconfirmed = false } = {}) {
  return partners.filter((p) => includeUnconfirmed || p.permission);
}

// ── Events ────────────────────────────────────────────────────────────────────

/** Events in chronological order. */
export const getEvents = () => [...events].sort((a, b) => a.date.localeCompare(b.date));

/** Map events to the DriftTimeline component's item shape. */
export function toTimelineItems(list: Event[], locale: Locale): TimelineItem[] {
  return list.map((e) => ({
    id: e.id,
    date: e.date.slice(0, 10),
    dateLabel: formatEventDate(e, locale),
    period: e.period,
    kind: e.kind,
    title: tr(e.title, locale),
    description: e.description ? tr(e.description, locale) : undefined,
    href: e.href,
  }));
}

// ── Fund & site ───────────────────────────────────────────────────────────────

export const getFund = () => fund;

/** Daily preview written by fgvquant/FGV-Quant-Capital's GitHub Action (diario/rodar.py). */
export type FundDaily = {
  asOf: string;
  generatedAt: string;
  source: { official: string; preview: string[]; prices: string; cdi: string };
  pairsCarryOver: boolean;
  /** initial AUM in BRL (ETL_05's INITIAL_AUM_BRL); the NAV starts at 1.00 */
  initialAum?: number | null;
  /**
   * One per *_Acc column of the History_Master: fund first, then each strategy, cdi last. A new
   * strategy in the fund's code shows up here (and in the chart) with no change to the site.
   */
  series: { id: string; label: string }[];
  /** cumulative factors (1 = inception), one key per series id; `preview` marks days after the last official month */
  daily: FundDailyPoint[];
  /** fractions (0.012 = 1.2%), by series id */
  metrics: Record<
    string,
    {
      mtd: number | null;
      itd: number | null;
      volatility: number | null;
      sharpe: number | null;
      maxDrawdown: number | null;
    }
  >;
  /** Pairs and Momentum details; absent if the notebooks stop defining them */
  pairs?: {
    open: {
      pair: string;
      long: string;
      short: string;
      since: string;
      entryZ: number | null;
      z: number | null;
    }[];
    closed: {
      pair: string;
      long: string;
      short: string;
      entry: string;
      exit: string;
      return: number | null;
    }[];
  };
  momentum?: { long: string[]; short: string[] };
};
export type FundDailyPoint = {
  date: string;
  preview: boolean;
  [series: string]: number | string | boolean;
};

/**
 * The fund repo is private: read the JSON through the GitHub API with a read-only token
 * (QUANT_CAPITAL_TOKEN). FUND_DAILY_FILE reads a local copy instead, for localhost checks.
 * No token, a failed fetch or a malformed file → null, and the page hides the preview.
 */
export async function getFundDaily(): Promise<FundDaily | null> {
  "use cache";
  cacheLife("hours");
  try {
    let data: FundDaily;
    if (process.env.FUND_DAILY_FILE) {
      const { readFile } = await import("node:fs/promises");
      data = JSON.parse(await readFile(process.env.FUND_DAILY_FILE, "utf8"));
    } else if (process.env.QUANT_CAPITAL_TOKEN) {
      const res = await fetch(
        // pinned to main: other branches of the fund repo are not production and never reach the site
        "https://api.github.com/repos/fgvquant/FGV-Quant-Capital/contents/publico/fund-daily.json?ref=main",
        {
          headers: {
            Accept: "application/vnd.github.raw+json",
            Authorization: `Bearer ${process.env.QUANT_CAPITAL_TOKEN}`,
            "X-GitHub-Api-Version": "2022-11-28",
          },
        },
      );
      if (!res.ok) return null;
      data = await res.json();
    } else return null;
    // files written before `series` existed carried these four
    data.series ??= ["Fund", "Pairs", "Momentum", "CDI"].map((l) => ({
      id: l.toLowerCase(),
      label: l,
    }));
    const ids = data.series.map((s) => s.id);
    return data.daily?.length && data.metrics?.fund && ids.includes("fund") && ids.includes("cdi")
      ? data
      : null;
  } catch {
    return null;
  }
}
/** Strategies the fund runs now, in sheet order. */
export const getStrategies = () =>
  strategies.filter((x) => x.status === "active").sort((a, b) => a.order - b.order);
export const getSite = () => site;

/** Quant Connect, editions newest first. */
export const getQuantConnect = () => ({
  ...quantConnect,
  editions: [...quantConnect.editions].sort((a, b) => b.year - a.year),
});

/** Headline numbers for the KPI strip — derived from content, never hardcoded. */
export function getStats() {
  return {
    members: site.members,
    issues: newsletterLinks.length,
    /** only teams flagged `ranked` (podium / top-10 placements) are counted */
    rankedTeams: competitions.reduce((n, c) => n + c.teams.filter((t) => t.ranked).length, 0),
    fundCumulative: fund.cumulativeReturn,
    fundAsOf: fund.cumulativeAsOf,
  };
}
