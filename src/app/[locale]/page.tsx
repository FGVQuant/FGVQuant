import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { MonteCarloHero } from "@/components/hero/monte-carlo-hero";
import { KpiStrip } from "@/components/sections/kpi-strip";
import { JoinCta } from "@/components/sections/join-cta";
import { PartnerMarquee } from "@/components/sections/partner-marquee";
import { QuantVenn, type QuantVennProps } from "@/components/sections/quant-venn";
import { NewsletterCard } from "@/components/cards/newsletter-card";
import { NumberTicker } from "@/components/data/number-ticker";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Carousel } from "@/components/ui/carousel";
import { ItemList } from "@/components/ui/item-list";
import { Link } from "@/i18n/navigation";
import { Em, SectionHeader } from "@/components/ui/section-header";
import { getPageLocale } from "@/lib/locale";
import { pageAlternates } from "@/lib/seo";
import { SITE_URL } from "@/lib/site-url";
import {
  formatEditionInline,
  formatEditionParts,
  formatEditionShort,
  getAreas,
  getCompetitions,
  getEvents,
  getFeaturedIssue,
  getFund,
  getProjects,
  getPartners,
  getSite,
  getStats,
  getStrategies,
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
  const tcap = await getTranslations("Capital");
  const tp = await getTranslations("Projects");
  const intl = intlLocale(locale);

  const stats = getStats();
  const featured = getFeaturedIssue();
  // This semester's projects (the fund has its own section below), then the latest competition results.
  const ongoing = getProjects().filter((p) => p.status === "in-progress" && p.kind !== "fund");
  // Latest competition results, newest first: each card shows the best result and the teams that got it.
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
  const highlights = Array.from({ length: Math.max(ongoing.length, results.length) }).flatMap(
    (_, i) => [
      ...(ongoing[i] ? [{ kind: "project" as const, item: ongoing[i] }] : []),
      ...(results[i] ? [{ kind: "result" as const, item: results[i] }] : []),
    ],
  );
  const fundMonth = formatEditionInline(stats.fundAsOf, locale);
  const fund = getFund();
  const fundRow = fund.overview?.rows.find((r) => r.id === "fund");
  const strategies = getStrategies();
  const num = (n: number) =>
    new Intl.NumberFormat(intl, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  const recruitmentOpen = getSite().recruitment.open === true;
  const hasPartners = getPartners().length > 0;

  // Structured data for Google (Organization + WebSite), built only from facts in the sheet.
  const site = getSite();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "FGV Quant",
        alternateName: (await getTranslations("Brand"))("tagline"),
        url: SITE_URL,
        logo: `${SITE_URL}/apple-icon.png`,
        email: site.email,
        foundingDate: String(site.founded),
        sameAs: [site.instagram, site.linkedin],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "FGV Quant",
        url: SITE_URL,
        inLanguage: locale === "en" ? "en" : "pt-BR",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <main id="content">
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped, so no value can close the script tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
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

      {/* Quem somos (with the study topics) beside the three pillars */}
      <section className="container-page section-y">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
          <div>
            <h2 className="font-display text-3xl leading-[1.1] font-medium tracking-tight text-balance text-foreground md:text-4xl">
              {t("about.titleA")} {t("about.titleEm")}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              {t("about.body")}
            </p>
            <h3 className="mt-8 font-sans text-sm font-medium text-highlight">
              {t("about.topics")}
            </h3>
            <ul className="mt-3 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {getAreas().map((a) => (
                <li key={a.id} className="border-t border-border pt-3">
                  <p className="text-sm font-semibold text-foreground">{tr(a.title, locale)}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {tr(a.description, locale)}
                  </p>
                </li>
              ))}
            </ul>
            <ButtonLink href="/sobre" variant="outline" arrow className="mt-8">
              {t("about.cta")}
            </ButtonLink>
          </div>
          <QuantVenn
            title={t("areas.title")}
            subtitle={t("areas.subtitle")}
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

      {/* FGV Quant Capital: its own section, the headline number beside what the fund is */}
      <section className="border-t border-border section-tone">
        <div className="container-page grid gap-12 section-y lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-sm font-medium text-highlight">{t("capital.eyebrow")}</p>
            <SectionHeader
              className="mt-3"
              title={t("capital.title")}
              description={t("capital.body")}
            />
            {strategies.length > 0 ? (
              <ul className="mt-8 flex flex-wrap gap-2" aria-label={t("capital.strategies")}>
                {strategies.map((st) => (
                  <li key={st.id}>
                    <Badge variant="outline">{tr(st.name, locale)}</Badge>
                  </li>
                ))}
              </ul>
            ) : null}
            <ButtonLink href="/capital" variant="outline" arrow className="mt-8">
              {t("capital.cta")}
            </ButtonLink>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">{t("capital.label")}</p>
              <Badge variant="highlight">{tc("simulated")}</Badge>
            </div>
            <NumberTicker
              value={stats.fundCumulative}
              prefix={stats.fundCumulative > 0 ? "+" : ""}
              suffix="%"
              decimals={2}
              locale={intl}
              className="mt-2 block font-display text-6xl tracking-tight text-foreground sm:text-7xl"
            />
            <p className="mt-2 text-sm text-highlight">
              {t("capital.asOf", { month: fundMonth })}
              {fund.overview
                ? ` · ${tcap("snapshot.vsBenchmark", {
                    benchmark: fund.overview.benchmark,
                    value: `${num(fund.overview.benchmarkReturn)}%`,
                  })}`
                : null}
            </p>
            {fundRow && (fundRow.volatility !== undefined || fundRow.sharpe !== undefined) ? (
              <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-border pt-6">
                {fundRow.volatility !== undefined ? (
                  <div>
                    <dt className="text-sm text-muted-foreground">{tcap("snapshot.volatility")}</dt>
                    <dd className="mt-1 font-mono text-2xl text-foreground tabular-nums">
                      {num(fundRow.volatility)}%
                    </dd>
                  </div>
                ) : null}
                {fundRow.sharpe !== undefined ? (
                  <div>
                    <dt className="text-sm text-muted-foreground">{tcap("snapshot.sharpe")}</dt>
                    <dd className="mt-1 font-mono text-2xl text-foreground tabular-nums">
                      {num(fundRow.sharpe)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>
        </div>
      </section>

      {/* Destaques: ongoing projects and competition results, mixed */}
      {highlights.length > 0 ? (
        <section className="border-t border-border">
          <div className="container-page section-y">
            <div>
              <Carousel
                prevLabel={t("highlights.prev")}
                nextLabel={t("highlights.next")}
                header={
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                    <h2 className="font-display text-3xl leading-[1.1] font-medium tracking-tight text-foreground md:text-4xl">
                      {t("highlights.title")}
                    </h2>
                    <ButtonLink href="/projetos#projetos" variant="link" arrow className="px-0">
                      {t("highlights.projects")}
                    </ButtonLink>
                    <ButtonLink href="/projetos#competicoes" variant="link" arrow className="px-0">
                      {t("highlights.competitions")}
                    </ButtonLink>
                  </div>
                }
              >
                {highlights.map((h) =>
                  h.kind === "project" ? (
                    <HighlightCard
                      key={h.item.id}
                      href="/projetos#projetos"
                      top={
                        <span className="font-mono text-xs tracking-[0.14em] text-highlight uppercase">
                          {tp("projects.inProgress")}
                        </span>
                      }
                      title={tr(h.item.title, locale)}
                      body={<span className="line-clamp-3">{tr(h.item.summary, locale)}</span>}
                      foot={
                        h.item.partner
                          ? tp("projects.partner", { partner: h.item.partner })
                          : undefined
                      }
                    />
                  ) : (
                    <HighlightCard
                      key={h.item.id}
                      href="/projetos#competicoes"
                      top={
                        <span className="font-display text-3xl leading-none whitespace-nowrap text-foreground">
                          {h.item.result}
                        </span>
                      }
                      title={h.item.name}
                      body={h.item.meta}
                      foot={h.item.teams}
                    />
                  ),
                )}
              </Carousel>
            </div>
          </div>
        </section>
      ) : null}

      {/* Newsletter */}
      <section className="border-t border-border section-tone section-y">
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
          {featured ? (
            <NewsletterCard
              featured
              className="mt-12"
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
        </div>
      </section>

      {/* Atividades */}
      <section className="border-t border-border">
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

/** One card in the Destaques carousel: a project in progress or a competition result. */
function HighlightCard(props: {
  href: string;
  top: ReactNode;
  title: string;
  body: ReactNode;
  foot?: string;
}) {
  return (
    <li className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]">
      <Link
        href={props.href}
        className="flex h-full flex-col rounded-2xl border border-transparent bg-card p-6 transition-colors hover:border-border-strong focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <p className="flex min-h-8 items-end">{props.top}</p>
        <h3 className="mt-4 font-sans text-base font-semibold tracking-tight text-foreground">
          {props.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{props.body}</p>
        {props.foot ? (
          <p className="mt-auto pt-3 text-sm font-medium wrap-break-word text-highlight">
            {props.foot}
          </p>
        ) : null}
      </Link>
    </li>
  );
}
