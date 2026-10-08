import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

function deriveInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
      className={className}
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
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
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-secondary">
        {photo ? (
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            placeholder={photo.blurDataURL ? "blur" : "empty"}
            blurDataURL={photo.blurDataURL}
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 50vw"
            className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-600/70 via-brand-800 to-brand-950"
          >
            <div className="absolute inset-0 bg-dot-grid" />
            <div className="absolute inset-0 bg-glow opacity-50" />
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
            <LinkedInIcon className="size-4" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
