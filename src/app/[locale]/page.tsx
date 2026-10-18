import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MonteCarloHero } from "@/components/hero/monte-carlo-hero";
import { KpiStrip } from "@/components/sections/kpi-strip";
import { JoinCta } from "@/components/sections/join-cta";
import { PartnerMarquee } from "@/components/sections/partner-marquee";
import { QuantVenn, type QuantVennProps } from "@/components/sections/quant-venn";
import { NewsletterCard } from "@/components/cards/newsletter-card";
import { NewsletterRow } from "@/components/cards/newsletter-row";
import { NumberTicker } from "@/components/data/number-ticker";
import { ButtonLink } from "@/components/ui/button";
import { ItemList } from "@/components/ui/item-list";
import { Link } from "@/i18n/navigation";
import { Em, SectionHeader } from "@/components/ui/section-header";
import { getPageLocale } from "@/lib/locale";
import { pageAlternates } from "@/lib/seo";
import {
  formatEditionInline,
  formatEditionParts,
  formatEditionShort,
  getCompetitions,
  getEvents,
  getFeaturedIssue,
  getIssues,
  getPartners,
  getSite,
  getStats,
  intlLocale,
  toTimelineItems,
  tr,
} from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Home");
  return { title: { absolute: t("metaTitle") }, alternates: await pageAlternates("/") };
}

export default async function HomePage() {
  const locale = await getPageLocale();
  const t = await getTranslations("Home");
  const tc = await getTranslations("Common");
  const tn = await getTranslations("Newsletter");
  const intl = intlLocale(locale);

  const stats = getStats();
  const featured = getFeaturedIssue();
  const recent = getIssues()
    .filter((i) => i.slug !== featured?.slug)
    .slice(0, 2);
  // Latest competition results, newest first: each row shows the best result and the teams that got it.
  const results = getCompetitions()
    .flatMap((c) => {
      const ranked = c.teams.filter((x) => x.ranked);
      if (ranked.length === 0) return [];
      const best = ranked[0].result;
      return [
        {
          id: c.id,
          name: c.name,
          meta: `${c.organizer} · ${c.year}`,
          result: tr(best, locale),
          teams: ranked
            .filter((x) => x.result.pt === best.pt)
            .map((x) => x.name)
            .join(", "),
        },
      ];
    })
    .slice(0, 4);
  const fundMonth = formatEditionInline(stats.fundAsOf, locale);
  const recruitmentOpen = getSite().recruitment.open === true;
  const hasPartners = getPartners().length > 0;

  return (
    <main id="content">
      <MonteCarloHero
        eyebrow={t("hero.eyebrow")}
        title={
          <>
            {t("hero.titleA")} <Em>{t("hero.titleEm")}</Em>.
          </>
        }
        description={t("hero.description")}
        actions={
          // Partner-first until recruitment has dates; recruitment leads once it opens.
          recruitmentOpen ? (
            <>
              <ButtonLink href="/processo-seletivo" size="lg" arrow>
                {t("hero.join")}
              </ButtonLink>
              <ButtonLink href="/parceiros" size="lg" variant="outline">
                {t("hero.partner")}
              </ButtonLink>
            </>
          ) : (
            <>
              <ButtonLink href="/parceiros" size="lg" arrow>
                {t("hero.partner")}
              </ButtonLink>
              <ButtonLink href="/processo-seletivo" size="lg" variant="outline">
                {t("hero.join")}
              </ButtonLink>
            </>
          )
        }
        legend={t("hero.legend")}
        legendShort={t("hero.legendShort")}
      />

      <section className="container-page">
        <KpiStrip
          locale={intl}
          items={[
            { label: t("stats.members"), value: stats.members },
            { label: t("stats.issues"), value: stats.issues },
            { label: t("stats.ranked"), value: stats.rankedTeams },
          ]}
        />
      </section>

      {/* Parcerias realizadas: right under the numbers, as social proof. */}
      {hasPartners ? (
        <section className="container-page pt-16">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-sans text-sm font-medium text-muted-foreground">
              {t("partners.title")}
            </h2>
            <ButtonLink href="/parceiros" variant="link" arrow className="px-0">
              {t("partners.all")}
            </ButtonLink>
          </div>
          <PartnerMarquee label={t("partners.title")} className="mt-6" />
        </section>
      ) : null}

      {/* Quem somos + destaque em competição */}
      <section className="container-page grid items-center gap-12 section-y lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <SectionHeader
            title={
              <>
                {t("about.titleA")} {t("about.titleEm")}
              </>
            }
            description={t("about.body")}
          />
          <ButtonLink href="/sobre" variant="outline" arrow className="mt-8">
            {t("about.cta")}
          </ButtonLink>
        </div>
        {results.length > 0 ? (
          <CompetitionResults
            eyebrow={t("about.competition.eyebrow")}
            results={results}
            cta={t("about.competition.cta")}
          />
        ) : null}
      </section>

      {/* Áreas */}
      <section className="border-t border-border section-tone">
        <div className="container-page section-y">
          <SectionHeader
            title={
              <>
                {t("areas.titleA")} {t("areas.titleEm")}.
              </>
            }
            description={t("areas.description")}
          />
          <QuantVenn
            className="mt-12"
            regions={t.raw("areas.regions") as QuantVennProps["regions"]}
            labels={{
              area: t("areas.labels.area"),
              intersection: t("areas.labels.intersection"),
              core: t("areas.labels.core"),
              diagram: t("areas.labels.diagram"),
              explore: t("areas.labels.explore"),
            }}
          />
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-border section-y">
        <div className="container-page">
          <SectionHeader
            title={
              <>
                {t("newsletter.titleA")} {t("newsletter.titleEm")}
              </>
            }
            description={t("newsletter.description")}
            action={
              <ButtonLink href="/newsletter" variant="outline" arrow>
                {t("newsletter.all")}
              </ButtonLink>
            }
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {featured ? (
              <NewsletterCard
                featured
                className="lg:col-span-3"
                href={`/newsletter/${featured.slug}`}
                title={featured.title}
                dateLabel={formatEditionShort(featured.edition, locale)}
                coverText={{
                  ...formatEditionParts(featured.edition, locale),
                  series: tn("intro.eyebrow"),
                  figure: featured.figure,
                  figureNote: tn("figureNote"),
                }}
                excerpt={featured.excerpt}
                tags={featured.tags}
                statusLabel={tn(`status.${featured.status}`)}
                languageLabel={locale === "en" ? tn("language") : undefined}
                readLabel={tn(`read.${featured.status}`)}
              />
            ) : null}
            {recent.length > 0 ? (
              <ul className="flex flex-col gap-3 lg:col-span-3">
                {recent.map((issue) => (
                  <li key={issue.slug}>
                    <NewsletterRow
                      href={`/newsletter/${issue.slug}`}
                      title={issue.title}
                      dateLabel={formatEditionShort(issue.edition, locale)}
                      excerpt={issue.excerpt}
                      tags={issue.tags}
                      figure={issue.figure}
                      statusLabel={tn(`status.${issue.status}`)}
                      languageLabel={locale === "en" ? tn("language") : undefined}
                    />
                  </li>
                ))}
              </ul>
            ) : null}
            <CapitalTeaser
              eyebrow={t("capital.eyebrow")}
              title={t("capital.title")}
              body={t("capital.body")}
              label={t("capital.label")}
              asOf={t("capital.asOf", { month: fundMonth })}
              simulated={tc("simulated")}
              cta={t("capital.cta")}
              value={stats.fundCumulative}
              locale={intl}
            />
          </div>
        </div>
      </section>

      {/* Atividades */}
      <section className="border-t border-border section-tone">
        <div className="container-page section-y">
          <SectionHeader
            title={
              <>
                {t("activities.titleA")} {t("activities.titleEm")}
              </>
            }
            action={
              <ButtonLink href="/eventos" variant="outline" arrow>
                {t("activities.all")}
              </ButtonLink>
            }
          />
          {/* Compact: the five most recent; the full list lives on /eventos. */}
          <ItemList
            className="mt-12"
            items={toTimelineItems([...getEvents()].reverse().slice(0, 5), locale).map((e) => ({
              key: e.id,
              marker: e.dateLabel,
              title: e.href ? (
                <Link href={e.href} className="rounded-sm underline-offset-4 hover:underline">
                  {e.title}
                </Link>
              ) : (
                e.title
              ),
              body: (
                <>
                  <span className="text-sm text-highlight">{tc(`kinds.${e.kind}`)}</span>
                  {e.description ? <span className="mt-1 block">{e.description}</span> : null}
                </>
              ),
            }))}
          />
        </div>
      </section>

      <JoinCta />
    </main>
  );
}

