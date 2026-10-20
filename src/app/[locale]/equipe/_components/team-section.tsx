import Image from "next/image";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { currentSemester, currentTerm, getTeamGroups, intlLocale, tr } from "@/lib/content";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { deriveInitials } from "@/components/cards/member-card";
import { LinkedinIcon } from "@/components/brand/social-icons";
import { cn } from "@/lib/utils";

type Group = ReturnType<typeof getTeamGroups>[number];
type Member = Group["members"][number];

/**
 * The people of the league, on /equipe (the old /time path redirects here), in tiers that step down
 * in weight: the presidency (large tinted cards); each directorate, its director's card (`lead`) beside
 * the team's members (unboxed rows with a small photo); and the trainee cohorts (names only).
 * Groups come from the admin sheet (scripts/sync-sheet.mjs).
 * Each name links to the member's LinkedIn when given. Missing names stay "a confirmar".
 */
export async function TeamSection({ locale }: { locale: Locale }) {
  const t = await getTranslations("Team");
  const tCommon = await getTranslations("Common");
  const groups = getTeamGroups();
  const presidency = groups.filter((g) => g.featured).flatMap((g) => g.members);
  // cohorts get their id from the sync script: trainees-<entry semester>
  const cohorts = groups.filter((g) => g.id.startsWith("trainees-"));
  const teams = groups.filter((g) => !g.featured && !cohorts.includes(g));
  const anyPending = groups.some(
    (g) => g.members.length === 0 || g.members.some((m) => m.placeholder),
  );
  const byName = (a: Member, b: Member) => a.name.localeCompare(b.name, intlLocale(locale));
  const linkLabel = (m: Member) => `${t("linkedinLabel", { name: m.name })} ${tCommon("newTab")}`;
  const nameOf = (m: Member) => (m.placeholder ? t("nameTbd") : m.name);
  const roleOf = (m: Member) => (m.role ? tr(m.role, locale) : undefined);
  // "Economia 6º semestre": course and current semester, whichever the sheet has
  const term = await currentTerm();
  // `short` ("4º sem.") for the trainee columns
  const studyOf = (m: Member, short = false) => {
    const n = m.placeholder ? undefined : currentSemester(m.enrolled, term);
    return {
      course: m.course && !m.placeholder ? tr(m.course, locale) : undefined,
      semester: n ? t(short ? "semesterShort" : "semester", { n }) : undefined,
    };
  };

  return (
    <section>
      <div className="container-page space-y-20 section-y md:space-y-28">
        {presidency.length > 0 ? (
          <Tier title={t("tiers.presidency")}>
            <ul className="grid gap-4 lg:grid-cols-2">
              {presidency.map((m) => (
                <li key={m.id}>
                  <MaybeLink
                    href={linkOf(m)}
                    label={linkLabel(m)}
                    className="flex h-full items-center gap-5 rounded-2xl border border-highlight/25 bg-linear-to-br from-highlight/10 to-card p-4 sm:gap-6 sm:p-5"
                    hover="hover:border-highlight/50"
                  >
                    <Avatar
                      member={m}
                      sizes="112px"
                      className="aspect-4/5 w-24 rounded-xl text-2xl sm:w-28"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-highlight">{roleOf(m)}</p>
                      <Name
                        member={m}
                        className="mt-1 font-display text-xl font-medium sm:text-2xl"
                      >
                        {nameOf(m)}
                      </Name>
                      <Study {...studyOf(m)} className="mt-2" />
                    </div>
                    <LinkMark member={m} className="self-start" />
                  </MaybeLink>
                </li>
              ))}
            </ul>
          </Tier>
        ) : null}

        {teams.length > 0 ? (
          <Tier title={t("tiers.teams")}>
            <div className="divide-y divide-border">
              {teams.map((g) => {
                const lead = g.members.find((m) => m.lead);
                const members = g.members.filter((m) => !m.lead).sort(byName);
                return (
                  <div key={g.id} className="py-10 first:pt-0 last:pb-0">
                    <h3 className="font-sans text-base font-semibold tracking-tight">
                      {tr(g.title, locale)}
                      <span className="ml-2 font-mono text-sm font-normal text-muted-foreground tabular-nums">
                        {g.members.length || null}
                      </span>
                    </h3>
                    <div className="mt-5 grid gap-4 lg:grid-cols-[22rem_1fr] lg:gap-8">
                      {lead ? (
                        <MaybeLink
                          href={linkOf(lead)}
                          label={linkLabel(lead)}
                          className="flex items-center gap-5 self-start rounded-2xl border border-border bg-card p-4"
                          hover="hover:border-border-strong"
                        >
                          <Avatar
                            member={lead}
                            sizes="80px"
                            className="aspect-4/5 w-20 rounded-lg text-xl"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-highlight">{t("director")}</p>
                            <Name member={lead} className="mt-1 text-lg">
                              {nameOf(lead)}
                            </Name>
                            <Study {...studyOf(lead)} className="mt-1.5 flex-col" />
                          </div>
                          <LinkMark member={lead} className="self-start" />
                        </MaybeLink>
                      ) : null}
                      {members.length > 0 ? (
                        <ul
                          className={cn(
                            "-mx-2 grid content-start gap-1 sm:grid-cols-2 xl:grid-cols-3",
                            !lead && "lg:col-span-2",
                          )}
                        >
                          {members.map((m) => (
                            <li key={m.id}>
                              <MaybeLink
                                href={linkOf(m)}
                                label={linkLabel(m)}
                                className="flex h-full items-center gap-3 rounded-xl p-2"
                                hover="hover:bg-accent"
                              >
                                <Avatar
                                  member={m}
                                  sizes="48px"
                                  className="aspect-4/5 w-12 rounded-md text-sm"
                                />
                                <div className="min-w-0 flex-1">
                                  <Name member={m} className="font-medium">
                                    {nameOf(m)}
                                  </Name>
                                  {roleOf(m) ? (
                                    <p className="text-sm text-muted-foreground">{roleOf(m)}</p>
                                  ) : null}
                                  <Study {...studyOf(m)} className="flex-col" />
                                </div>
                                <LinkMark member={m} />
                              </MaybeLink>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">{t("membersTbd")}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Tier>
        ) : null}

        {cohorts.map((g) => (
          <Tier key={g.id} title={tr(g.title, locale)} count={g.members.length}>
            {g.members.length > 0 ? (
              <ul className="-mx-2 grid grid-cols-2 gap-1 lg:grid-cols-3 xl:grid-cols-4">
                {[...g.members].sort(byName).map((m) => (
                  <li key={m.id}>
                    <MaybeLink
                      href={linkOf(m)}
                      label={linkLabel(m)}
                      className="flex h-full items-start justify-between gap-3 rounded-lg px-2 py-1.5"
                      hover="hover:bg-accent"
                    >
                      <div className="min-w-0">
                        <Name member={m} className="text-sm font-medium">
                          {nameOf(m)}
                        </Name>
                        <Study {...studyOf(m, true)} />
                      </div>
                      <LinkMark member={m} className="mt-0.5" />
                    </MaybeLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t("membersTbd")}</p>
            )}
          </Tier>
        ))}

        {anyPending ? (
          <PlaceholderNote label={tCommon("pending")}>{t("pending")}</PlaceholderNote>
        ) : null}
      </div>
    </section>
  );
}

/** One tier of the page: a serif heading over a hairline, with an optional head count. */
function Tier({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <div>
      <div className="mb-8 flex items-baseline justify-between gap-4 border-b border-border pb-4">
        <h2 className="font-display text-2xl tracking-tight md:text-3xl">{title}</h2>
        {count ? (
          <span className="font-mono text-sm text-muted-foreground tabular-nums">{count}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

const linkOf = (m: Member) => (m.placeholder ? undefined : m.linkedin);

/**
 * Course and semester under a name; nothing when the sheet has neither. No separator: the semester is
 * set in mono, and in a narrow row it drops whole to the next line instead of leaving a dangling "·".
 */
function Study({
  course,
  semester,
  className,
}: {
  course?: string;
  semester?: string;
  className?: string;
}) {
  if (!course && !semester) return null;
  return (
    <p className={cn("flex flex-wrap gap-x-2 text-xs text-muted-foreground", className)}>
      {course ? <span>{course}</span> : null}
      {course && semester ? <span className="sr-only">, </span> : null}
      {semester ? <span className="font-mono whitespace-nowrap">{semester}</span> : null}
    </p>
  );
}

/** A LinkedIn link when the member has one, otherwise a plain block with the same layout. */
function MaybeLink({
  href,
  label,
  className,
  hover,
  children,
}: {
  href?: string;
  label: string;
  className: string;
  /** hover classes, applied only when it is a link */
  hover: string;
  children: ReactNode;
}) {
  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={cn(
        "group transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
        hover,
      )}
    >
      {children}
    </a>
  ) : (
    <div className={className}>{children}</div>
  );
}

/**
 * Crop focus for photos whose face is off-centre, by member id; the rest use the default above.
 * ponytail: hand-kept list; a sheet column if more photos need it.
 */
const PHOTO_FOCUS: Record<string, string> = {
  // square source with the face at ~⅓ width: anchor the 4:5 crop to the left edge
  "fernando-suguimoto": "0% 30%",
};

/** Photo when the member has one, initials otherwise. Size and shape come from `className`. */
function Avatar({
  member,
  sizes,
  className,
}: {
  member: Member;
  sizes: string;
  className: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-secondary font-display text-lavender-300",
        className,
      )}
    >
      {member.photo ? (
        <Image
          src={member.photo.src}
          alt=""
          width={member.photo.width}
          height={member.photo.height}
          placeholder={member.photo.blurDataURL ? "blur" : "empty"}
          blurDataURL={member.photo.blurDataURL}
          sizes={sizes}
          // portraits are 4:5 with the face in the upper half; keep it in frame when cropped square
          className="absolute inset-0 size-full object-cover object-[50%_30%]"
          style={{ objectPosition: PHOTO_FOCUS[member.id] }}
        />
      ) : member.placeholder ? (
        "?"
      ) : (
        deriveInitials(member.name)
      )}
    </span>
  );
}

function Name({
  member,
  className,
  children,
}: {
  member: Member;
  className?: string;
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "leading-snug font-semibold tracking-tight text-pretty",
        member.placeholder ? "text-muted-foreground" : "text-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Small LinkedIn mark; quiet until the row is hovered or focused. */
function LinkMark({ member, className }: { member: Member; className?: string }) {
  return linkOf(member) ? (
    <LinkedinIcon
      className={cn(
        "size-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-highlight group-focus-visible:text-highlight",
        className,
      )}
    />
  ) : null;
}
