import {
  areas,
  competitions,
  events,
  fund,
  newsletter,
  partners,
  site,
  team,
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

const intlLocale = (locale: Locale) => (locale === "pt" ? "pt-BR" : "en-US");

/** Content dates are calendar dates: format in UTC so they never shift a day. */
function fmt(iso: string, locale: Locale, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(intlLocale(locale), { timeZone: "UTC", ...opts }).format(
    new Date(iso),
  );
}

const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);

/** "2026-09" → "Setembro de 2026" / "September 2026" */
export function formatEdition(edition: string, locale: Locale) {
  return capitalize(fmt(`${edition}-01`, locale, { month: "long", year: "numeric" }));
}

/** Short label for cards, e.g. "Set 2026" / "Sep 2026". */
export function formatEditionShort(edition: string, locale: Locale) {
  return capitalize(
    fmt(`${edition}-01`, locale, { month: "short", year: "numeric" }).replace(".", ""),
  );
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

/** All issues, newest edition first. */
export function getIssues(): NewsletterIssue[] {
  return [...newsletter].sort((a, b) => b.edition.localeCompare(a.edition));
}

export function getIssue(slug: string) {
  return newsletter.find((i) => i.slug === slug);
}

export function getFeaturedIssue() {
  return getIssues().find((i) => i.featured) ?? getIssues()[0];
}

export function getIssueTags() {
  return [...new Set(newsletter.flatMap((i) => i.tags))].sort((a, b) => a.localeCompare(b, "pt"));
}

// ── Team, areas, partners, competitions ─────────────────────────────────────────

export const getTeam = () => [...team].sort((a, b) => a.order - b.order);
export const getAreas = () => [...areas].sort((a, b) => a.order - b.order);
export const getCompetitions = () => [...competitions].sort((a, b) => b.year - a.year);

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
export const getSite = () => site;

/** Headline numbers for the KPI strip — derived from content, never hardcoded. */
export function getStats() {
  return {
    members: site.members,
    issues: newsletter.length,
    /** teams listed in competitions are ranked placements (e.g. top-10) */
    rankedTeams: competitions.reduce((n, c) => n + c.teams.length, 0),
    fundCumulative: fund.cumulativeReturn,
    fundAsOf: fund.cumulativeAsOf,
  };
}
