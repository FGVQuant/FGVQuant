import Image from "next/image";
import { Download } from "lucide-react";
import type { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { IssueFigure } from "@/components/cards/issue-figure";
import { deriveInitials } from "@/components/cards/member-card";
import { Badge } from "@/components/ui/badge";
import { ButtonAnchor, ButtonLink, buttonVariants } from "@/components/ui/button";
import { getProjects, getTeam, tr } from "@/lib/content";
import { cn } from "@/lib/utils";

type Translator = Awaited<ReturnType<typeof getTranslations>>;
export type Project = ReturnType<typeof getProjects>[number];
type Props = { project: Project; t: Translator; locale: Locale };

/** Lead first, then the rest in the order given. */
const ordered = (p: Project) =>
  p.lead ? [p.lead, ...p.members.filter((m) => m !== p.lead)] : p.members;

/** Illustrated tile: the project's topic figure on the dark brand surface (same in both themes). */
export function FigureTile({
  figure,
  className,
  label,
}: {
  figure?: Project["figure"];
  className?: string;
  label?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("relative isolate overflow-hidden rounded-xl bg-brand-950", className)}
    >
      <div className="absolute inset-0 -z-10 bg-grid opacity-40" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-600/40 via-transparent to-transparent" />
      {figure ? (
        <IssueFigure kind={figure} className="absolute inset-0 size-full p-3 text-lavender-400" />
      ) : null}
      {label ? (
        <span className="absolute bottom-2.5 left-3 font-mono text-[0.7rem] tracking-wide text-lavender-300/80 uppercase">
          {label}
        </span>
      ) : null}
    </div>
  );
}

/** Overlapping avatars for the people on a project: team photo when we have it, else initials. */
export function AvatarStack({ names, lead }: { names: string[]; lead?: string }) {
  if (names.length === 0) return null;
  const byName = new Map(getTeam().map((m) => [m.name, m]));
  return (
    <span aria-hidden className="flex -space-x-2">
      {names.map((name) => {
        const photo = byName.get(name)?.photo;
        return (
          <span
            key={name}
            title={name}
            className={cn(
              "relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary font-display text-[0.7rem] text-lavender-300 ring-2 ring-card",
              name === lead && "ring-highlight",
            )}
          >
            {photo ? (
              <Image
                src={photo.src}
                alt=""
                width={photo.width}
                height={photo.height}
                sizes="32px"
                className="absolute inset-0 size-full object-cover object-[50%_30%]"
              />
            ) : (
              deriveInitials(name)
            )}
          </span>
        );
      })}
    </span>
  );
}

/** Avatars plus the names in words, lead marked; the words carry the meaning for screen readers. */
export function People({
  project: p,
  t,
  label,
  stacked = false,
}: Props & { label: string; stacked?: boolean }) {
  const names = ordered(p);
  if (names.length === 0) return null;
  return (
    <div className={cn("flex gap-3", stacked ? "flex-col items-start gap-2" : "items-center")}>
      <AvatarStack names={names} lead={p.lead} />
      <p className="min-w-0 text-sm text-muted-foreground">
        <span className="sr-only">{label}: </span>
        {names.map((n, i) => (
          <span key={n}>
            {i > 0 ? ", " : null}
            {n === p.lead ? (
              <>
                <span className="text-foreground">{n}</span> ({t("projects.lead")})
              </>
            ) : (
              n
            )}
          </span>
        ))}
      </p>
    </div>
  );
}

function Actions({ project: p, t }: Props) {
  if (!p.paper && !p.link && !p.href) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
      {p.paper ? (
        <a href={p.paper} download className={buttonVariants({ variant: "outline", size: "sm" })}>
          <Download aria-hidden className="size-4" />
          {t("projects.paper")}
        </a>
      ) : null}
      {p.href ? (
        <ButtonLink href={p.href} variant="link" arrow>
          {t("projects.fundCta")}
        </ButtonLink>
      ) : null}
      {p.link ? (
        <ButtonAnchor href={p.link} variant="link" arrow>
          {t("projects.link")}
        </ButtonAnchor>
      ) : null}
    </div>
  );
}

/** Finished research: an editorial row, illustrated thumbnail beside the text, no box. */
export function ProjectRow({ project: p, t, locale }: Props) {
  return (
    <article className="grid gap-5 py-7 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:gap-7">
      <FigureTile
        figure={p.figure}
        className="aspect-[16/10] w-full max-w-[13rem] sm:mt-1 sm:max-w-none"
      />
      <div className="min-w-0">
        {p.partner ? (
          <p className="text-sm text-highlight">{t("projects.partner", { partner: p.partner })}</p>
        ) : null}
        <h4 className="mt-1 font-display text-2xl leading-snug tracking-tight text-pretty text-foreground">
          {tr(p.title, locale)}
        </h4>
        <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
          {tr(p.summary, locale)}
        </p>
        <div className="mt-4 grid gap-2">
          <People project={p} t={t} locale={locale} label={t("projects.members")} />
          {p.mentor ? (
            <p className="text-sm text-muted-foreground">
              {t("projects.mentor", { mentor: p.mentor })}
            </p>
          ) : null}
        </div>
        <Actions project={p} t={t} locale={locale} />
      </div>
    </article>
  );
}

/** This semester's projects: an illustrated strip naming the partner, then the team. */
export function OngoingCard({ project: p, t, locale }: Props) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <FigureTile
        figure={p.figure}
        className="h-24 rounded-none"
        label={p.partner ?? tr(p.title, locale)}
      />
      <div className="flex flex-1 flex-col p-5">
        <h4 className="font-sans text-lg leading-snug font-semibold tracking-tight text-foreground">
          {tr(p.title, locale)}
        </h4>
        {/* Top-aligned: pinned to the bottom, a name list that wraps lifts the avatars out of line. */}
        <div className="mt-4">
          <People project={p} t={t} locale={locale} label={t("projects.members")} stacked />
        </div>
      </div>
    </article>
  );
}

/** FGV Quant Capital: a continuous project, text beside a large figure, with the current team. */
export function FundFeature({ project: p, t, locale }: Props) {
  return (
    <article className="relative isolate mt-10 grid overflow-hidden rounded-3xl border border-highlight/30 bg-card md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div aria-hidden className="absolute inset-0 -z-10 bg-glow opacity-60" />
      <div className="p-6 sm:p-8">
        <p className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant="highlight">{t("projects.kinds.fund")}</Badge>
          <span className="text-muted-foreground">
            {t("projects.continuous", { period: p.period })}
          </span>
        </p>
        <h3 className="mt-4 font-display text-4xl tracking-tight text-foreground">
          {tr(p.title, locale)}
        </h3>
        <p className="mt-3 max-w-[60ch] text-base leading-relaxed text-muted-foreground">
          {tr(p.summary, locale)}
        </p>
        <p className="mt-5 text-sm font-medium text-foreground">{t("projects.team")}</p>
        <div className="mt-2">
          <People project={p} t={t} locale={locale} label={t("projects.team")} />
        </div>
        {p.href ? (
          <ButtonLink href={p.href} arrow className="mt-6">
            {t("projects.fundCta")}
          </ButtonLink>
        ) : null}
      </div>
      <FigureTile
        figure={p.figure}
        className="m-1.5 aspect-[16/10] self-center rounded-[1.35rem] md:m-6 md:ml-0"
      />
    </article>
  );
}
