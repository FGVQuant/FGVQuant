import { formatEditionShort, getIssues } from "@/lib/content";
import type { Locale } from "@/i18n/routing";

export type IssueCardData = {
  slug: string;
  title: string;
  dateLabel: string;
  excerpt: string;
  tags: string[];
};

/** Serializable card data (safe to pass to client components). */
export function toCardData(issue: ReturnType<typeof getIssues>[number], locale: Locale) {
  return {
    slug: issue.slug,
    title: issue.title,
    dateLabel: formatEditionShort(issue.edition, locale),
    excerpt: issue.excerpt,
    tags: issue.tags,
  } satisfies IssueCardData;
}
