import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { PageIntro } from "@/components/layout/page-intro";
import { PodiumMotif } from "@/components/layout/intro-motifs";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { Em, SectionHeader } from "@/components/ui/section-header";
import { getPageLocale } from "@/lib/locale";
import { getCompetitions, tr } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { TeamRow } from "./_components/team-row";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Competitions");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: await pageAlternates("/desafios"),
  };
}

/** Numeric place from a result like "2º lugar" / "2nd place"; Top-10 style results have none. */
const placeOf = (pt: string) => {
  const n = Number(pt.match(/^(\d+)º/)?.[1]);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

const SKILLS = ["thesis", "data", "backtest", "risk"] as const;

export default async function ChallengesPage() {
  const locale = await getPageLocale();
  const t = await getTranslations("Competitions");
  const tCommon = await getTranslations("Common");
  const em = (c: ReactNode) => <Em>{c}</Em>;
  const competitions = getCompetitions();

  // Headline figures, all derived from content/competitions.json.
  const ranked = competitions.flatMap((c) =>
    c.teams.filter((team) => team.ranked).map((team) => ({ team, challenge: c })),
  );
  const best = [...ranked].sort(
    (a, b) => (placeOf(a.team.result.pt) ?? 99) - (placeOf(b.team.result.pt) ?? 99),
  )[0];
  const topPlace = best ? placeOf(best.team.result.pt) : undefined;
  const podium = topPlace === 1 || topPlace === 2 || topPlace === 3 ? topPlace : undefined;

  return (
    <main id="content">
      <PageIntro
        motif={<PodiumMotif highlight={podium} />}
        eyebrow={t("eyebrow")}
        title={t.rich("title", { em })}
        description={t("description")}
      />

      {competitions.length === 0 ? (
        <section className="container-page section-y">
          <PlaceholderNote label={tCommon("pending")}>{t("empty")}</PlaceholderNote>
        </section>
      ) : (
        <>
          <section className="container-page pt-10">
            <dl className="grid gap-4 sm:grid-cols-3">
              <Stat label={t("stats.challenges")}>{competitions.length}</Stat>
              <Stat label={t("stats.ranked")}>{ranked.length}</Stat>
              {best ? (
                <Stat
                  label={t("stats.best")}
                  note={t("stats.bestNote", {
                    team: best.team.name,
                    challenge: best.challenge.name,
                  })}
                  highlight
                >
                  {tr(best.team.result, locale)}
                </Stat>
              ) : null}
            </dl>
          </section>

          {competitions.map((c) => {
            const lead = [...c.teams].sort(
              (a, b) => (placeOf(a.result.pt) ?? 99) - (placeOf(b.result.pt) ?? 99),
            )[0];
            const others = c.teams.filter((team) => team !== lead);
            return (
              <section
                key={c.id}
                aria-labelledby={`comp-${c.id}`}
                className="container-page section-y"
              >
                <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
                  <div>
                    <SectionHeader
                      eyebrow={`${c.organizer} · ${c.year}`}
                      title={<span id={`comp-${c.id}`}>{c.name}</span>}
                      description={tr(c.summary, locale)}
                    />
                    <div className="mt-8 flex flex-wrap items-center gap-3">
                      {c.source ? (
                        <ButtonAnchor href={c.source} variant="outline" arrow>
                          {t("source")}
                        </ButtonAnchor>
                      ) : null}
                      {c.selfReported ? (
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline">{t("selfReportedBadge")}</Badge>
                          {t("selfReported")}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    {lead ? (
                      <article className="relative isolate overflow-hidden rounded-2xl border border-highlight/40 bg-highlight/10 p-6 sm:p-8">
                        <p className="font-mono text-xs tracking-[0.18em] text-highlight uppercase">
                          {t("results.highlight")}
                        </p>
                        <p className="mt-4 font-display text-5xl text-foreground sm:text-6xl">
                          {tr(lead.result, locale)}
                        </p>
                        <h3 className="mt-3 font-sans text-xl font-semibold tracking-tight">
                          {lead.name}
                        </h3>
                        {lead.members.length > 0 ? (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {t("members")}: {lead.members.join(", ")}
                          </p>
                        ) : null}
                      </article>
                    ) : null}
                    {others.length > 0 ? (
                      <>
                        <h3 className="mt-2 font-mono text-xs tracking-wide text-muted-foreground uppercase">
                          {t("results.teams")}
                        </h3>
                        <ol className="grid gap-3">
                          {others.map((team, i) => (
                            <TeamRow
                              key={`${team.name}-${i}`}
                              name={team.name}
                              result={tr(team.result, locale)}
                              members={team.members}
                              rank={i + 2}
                              membersLabel={t("members")}
                            />
                          ))}
                        </ol>
                      </>
                    ) : null}
                  </div>
                </div>
              </section>
            );
          })}
        </>
      )}

      <section className="border-t border-border section-tone">
        <div className="container-page section-y">
          <SectionHeader
            eyebrow={t("skills.eyebrow")}
            title={t.rich("skills.title", { em })}
            description={t("skills.description")}
          />
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SKILLS.map((key, i) => (
              <li key={key} className="rounded-2xl border border-border bg-card p-6">
                <span className="font-mono text-xs text-highlight">0{i + 1}</span>
                <h3 className="mt-3 font-sans text-lg font-semibold tracking-tight">
                  {t(`skills.items.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`skills.items.${key}.body`)}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-card/60 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">{t("skills.capital")}</p>
            <ButtonLink href="/capital" variant="outline" arrow className="shrink-0">
              {t("skills.capitalCta")}
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container-page section-y">
          <div className="relative isolate overflow-hidden rounded-3xl border border-border-strong p-8 md:p-14">
            <div aria-hidden className="absolute inset-0 -z-10 bg-glow opacity-60" />
            <SectionHeader
              eyebrow={t("next.eyebrow")}
              title={t.rich("next.title", { em: (c) => c })}
              description={t("next.description")}
              action={
                <ButtonLink href="/processo-seletivo" arrow>
                  {t("next.cta")}
                </ButtonLink>
              }
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function Stat({
  label,
  note,
  highlight,
  children,
}: {
  label: string;
  note?: string;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6",
        highlight ? "border-highlight/40 bg-highlight/10" : "border-border bg-card",
      )}
    >
      <dt className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-3 font-display text-4xl text-foreground sm:text-5xl">{children}</dd>
      {note ? <dd className="mt-2 text-sm text-muted-foreground">{note}</dd> : null}
    </div>
  );
}
