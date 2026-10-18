import type { Metadata } from "next";
import { ArrowUpRight, X } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageIntro } from "@/components/layout/page-intro";
import { PodiumMotif } from "@/components/layout/intro-motifs";
import type { Locale } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { ButtonAnchor } from "@/components/ui/button";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { getCompetitions, getProjects, tr } from "@/lib/content";
import { getPageLocale } from "@/lib/locale";
import { pageAlternates } from "@/lib/seo";
import { FundFeature, OngoingCard, ProjectRow } from "./_components/project-items";
import { Carousel } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type Translator = Awaited<ReturnType<typeof getTranslations>>;
type Competition = ReturnType<typeof getCompetitions>[number];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Projects.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: await pageAlternates("/projetos"),
  };
}

/**
 * Competitions open the page as a carousel (details folded away), so the projects below, by
 * semester with the current one first, get the full width for their descriptions. The old
 * /competicoes redirects to #competicoes. Results come from the league's own posts (self-reported note).
 */
export default async function ProjectsPage() {
  const [t, tc, tCommon, locale] = await Promise.all([
    getTranslations("Projects"),
    getTranslations("Competitions"),
    getTranslations("Common"),
    getPageLocale(),
  ]);
  const competitions = getCompetitions();
  const all = getProjects();
  // The fund runs continuously; trainee projects live on /processo-seletivo; the rest go by semester.
  const fund = all.find((p) => p.kind === "fund");
  const projects = all.filter((p) => p.kind === "research");
  const semesters = [...new Set(projects.map((p) => p.period))];

  // Highlight the podium step of the league's lead result in the latest competition ("2º lugar" → 2).
  const topRank = Number(
    competitions[0]?.teams
      .find((team) => team.ranked && team.official)
      ?.result.pt.match(/^\d/)?.[0],
  );
  const podium = topRank === 1 || topRank === 2 || topRank === 3 ? topRank : undefined;

  return (
    <main id="content">
      <PageIntro
        motif={<PodiumMotif highlight={podium} />}
        eyebrow={t("intro.eyebrow")}
        title={t("intro.title")}
        description={t("intro.description")}
      >
        <nav aria-label={t("intro.eyebrow")} className="flex flex-wrap gap-3">
          <a href="#competicoes" className={jumpClass}>
            {t("jump.competitions")}
          </a>
          <a href="#projetos" className={jumpClass}>
            {t("jump.projects")}
          </a>
        </nav>
      </PageIntro>

      <div className="container-page section-y">
        <div className="flex flex-col gap-20">
          {/* Competitions: a swipeable carousel on top, so the projects below get the full width */}
          <section id="competicoes" aria-labelledby="competicoes-titulo" className="scroll-mt-24">
            <h2
              id="competicoes-titulo"
              className="font-display text-4xl tracking-tight text-foreground sm:text-5xl"
            >
              {t("competitions.title")}
            </h2>
            <p className="mt-3 max-w-[60ch] text-base text-muted-foreground">
              {t("competitions.description")}
            </p>
            {competitions.length === 0 ? (
              <PlaceholderNote label={tCommon("pending")} className="mt-6">
                {tc("empty")}
              </PlaceholderNote>
            ) : (
              <Carousel prevLabel={t("competitions.prev")} nextLabel={t("competitions.next")}>
                {competitions.map((c) => (
                  <li
                    key={c.id}
                    className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
                  >
                    <CompetitionCard competition={c} t={t} tc={tc} locale={locale} />
                  </li>
                ))}
              </Carousel>
            )}
            {competitions.some((c) => c.selfReported) ? (
              <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline">{tc("selfReportedBadge")}</Badge>
                {tc("selfReported")}
              </p>
            ) : null}
          </section>

          {/* Projects by semester */}
          <section id="projetos" aria-labelledby="projetos-titulo" className="scroll-mt-24">
            <h2
              id="projetos-titulo"
              className="font-display text-4xl tracking-tight text-foreground sm:text-5xl"
            >
              {t("projects.title")}
            </h2>
            <p className="mt-3 max-w-[60ch] text-base text-muted-foreground">
              {t("projects.description")}
            </p>

            {fund ? <FundFeature project={fund} t={t} locale={locale} /> : null}

            {/* Semesters as a vertical timeline: a rail on the left, a node per semester. */}
            <ol className="mt-14 border-l border-border">
              {semesters.map((period) => {
                const items = projects.filter((p) => p.period === period);
                const ongoing = items.some((p) => p.status === "in-progress");
                return (
                  <li key={period} className="relative pb-12 pl-6 last:pb-0 sm:pl-8">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-3 -left-[5px] size-[9px] rounded-full ring-4 ring-background",
                        ongoing ? "bg-highlight" : "bg-border-strong",
                      )}
                    />
                    <section aria-labelledby={`semestre-${period}`}>
                      <h3
                        id={`semestre-${period}`}
                        className="flex flex-wrap items-center gap-3 font-display text-3xl tracking-tight text-foreground"
                      >
                        {period}
                        {ongoing ? (
                          <Badge variant="highlight" className="font-sans">
                            {t("projects.inProgress")}
                          </Badge>
                        ) : null}
                      </h3>
                      {ongoing ? (
                        <ul className="mt-6 grid gap-4 md:grid-cols-2">
                          {items.map((p) => (
                            <li key={p.id}>
                              <OngoingCard project={p} t={t} locale={locale} />
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="mt-2 divide-y divide-border">
                          {items.map((p) => (
                            <li key={p.id}>
                              <ProjectRow project={p} t={t} locale={locale} />
                            </li>
                          ))}
                        </ul>
                      )}
                    </section>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
      </div>
    </main>
  );
}

const jumpClass =
  "inline-flex min-h-11 items-center rounded-full border border-border-strong px-5 text-sm font-medium text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

function Members({
  label,
  names,
  lead,
  leadLabel,
}: {
  label: string;
  names: string[];
  lead?: string;
  leadLabel?: string;
}) {
  if (names.length === 0) return null;
  const ordered = lead ? [lead, ...names.filter((n) => n !== lead)] : names;
  return (
    <p className="text-sm text-muted-foreground">
      <span className="text-foreground">{label}:</span>{" "}
      {ordered.map((n, i) => (
        <span key={n}>
          {i > 0 ? ", " : null}
          {n === lead ? (
            <>
              <span className="text-foreground">{n}</span> ({leadLabel})
            </>
          ) : (
            n
          )}
        </span>
      ))}
    </p>
  );
}

/**
 * Compact competition card: the league's lead result, the challenge and its official teams.
 * Members, strategy, former members and the source fold into a native <details>.
 */
function CompetitionCard({
  competition: c,
  t,
  tc,
  locale,
}: {
  competition: Competition;
  t: Translator;
  tc: Translator;
  locale: Locale;
}) {
  const official = c.teams.filter((team) => team.official);
  const alumni = c.teams.filter((team) => !team.official);
  const lead = official.find((team) => team.ranked) ?? official[0];
  return (
    <article
      aria-labelledby={`comp-${c.id}`}
      className="flex h-full flex-col rounded-2xl border border-border bg-card"
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          {lead ? (
            <p className="font-display text-4xl leading-none tracking-tight text-foreground">
              {tr(lead.result, locale)}
            </p>
          ) : null}
          <Badge variant="outline">{c.year}</Badge>
        </div>
        <h3
          id={`comp-${c.id}`}
          className="mt-3 font-sans leading-snug font-semibold tracking-tight text-foreground"
        >
          {c.name}
        </h3>
        <p className="mt-0.5 text-sm text-highlight">{c.organizer}</p>
        <p className="mt-3 flex flex-wrap gap-1.5">
          {official.map((team) => (
            <span
              key={team.name}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs text-foreground"
            >
              {team.name}
            </span>
          ))}
        </p>
      </div>

      {/* Details open in a native popover (top layer, Esc / click-outside to close), so the
          carousel cards keep their size instead of stretching the whole row. */}
      <button
        type="button"
        popoverTarget={`comp-${c.id}-details`}
        className="mt-auto flex items-center justify-between gap-3 rounded-b-2xl border-t border-border px-5 py-3 text-left text-sm font-medium text-foreground hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {t("competitions.details")}
        <ArrowUpRight aria-hidden className="size-4 text-muted-foreground" />
      </button>
      <div
        id={`comp-${c.id}-details`}
        popover="auto"
        aria-labelledby={`comp-${c.id}-details-title`}
        className="m-auto max-h-[85vh] w-[min(40rem,calc(100%-2rem))] overflow-y-auto rounded-2xl border border-border bg-card p-6 text-foreground backdrop:bg-black/60"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-highlight">
              {c.organizer} · {c.year}
            </p>
            <h4
              id={`comp-${c.id}-details-title`}
              className="mt-1 font-display text-2xl tracking-tight"
            >
              {c.name}
            </h4>
          </div>
          <button
            type="button"
            popoverTarget={`comp-${c.id}-details`}
            popoverTargetAction="hide"
            aria-label={t("competitions.close")}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border-strong hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
        <div className="mt-5 grid gap-5 text-sm">
          <p className="leading-relaxed text-muted-foreground">{tr(c.summary, locale)}</p>
          {official.map((team, i) => (
            <div key={`${team.name}-${i}`} className="grid gap-1.5">
              <p className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-foreground">{team.name}</span>
                <Badge variant={team.ranked ? "highlight" : "outline"}>
                  {tr(team.result, locale)}
                </Badge>
              </p>
              <Members label={tc("members")} names={team.members} />
              {team.strategy ? (
                <p className="leading-relaxed text-muted-foreground">
                  <span className="text-foreground">{t("competitions.strategy")}:</span>{" "}
                  {tr(team.strategy, locale)}
                </p>
              ) : null}
            </div>
          ))}
          {alumni.length > 0 ? (
            <div className="text-muted-foreground">
              <p className="text-foreground">{t("competitions.alumni")}</p>
              {alumni.map((team, i) => (
                <p key={`${team.name}-${i}`}>
                  {team.name} · {tr(team.result, locale)}
                  {team.members.length > 0 ? ` · ${team.members.join(", ")}` : ""}
                </p>
              ))}
            </div>
          ) : null}
          {c.source ? (
            <ButtonAnchor href={c.source} variant="link" arrow className="self-start">
              {tc("source")}
            </ButtonAnchor>
          ) : null}
        </div>
      </div>
    </article>
  );
}
