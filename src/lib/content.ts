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
