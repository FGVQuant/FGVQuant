import { formatEditionParts, formatEditionShort, getIssues } from "@/lib/content";
import type { Locale } from "@/i18n/routing";

export type IssueCardData = {
  slug: string;
  title: string;
  dateLabel: string;
  /** Cover typography: month name and year in the page locale. */
  month: string;
  year: string;
  /** "summary" | "full": drives the status and CTA labels. */
  status: "summary" | "full";
  excerpt: string;
  tags: string[];
};

/** Serializable card data (safe to pass to client components). */
export function toCardData(issue: ReturnType<typeof getIssues>[number], locale: Locale) {
  const { month, year } = formatEditionParts(issue.edition, locale);
  return {
    slug: issue.slug,
    title: issue.title,
    dateLabel: formatEditionShort(issue.edition, locale),
    month,
    year,
    status: issue.status,
    excerpt: issue.excerpt,
    tags: issue.tags,
  } satisfies IssueCardData;
}
