"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { NewsletterRow } from "@/components/cards/newsletter-row";
import { cn } from "@/lib/utils";
import type { IssueCardData } from "../_lib/issues";

type Props = {
  issues: IssueCardData[];
  /** newest first */
  semesters: string[];
  labels: { filter: string; all: string; empty: string };
};

/** Archive rows with in-place semester filtering (no URL change, keeps the page static). */
export function IssueArchive({ issues, semesters, labels }: Props) {
  const t = useTranslations("Newsletter.archive");
  const tn = useTranslations("Newsletter");
  const showLanguage = useLocale() === "en";
  const [active, setActive] = useState<string | null>(null);
  const visible = active ? issues.filter((i) => i.semester === active) : issues;

  const chip = (selected: boolean) =>
    cn(
      "pressable inline-flex h-9 items-center rounded-full border px-4 text-sm",
      selected
        ? "border-highlight/50 bg-highlight/10 text-highlight"
        : "border-border-strong text-muted-foreground hover:bg-accent hover:text-foreground",
    );

  return (
    <div>
      {semesters.length > 1 ? (
        <div role="group" aria-label={labels.filter} className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={active === null}
            className={chip(active === null)}
            onClick={() => setActive(null)}
          >
            {labels.all}
          </button>
          {semesters.map((semester) => (
            <button
              key={semester}
              type="button"
              aria-pressed={active === semester}
              className={chip(active === semester)}
              onClick={() => setActive(active === semester ? null : semester)}
            >
              {semester}
            </button>
          ))}
        </div>
      ) : null}

      <p aria-live="polite" role="status" className="sr-only">
        {visible.length > 0 ? t("results", { count: visible.length }) : labels.empty}
      </p>

      {visible.length > 0 ? (
        <ul className="mt-8 flex flex-col gap-3">
          {visible.map((issue) => (
            <li key={issue.slug}>
              <NewsletterRow
                href={`/newsletter/${issue.slug}`}
                title={issue.title}
                dateLabel={issue.dateLabel}
                excerpt={issue.excerpt}
                tags={issue.tags}
                figure={issue.figure}
                statusLabel={tn(`status.${issue.status}`)}
                languageLabel={showLanguage ? tn("language") : undefined}
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
