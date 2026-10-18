import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { IssueFigure, type IssueFigureKind } from "@/components/cards/issue-figure";

type NewsletterRowProps = {
  href: string;
  title: string;
  dateLabel: string;
  excerpt?: string;
  tags?: string[];
  /** Topic figure shown above the date on sm+ (see issue-figure.tsx). */
  figure?: IssueFigureKind;
  /** "Resumo" / "Summary" / full-issue label, derived from the issue status. */
  statusLabel: string;
  /** "Português" / "In Portuguese"; pass only where the UI is not Portuguese. */
  languageLabel?: string;
};

/** Compact archive row: topic figure and date, title, excerpt, tags and status. */
export function NewsletterRow({
  href,
  title,
  dateLabel,
  excerpt,
  tags,
  figure,
  statusLabel,
  languageLabel,
}: NewsletterRowProps) {
  return (
    <article className="group relative grid gap-x-6 gap-y-2 rounded-2xl bg-card px-4 py-4 transition-colors hover:bg-secondary has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring sm:grid-cols-[6.5rem_1fr_auto] sm:items-start sm:px-5">
      <div className="sm:pt-1.5">
        {figure ? <IssueFigure kind={figure} className="mb-2 hidden w-full sm:block" /> : null}
        <p className="text-sm text-muted-foreground">{dateLabel}</p>
      </div>
      <div className="flex min-w-0 flex-col gap-2">
        <h3 className="font-sans text-lg leading-snug font-semibold tracking-tight text-balance text-foreground">
          <Link
            href={href}
            className="rounded-sm after:absolute after:inset-0 after:rounded-2xl after:content-['']"
          >
            {title}
          </Link>
        </h3>
        {excerpt ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
        ) : null}
        {tags && tags.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="Tags">
            {tags.map((tag) => (
              <li key={tag}>
                <Badge variant="outline">{tag}</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:pt-1">
        <Badge variant="highlight">{statusLabel}</Badge>
        {languageLabel ? <Badge variant="outline">{languageLabel}</Badge> : null}
        <ArrowRight
          aria-hidden
          className="size-4 text-highlight transition-[translate] duration-200 ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
        />
      </div>
    </article>
  );
}
