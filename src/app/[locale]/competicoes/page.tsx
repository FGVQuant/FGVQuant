import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageIntro } from "@/components/layout/page-intro";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { Em, SectionHeader } from "@/components/ui/section-header";
import { getPageLocale } from "@/lib/locale";
import { getCompetitions, tr } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";
import { TeamRow } from "./_components/team-row";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Competitions");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: await pageAlternates("/competicoes"),
  };
}

export default async function CompetitionsPage() {
  const locale = await getPageLocale();
  const t = await getTranslations("Competitions");
  const tCommon = await getTranslations("Common");
  const competitions = getCompetitions();

  return (
    <main id="content">
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t.rich("title", { em: (c) => <Em>{c}</Em> })}
        description={t("description")}
      />

      <section className="container-page section-y">
        {competitions.length === 0 ? (
          <PlaceholderNote label={tCommon("pending")}>{t("empty")}</PlaceholderNote>
        ) : (
          <div className="flex flex-col gap-20">
            {competitions.map((c) => (
              <article key={c.id} aria-labelledby={`comp-${c.id}`}>
                <SectionHeader
                  as="h2"
                  eyebrow={`${c.organizer} · ${c.year}`}
                  title={<span id={`comp-${c.id}`}>{c.name}</span>}
                  description={tr(c.summary, locale)}
                  action={
                    c.source ? (
                      <ButtonAnchor href={c.source} variant="outline" arrow>
                        {t("source")}
                      </ButtonAnchor>
                    ) : undefined
                  }
                />
                <ol className="mt-10 grid gap-3">
                  {c.teams.map((team, i) => (
                    <TeamRow
                      key={`${team.name}-${i}`}
                      name={team.name}
                      result={tr(team.result, locale)}
                      members={team.members}
                      rank={i + 1}
                      membersLabel={t("members")}
                    />
                  ))}
                </ol>
                {c.selfReported ? (
                  <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">{t("selfReportedBadge")}</Badge>
                    {t("selfReported")}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border">
        <div className="container-page section-y">
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
      </section>
    </main>
  );
}
