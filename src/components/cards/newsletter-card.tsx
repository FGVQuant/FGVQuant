import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
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
  /** Larger horizontal layout on md+. */
  featured?: boolean;
  readLabel: string;
  className?: string;
};

/** Editorial newsletter card with cover or generated placeholder. */
export function NewsletterCard({
  href,
  title,
  dateLabel,
  issueLabel,
  excerpt,
  tags,
  cover,
  featured = false,
  readLabel,
  className,
}: NewsletterCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col gap-5 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-border-strong",
        featured && "md:grid md:grid-cols-2 md:items-center md:gap-8 md:p-6",
        className,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-xl border border-border bg-secondary">
        {cover ? (
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes={featured ? "(min-width: 768px) 560px, 100vw" : "(min-width: 768px) 360px, 100vw"}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-brand-600/60 via-brand-800 to-brand-950"
          >
            <div className="absolute inset-0 bg-grid opacity-70" />
            <div className="absolute inset-0 bg-glow opacity-60" />
            {issueLabel ? (
              <span className="absolute bottom-3 left-4 font-mono text-3xl tracking-tight text-lavender-400 sm:text-4xl">
                {issueLabel}
              </span>
            ) : null}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <p className="flex flex-wrap items-center gap-x-3 font-mono text-xs tracking-wide text-muted-foreground uppercase">
          <span>{dateLabel}</span>
          {issueLabel ? (
            <>
              <span aria-hidden className="size-1 rounded-full bg-highlight" />
              <span className="text-highlight">{issueLabel}</span>
            </>
          ) : null}
        </p>
        <h3
          className={cn(
            "line-clamp-2 font-display text-xl leading-snug font-medium text-balance text-foreground",
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
            className="size-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
          />
        </span>
      </div>
    </article>
  );
}
