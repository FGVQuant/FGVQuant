"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { NewsletterCard } from "@/components/cards/newsletter-card";
import { cn } from "@/lib/utils";
import type { IssueCardData } from "../_lib/issues";

type Props = {
  issues: IssueCardData[];
  tags: string[];
  labels: { filter: string; all: string; empty: string; read: string };
};

/** Archive grid with in-place tag filtering (no URL change, keeps the page static). */
export function IssueArchive({ issues, tags, labels }: Props) {
  const t = useTranslations("Newsletter.archive");
  const [active, setActive] = useState<string | null>(null);
  const visible = active ? issues.filter((i) => i.tags.includes(active)) : issues;

  const chip = (selected: boolean) =>
    cn(
      "inline-flex h-9 items-center rounded-full border px-4 text-sm transition-colors",
      selected
        ? "border-highlight/50 bg-highlight/10 text-highlight"
        : "border-border-strong text-muted-foreground hover:bg-accent hover:text-foreground",
    );

  return (
    <div>
      {tags.length > 0 ? (
        <div role="group" aria-label={labels.filter} className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={active === null}
            className={chip(active === null)}
            onClick={() => setActive(null)}
          >
            {labels.all}
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={active === tag}
              className={chip(active === tag)}
              onClick={() => setActive(active === tag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}

      <p aria-live="polite" role="status" className="sr-only">
        {visible.length > 0 ? t("results", { count: visible.length }) : labels.empty}
      </p>

      {visible.length > 0 ? (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((issue) => (
            <li key={issue.slug} className="flex">
              <NewsletterCard
                className="w-full"
                href={`/newsletter/${issue.slug}`}
                title={issue.title}
                dateLabel={issue.dateLabel}
                excerpt={issue.excerpt}
                tags={issue.tags}
                readLabel={labels.read}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-muted-foreground">{labels.empty}</p>
      )}
    </div>
  );
}
