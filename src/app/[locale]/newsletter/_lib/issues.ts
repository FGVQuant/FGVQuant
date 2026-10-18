import { formatEditionParts, formatEditionShort, getIssues } from "@/lib/content";
import type { Locale } from "@/i18n/routing";
import type { IssueFigureKind } from "@/components/cards/issue-figure";

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
  /** League semester, "2026.1": January to July is .1, August to December .2. */
  semester: string;
  /** Topic figure for the cover and archive row, when the issue's topic is known. */
  figure?: IssueFigureKind;
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
    semester: `${issue.edition.slice(0, 4)}.${Number(issue.edition.slice(5)) <= 7 ? 1 : 2}`,
    figure: issue.figure,
  } satisfies IssueCardData;
}
