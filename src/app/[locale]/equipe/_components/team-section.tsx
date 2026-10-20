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

/** Above this many members (not counting the director) a team card takes the full row. */
const WIDE_GROUP = 8;

/**
 * The people of the league, on /equipe (the old /time path redirects here).
 * Groups come from the admin sheet (scripts/sync-sheet.mjs). Three tiers share one card language so photo
 * sizes step down gradually: the presidency as large portrait cards, each directorate as a team
 * card led by its director (`lead`), then its members; trainee cohorts as full-width cards.
 * Each name links to the member's LinkedIn when given. Missing names stay "a confirmar".
 */
export async function TeamSection({ locale }: { locale: Locale }) {
  const t = await getTranslations("Team");
  const tCommon = await getTranslations("Common");
  const groups = getTeamGroups();
  const featured = groups.filter((g) => g.featured);
  const teams = groups.filter((g) => !g.featured);
  const anyPending = groups.some(
    (g) => g.members.length === 0 || g.members.some((m) => m.placeholder),
  );
  const linkLabel = (m: Member) => `${t("linkedinLabel", { name: m.name })} ${tCommon("newTab")}`;
  const nameOf = (m: Member) => (m.placeholder ? t("nameTbd") : m.name);
  const roleOf = (m: Member) => (m.role ? tr(m.role, locale) : undefined);
  // "Economia · 6º semestre": course and current semester, whichever the sheet has
  const term = await currentTerm();
  // `short` ("4º sem.") for the narrow member rows; the portrait cards have room
  const studyOf = (m: Member, short = false) => {
    const n = m.placeholder ? undefined : currentSemester(m.enrolled, term);
    return {
      course: m.course && !m.placeholder ? tr(m.course, locale) : undefined,
      semester: n ? t(short ? "semesterShort" : "semester", { n }) : undefined,
    };
  };

  return (
    <section>
      <div className="container-page section-y">
        {featured.map((g) => (
          <div key={g.id}>
            <h3 className="sr-only">{tr(g.title, locale)}</h3>
            <ul className="grid gap-4 lg:grid-cols-2">
              {g.members.map((m) => (
                <li key={m.id}>
                  <MaybeLink
                    href={linkOf(m)}
                    label={linkLabel(m)}
                    className="flex h-full items-center gap-5 rounded-2xl border border-border bg-card p-5 sm:gap-6 sm:p-6"
                    hover="hover:border-border-strong"
                  >
                    <Avatar
                      member={m}
                      sizes="128px"
                      className="aspect-4/5 w-24 rounded-xl text-2xl sm:w-32"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-highlight">{roleOf(m)}</p>
                      <Name member={m} className="mt-1 text-xl sm:text-2xl">
                        {nameOf(m)}
                      </Name>
                      <Study {...studyOf(m)} className="mt-1" />
                    </div>
                    <LinkMark member={m} className="self-start" />
                  </MaybeLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {teams.length > 0 ? (
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {teams.map((g) => {
              const lead = g.members.find((m) => m.lead);
              // director first, then members alphabetically (accent-aware)
              const members = g.members
                .filter((m) => !m.lead)
                .sort((a, b) => a.name.localeCompare(b.name, intlLocale(locale)));
              // a team with photos shows small portrait cards, director first; cohorts without
              // photos keep the compact rows, where initials don't leave empty frames
              const portraits = g.members.some((m) => m.photo);
              const wide = portraits || g.wide || members.length > WIDE_GROUP;
              return (
                <div
                  key={g.id}
                  className={cn(
                    "rounded-2xl border border-border bg-card p-6 sm:p-8",
                    wide && "lg:col-span-2",
                  )}
                >
                  <h3 className="flex items-baseline justify-between gap-4 font-sans text-xl font-semibold tracking-tight">
                    {tr(g.title, locale)}
                    {g.members.length > 0 ? (
                      <span className="text-sm font-normal text-muted-foreground tabular-nums">
                        {g.members.length}
                      </span>
                    ) : null}
                  </h3>

                  {portraits ? (
                    <ul className="-mx-2 mt-5 grid gap-x-4 gap-y-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {(lead ? [lead, ...members] : members).map((m) => (
                        <li key={m.id} className={m.lead ? "sm:col-span-2" : undefined}>
                          <MaybeLink
                            href={linkOf(m)}
                            label={linkLabel(m)}
                            // the director's card: a larger photo on a lavender-tinted, bordered card
                            className={cn(
                              "flex h-full items-center gap-4 rounded-xl border p-2",
                              m.lead ? "border-highlight/30 bg-highlight/5" : "border-transparent",
                            )}
                            hover={m.lead ? "hover:border-highlight/60" : "hover:bg-accent"}
                          >
                            <Avatar
                              member={m}
                              sizes={m.lead ? "88px" : "64px"}
                              className={cn(
                                "aspect-4/5 rounded-lg text-lg",
                                m.lead ? "w-22" : "w-16",
                              )}
                            />
                            <div className="flex min-w-0 flex-1 flex-col">
                              <div className="flex items-start justify-between gap-2">
                                <Name member={m} className={m.lead ? "text-lg" : undefined}>
                                  {nameOf(m)}
                                </Name>
                                <LinkMark member={m} className="mt-1" />
                              </div>
                              {roleOf(m) ? (
                                <p
                                  className={cn(
                                    "text-sm",
                                    m.lead
                                      ? "-order-1 mb-0.5 text-highlight"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {roleOf(m)}
                                </p>
                              ) : null}
                              <Study {...studyOf(m)} className="mt-1" />
                            </div>
                          </MaybeLink>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {!portraits && lead ? (
                    <MaybeLink
                      href={linkOf(lead)}
                      label={linkLabel(lead)}
                      className="-mx-3 mt-5 flex items-center gap-4 rounded-xl px-3 py-3"
                      hover="hover:bg-accent"
                    >
                      <Avatar member={lead} sizes="64px" className="size-16 rounded-xl text-lg" />
                      <div className="min-w-0 flex-1">
                        <Name member={lead} className="text-lg">
                          {nameOf(lead)}
                        </Name>
                        <p className="mt-0.5 text-sm text-highlight">{roleOf(lead)}</p>
                        <Study {...studyOf(lead)} />
                      </div>
                      <LinkMark member={lead} />
                    </MaybeLink>
                  ) : null}

                  {portraits ? null : members.length > 0 ? (
                    <ul
                      className={cn(
                        "grid gap-x-6 gap-y-1 sm:grid-cols-2",
                        lead ? "mt-4 border-t border-border pt-4" : "mt-6",
                        wide && "lg:grid-cols-3 xl:grid-cols-4",
                      )}
                    >
                      {members.map((m) => (
                        <li key={m.id}>
                          <MaybeLink
                            href={linkOf(m)}
                            label={linkLabel(m)}
                            className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2"
                            hover="hover:bg-accent"
                          >
                            <Avatar
                              member={m}
                              sizes="40px"
                              className="size-10 rounded-full text-sm"
                            />
                            <div className="min-w-0 flex-1">
                              <Name member={m} className="font-medium">
                                {nameOf(m)}
                              </Name>
                              {roleOf(m) ? (
                                <p className="text-sm text-muted-foreground">{roleOf(m)}</p>
                              ) : null}
                              <Study {...studyOf(m, true)} />
                            </div>
                            <LinkMark member={m} />
                          </MaybeLink>
                        </li>
                      ))}
                    </ul>
                  ) : !lead ? (
                    <p className="mt-4 text-sm text-muted-foreground">{t("membersTbd")}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        {anyPending ? (
          <PlaceholderNote label={tCommon("pending")} className="mt-6">
            {t("pending")}
          </PlaceholderNote>
        ) : null}
      </div>
    </section>
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
