import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LinkedinIcon } from "@/components/brand/social-icons";

type MemberCardProps = {
  name: string;
  role: string;
  area?: string;
  photo?: { src: string; alt: string; width: number; height: number; blurDataURL?: string };
  /** LinkedIn profile URL. */
  linkedin?: string;
  /** Accessible label for the LinkedIn link, e.g. "Ana Silva no LinkedIn". */
  linkedinLabel?: string;
  /** Placeholder initials; derived from `name` when omitted. */
  initials?: string;
  className?: string;
};

export function deriveInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

/** Team member portrait card with graceful no-photo placeholder. */
export function MemberCard({
  name,
  role,
  area,
  photo,
  linkedin,
  linkedinLabel,
  initials,
  className,
}: MemberCardProps) {
  return (
    <article className={cn("group flex flex-col gap-4", className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary">
        {photo ? (
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            placeholder={photo.blurDataURL ? "blur" : "empty"}
            blurDataURL={photo.blurDataURL}
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
            className="absolute inset-0 size-full object-cover transition-[scale] duration-500 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-600/70 via-brand-800 to-brand-950"
          >
            <div className="absolute inset-0 bg-dot-grid" />
            <span className="relative font-display text-5xl tracking-wide text-lavender-300">
              {initials ?? deriveInitials(name)}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium text-foreground">{name}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{role}</p>
          {area ? (
            <Badge variant="highlight" className="mt-3">
              {area}
            </Badge>
          ) : null}
        </div>
        {linkedin ? (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={linkedinLabel ?? `${name} LinkedIn`}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border-strong text-muted-foreground transition-colors hover:bg-accent hover:text-highlight"
          >
            <LinkedinIcon className="size-4" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