function CapitalTeaser(props: {
  eyebrow: string;
  title: string;
  body: string;
  label: string;
  asOf: string;
  simulated: string;
  cta: string;
  value: number;
  locale: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-8 rounded-2xl bg-card p-6 lg:col-span-3 lg:flex-row lg:items-end lg:gap-12 lg:p-8">
      <div className="lg:max-w-xl">
        <p className="text-sm font-medium text-highlight">{props.eyebrow}</p>
        <h3 className="mt-3 font-sans text-xl font-semibold tracking-tight">{props.title}</h3>
        <p className="mt-3 text-sm text-muted-foreground">{props.body}</p>
      </div>
      <div className="lg:shrink-0">
        <p className="text-sm text-muted-foreground">{props.label}</p>
        <NumberTicker
          value={props.value}
          prefix={props.value > 0 ? "+" : ""}
          suffix="%"
          decimals={2}
          locale={props.locale}
          className="mt-1 block text-5xl text-foreground"
        />
        <p className="mt-2 text-sm text-highlight">
          {props.simulated} · {props.asOf}
        </p>
        <ButtonLink href="/capital" variant="link" arrow className="mt-4 px-0">
          {props.cta}
        </ButtonLink>
      </div>
    </div>
  );
}

/** The league's competition record: one ruled row per competition, the result as the focal point. */
function CompetitionResults(props: {
  eyebrow: string;
  results: { id: string; name: string; meta: string; result: string; teams: string }[];
  cta: string;
}) {
  return (
    <article className="rounded-2xl bg-card p-6 sm:p-8">
      <p className="text-sm font-medium text-highlight">{props.eyebrow}</p>
      <ul className="mt-4 divide-y divide-border">
        {props.results.map((r) => (
          <li
            key={r.id}
            className="grid grid-cols-[6.5rem_1fr] items-center gap-4 py-4 sm:grid-cols-[8rem_1fr]"
          >
            <p className="font-display text-2xl leading-none text-foreground sm:text-3xl">
              {r.result}
            </p>
            <div className="min-w-0">
              <h3 className="font-sans text-base font-semibold tracking-tight text-foreground">
                {r.name}
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{r.meta}</p>
              <p className="mt-1 text-sm font-medium wrap-break-word text-highlight">{r.teams}</p>
            </div>
          </li>
        ))}
      </ul>
      <ButtonLink href="/projetos#competicoes" variant="link" arrow className="mt-2 px-0">
        {props.cta}
      </ButtonLink>
    </article>
  );
}
