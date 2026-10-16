import Image from "next/image";
import { MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type EventCardProps = {
  title: string;
  /**
   * Date text. Day and month are split on the first whitespace for the date
   * block, e.g. "12 Mar" or "12 MAR 2026" (extra tokens appear in the block's tooltip-free caption).
   */
  dateLabel: string;
  /** Machine-readable kind, exposed as data-kind for styling hooks. */
  kind: string;
  /** Localized kind label shown in the badge. */
  kindLabel: string;
  location?: string;
  description?: string;
  /** Internal (locale-aware) link; makes the whole card clickable. */
  href?: string;
  image?: { src: string; alt: string };
  className?: string;
};

/** Compact horizontal event card with a mono date block. */
export function EventCard({
  title,
  dateLabel,
  kind,
  kindLabel,
  location,
  description,
  href,
  image,
  className,
}: EventCardProps) {
  const [day, ...rest] = dateLabel.trim().split(/\s+/);
  const month = rest[0] ?? "";

  return (
    <article
      data-kind={kind}
      className={cn(
        "group relative flex items-start gap-4 rounded-2xl bg-card p-4 transition-colors hover:bg-secondary sm:gap-5 sm:p-5",
        className,
      )}
    >
      <div
        className="flex size-16 shrink-0 flex-col items-center justify-center rounded-xl border border-border-strong bg-secondary font-mono sm:size-[4.5rem]"
        aria-label={dateLabel}
        role="img"
      >
        <span className="text-xl leading-none font-medium text-foreground sm:text-2xl">{day}</span>
        {month ? (
          <span className="mt-1 text-xs leading-none tracking-wider text-highlight uppercase">
            {month}
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <Badge variant="highlight">{kindLabel}</Badge>
        <h3 className="mt-2.5 font-sans text-xl leading-snug font-semibold tracking-tight text-foreground">
          {href ? (
            <Link
              href={href}
              className="rounded-sm after:absolute after:inset-0 after:rounded-2xl after:content-['']"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        {description ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
        {location ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin aria-hidden className="size-3.5 shrink-0" />
            {location}
          </p>
        ) : null}
      </div>

      {image ? (
        <div className="relative hidden aspect-square w-24 shrink-0 overflow-hidden rounded-xl border border-border sm:block">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="96px"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
        </div>
      ) : null}
    </article>
  );
}
