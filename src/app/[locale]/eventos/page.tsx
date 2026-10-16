import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { DriftTimeline, type TimelineKind } from "@/components/sections/drift-timeline";
import { PageIntro } from "@/components/layout/page-intro";
import { PodiumMotif } from "@/components/layout/intro-motifs";
import { TeamRow } from "@/components/cards/team-row";
import { Badge } from "@/components/ui/badge";
import { ButtonAnchor } from "@/components/ui/button";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { SectionHeader } from "@/components/ui/section-header";
import { getCompetitions, getEvents, getSite, toTimelineItems, tr } from "@/lib/content";
import { getPageLocale } from "@/lib/locale";

const KINDS: TimelineKind[] = ["event", "competition", "class", "visit", "milestone"];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Events.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: await pageAlternates("/eventos"),
  };
}

/** Events and competitions on one page (the old /competicoes redirects to #competicoes). */
export default async function EventsPage() {
  const [t, tc, tCommon, locale] = await Promise.all([
    getTranslations("Events"),
    getTranslations("Competitions"),
    getTranslations("Common"),
    getPageLocale(),
  ]);
  const plain = { em: (chunks: React.ReactNode) => chunks };

  const items = toTimelineItems(getEvents(), locale);
  const kindLabels = Object.fromEntries(KINDS.map((k) => [k, t(`kinds.${k}`)])) as Record<
    TimelineKind,
    string
  >;
  const competitions = getCompetitions();
  // Highlight the podium step of the first ranked team of the latest competition ("2º lugar" → 2).
  const topRank = Number(
    competitions[0]?.teams.find((team) => team.ranked)?.result.pt.match(/^\d/)?.[0],
  );
  const podium = topRank === 1 || topRank === 2 || topRank === 3 ? topRank : undefined;

  return (
    <main id="content">
      <PageIntro
        motif={<PodiumMotif highlight={podium} />}
        eyebrow={t("intro.eyebrow")}
        title={t.rich("intro.title", plain)}
        description={t("intro.description")}
      />

      <section id="competicoes" className="container-page scroll-mt-24 section-y">
        <SectionHeader title={tc.rich("title", plain)} description={tc("description")} />
        {competitions.length === 0 ? (
          <PlaceholderNote label={tCommon("pending")} className="mt-12">
            {tc("empty")}
          </PlaceholderNote>
        ) : (
          <div className="mt-14 flex flex-col gap-16">
            {competitions.map((c) => (
              <article
                key={c.id}
                aria-labelledby={`comp-${c.id}`}
                className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-16"
              >
                <div>
                  <h3 id={`comp-${c.id}`} className="font-display text-3xl tracking-tight">
                    {c.name}
                  </h3>
                  <p className="mt-2 text-sm text-foreground">
                    {c.organizer} · {c.year}
                  </p>
                  <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                    {tr(c.summary, locale)}
                  </p>
                  {c.source ? (
                    <ButtonAnchor href={c.source} variant="outline" arrow className="mt-6">
                      {tc("source")}
                    </ButtonAnchor>
                  ) : null}
                </div>
                <div>
                  <ol className="grid gap-3">
                    {c.teams.map((team, i) => (
                      <TeamRow
                        key={`${team.name}-${i}`}
                        name={team.name}
                        result={tr(team.result, locale)}
                        members={team.members}
                        rank={i + 1}
                        membersLabel={tc("members")}
                      />
                    ))}
                  </ol>
                  {c.selfReported ? (
                    <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{tc("selfReportedBadge")}</Badge>
                      {tc("selfReported")}
                    </p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border section-tone">
        <div className="container-page section-y">
          <SectionHeader
            title={t.rich("timeline.title", plain)}
            description={t("timeline.description")}
          />
          <DriftTimeline
            className="mt-14"
            items={items}
            kindLabels={kindLabels}
            ariaLabel={t("timeline.ariaLabel")}
            linkLabel={t("timeline.linkLabel")}
          />
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container-page section-y">
          <div className="rounded-3xl bg-card p-8 md:p-14">
            <SectionHeader title={t.rich("cta.title", plain)} description={t("cta.description")} />
            <div className="mt-8">
              <ButtonAnchor href={getSite().instagram} size="lg" arrow>
                {t("cta.button")}
              </ButtonAnchor>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
