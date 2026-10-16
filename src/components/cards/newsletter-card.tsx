import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { IssueCover } from "@/components/cards/issue-cover";
import { cn } from "@/lib/utils";

type NewsletterCardProps = {
  href: string;
  title: string;
  dateLabel: string;
  /** e.g. "Edição #7" */
  issueLabel?: string;
  excerpt?: string;
  tags?: string[];
  cover?: { src: string; alt: string };
  /** Typographic cover text, used when no `cover` image is given. */
  coverText?: { month: string; year: string; series?: string; topic?: string };
  /** "Resumo" / "Summary" / full-issue label, derived from the issue status. */
  statusLabel?: string;
  /** "Português" / "In Portuguese"; pass only where the UI is not Portuguese. */
  languageLabel?: string;
  /** Larger horizontal layout on md+. */
  featured?: boolean;
  readLabel: string;
  className?: string;
};

/** Editorial newsletter card: cover image, or a typographic cover when none is given. */
export function NewsletterCard({
  href,
  title,
  dateLabel,
  issueLabel,
  excerpt,
  tags,
  cover,
  coverText,
  statusLabel,
  languageLabel,
  featured = false,
  readLabel,
  className,
}: NewsletterCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col gap-5 rounded-2xl bg-card p-4 transition-colors hover:bg-secondary",
        featured && "md:grid md:grid-cols-2 md:items-center md:gap-8 md:p-6",
        className,
      )}
    >
      {cover ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-secondary">
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes={featured ? "(min-width: 768px) 560px, 100vw" : "(min-width: 768px) 360px, 100vw"}
            className="object-cover transition-[scale] duration-500 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
          />
        </div>
      ) : (
        <IssueCover
          large={featured}
          month={coverText?.month ?? dateLabel}
          year={coverText?.year ?? ""}
          series={coverText?.series ?? "FGV Quant Insights"}
          topic={coverText?.topic ?? tags?.[0]}
        />
      )}

      <div className="flex flex-col gap-3">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
          <span>{dateLabel}</span>
          {issueLabel ? (
            <>
              <span aria-hidden className="size-1 rounded-full bg-highlight" />
              <span className="text-highlight">{issueLabel}</span>
            </>
          ) : null}
          {statusLabel ? <Badge variant="highlight">{statusLabel}</Badge> : null}
          {languageLabel ? <Badge variant="outline">{languageLabel}</Badge> : null}
        </p>
        <h3
          className={cn(
            "line-clamp-2 font-sans text-xl leading-snug font-semibold tracking-tight text-balance text-foreground",
            featured && "md:text-3xl",
          )}
        >
          <Link
            href={href}
            className="rounded-sm after:absolute after:inset-0 after:rounded-2xl after:content-['']"
          >
            {title}
          </Link>
        </h3>
        {excerpt ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            {excerpt}
          </p>
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
        <span className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-highlight">
          {readLabel}
          <ArrowRight
            aria-hidden
            className="size-4 transition-[translate] duration-200 ease-out group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
          />
        </span>
      </div>
    </article>
  );
}
