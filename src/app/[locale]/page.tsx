import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { MonteCarloHero } from "@/components/hero/monte-carlo-hero";
import { TerminalPanel } from "@/components/terminal/terminal-panel";
import { KpiStrip } from "@/components/sections/kpi-strip";
import { DriftTimeline } from "@/components/sections/drift-timeline";
import { BentoCard, BentoGrid } from "@/components/sections/bento-grid";
import { AreaBackground } from "@/components/sections/area-backgrounds";
import { NewsletterCard } from "@/components/cards/newsletter-card";
import { NewsletterRow } from "@/components/cards/newsletter-row";
import { NumberTicker } from "@/components/data/number-ticker";
import { ButtonLink } from "@/components/ui/button";
import { Em, SectionHeader } from "@/components/ui/section-header";
import { getPageLocale } from "@/lib/locale";
import { pageAlternates } from "@/lib/seo";
import {
  formatEdition,
  formatEditionParts,
  formatEditionShort,
  getAreas,
  getCompetitions,
  getEvents,
  getFeaturedIssue,
  getIssues,
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

/** Bento span per focus area (ids from content/areas.json). The illustration names the area, so no icon. */
const AREA_SPAN: Record<string, string> = {
  derivatives: "lg:col-span-4",
  ml: "lg:col-span-2",
  algo: "lg:col-span-2",
  research: "lg:col-span-2",
  python: "lg:col-span-2",
};

export default async function HomePage() {
  const locale = await getPageLocale();
  const t = await getTranslations("Home");
  const tc = await getTranslations("Common");
  const tn = await getTranslations("Newsletter");
  const tcp = await getTranslations("Competitions");
  const ta = await getTranslations("About");
  const intl = intlLocale(locale);

  const stats = getStats();
  const featured = getFeaturedIssue();
  const recent = getIssues()
    .filter((i) => i.slug !== featured?.slug)
    .slice(0, 2);
  // Most recent competition: first ranked team is the focal result, the rest are secondary.
  const latest = getCompetitions()[0];
  const ranked = latest?.teams.filter((x) => x.ranked) ?? [];
  const competition =
    latest && ranked.length > 0
      ? {
          name: latest.name,
          organizer: latest.organizer,
          year: latest.year,
          source: latest.source,
          selfReported: latest.selfReported,
          lead: { team: ranked[0].name, result: tr(ranked[0].result, locale) },
          others: ranked.slice(1).map((x) => ({ team: x.name, result: tr(x.result, locale) })),
        }
      : null;
  const fundMonth = formatEdition(stats.fundAsOf, locale);

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
          <>
            <ButtonLink href="/processo-seletivo" size="lg" arrow>
              {t("hero.join")}
            </ButtonLink>
            <ButtonLink href="/parceiros" size="lg" variant="outline">
              {t("hero.partner")}
            </ButtonLink>
          </>
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
        <p className="mt-4 text-xs text-muted-foreground">
          {ta("numbers.note", { asOf: getSite().membersAsOf })}
        </p>
      </section>

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
        {competition ? (
          <CompetitionHighlight
            eyebrow={t("about.competition.eyebrow")}
            name={competition.name}
            meta={`${competition.organizer} · ${competition.year}`}
            lead={competition.lead}
            others={competition.others}
            selfReported={
              competition.selfReported
                ? { badge: tcp("selfReportedBadge"), note: tcp("selfReported") }
                : undefined
            }
            source={competition.source}
            sourceText={t("about.competition.source")}
            sourceLabel={t("about.competition.sourceLabel", { organizer: competition.organizer })}
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
          <BentoGrid className="mt-12">
            {getAreas().map((area) => {
              return (
                <BentoCard
                  key={area.id}
                  title={tr(area.title, locale)}
                  description={tr(area.description, locale)}
                  background={<AreaBackground id={area.id} />}
                  className={AREA_SPAN[area.id]}
                />
              );
            })}
          </BentoGrid>
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
          <DriftTimeline
            className="mt-12"
            items={toTimelineItems([...getEvents()].reverse(), locale)}
            kindLabels={{
              event: tc("kinds.event"),
              competition: tc("kinds.competition"),
              class: tc("kinds.class"),
              visit: tc("kinds.visit"),
              milestone: tc("kinds.milestone"),
            }}
            ariaLabel={tc("timelineLabel")}
          />
        </div>
      </section>

      {/* Terminal (opcional) */}
      <section className="border-t border-border section-y">
        <div className="container-page">
          <SectionHeader
            title={t("terminalSection.title")}
            description={t("terminalSection.description")}
          />
          <div className="mt-12 max-w-3xl">
            <TerminalPanel
              title={t("terminal.title")}
              introCommand={t("terminal.introCommand")}
              introLines={[t("terminal.intro1"), t("terminal.intro2"), t("terminal.intro3")]}
              commands={[
                { name: "join", description: t("terminal.cmdJoin"), href: "/processo-seletivo" },
                {
                  name: "newsletter",
                  description: t("terminal.cmdNewsletter"),
                  href: "/newsletter",
                },
                { name: "capital", description: t("terminal.cmdCapital"), href: "/capital" },
                { name: "team", description: t("terminal.cmdTeam"), href: "/time" },
                { name: "about", description: t("terminal.cmdAbout"), href: "/sobre" },
                {
                  name: "motto",
                  description: t("terminal.cmdMotto"),
                  output: [(await getTranslations("Brand"))("motto")],
                },
              ]}
              labels={{
                hint: t("terminal.hint"),
                helpHeading: t("terminal.helpHeading"),
                notFound: t.raw("terminal.notFound") as string, // {cmd} filled in by the terminal
                navigating: t.raw("terminal.navigating") as string, // {path} filled in by the terminal
                inputLabel: t("terminal.inputLabel"),
                chipsLabel: t("terminal.chipsLabel"),
              }}
            />
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="border-t border-border section-tone">
        <div className="container-page flex flex-col items-center section-y text-center">
          <h2 className="max-w-3xl font-display text-4xl text-balance md:text-6xl">
            {t("join.title")}
          </h2>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{t("join.body")}</p>
          <ButtonLink href="/processo-seletivo" size="lg" arrow className="mt-10">
            {t("join.cta")}
          </ButtonLink>
        </div>
      </section>
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
    <div className="flex flex-col justify-between gap-8 rounded-2xl border border-border bg-card p-6 lg:col-span-3 lg:flex-row lg:items-end lg:gap-12 lg:p-8">
      <div className="lg:max-w-xl">
        <p className="font-mono text-xs tracking-[0.18em] text-highlight uppercase">
          {props.eyebrow}
        </p>
        <h3 className="mt-3 font-sans text-xl font-semibold tracking-tight">{props.title}</h3>
        <p className="mt-3 text-sm text-muted-foreground">{props.body}</p>
      </div>
      <div className="lg:shrink-0">
        <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
          {props.label}
        </p>
        <NumberTicker
          value={props.value}
          prefix={props.value > 0 ? "+" : ""}
          suffix="%"
          decimals={2}
          locale={props.locale}
          className="mt-1 block font-mono text-5xl text-foreground"
        />
        <p className="mt-2 font-mono text-xs text-highlight">
          {props.simulated} · {props.asOf}
        </p>
        <ButtonLink href="/capital" variant="link" arrow className="mt-4 px-0">
          {props.cta}
        </ButtonLink>
      </div>
    </div>
  );
}

/** Compact, sourced achievement card: the lead result is the focal point. */
function CompetitionHighlight(props: {
  eyebrow: string;
  name: string;
  meta: string;
  lead: { team: string; result: string };
  others: { team: string; result: string }[];
  /** Shown only for results the league reported itself (`selfReported` in content). */
  selfReported?: { badge: string; note: string };
  source?: string;
  sourceText: string;
  sourceLabel: string;
  cta: string;
}) {
  return (
    <article className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div>
        <p className="font-mono text-xs tracking-[0.18em] text-highlight uppercase">
          {props.eyebrow}
        </p>
        <h3 className="mt-3 font-sans text-xl font-semibold tracking-tight">{props.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{props.meta}</p>
      </div>
      <div>
        <p className="font-display text-5xl text-balance sm:text-6xl">{props.lead.result}</p>
        <p className="mt-2 font-mono text-sm break-words text-highlight">{props.lead.team}</p>
      </div>
      {props.others.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {props.others.map((o) => (
            <li
              key={o.team}
              className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted-foreground"
            >
              <span className="text-foreground">{o.team}</span> · {o.result}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="text-xs text-muted-foreground">
        {props.selfReported ? (
          <>
            <span className="mr-2 inline-block rounded-full border border-border px-2 py-0.5 font-mono text-xs tracking-wide uppercase">
              {props.selfReported.badge}
            </span>
            {props.selfReported.note}
          </>
        ) : null}
        {props.source ? (
          <>
            {" "}
            <a
              href={props.source}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={props.sourceLabel}
              className="inline-flex items-center gap-0.5 rounded-sm underline underline-offset-4 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {props.sourceText}
              <ArrowUpRight aria-hidden className="size-3" />
            </a>
          </>
        ) : null}
      </p>
      <ButtonLink href="/competicoes" variant="link" arrow className="self-start px-0">
        {props.cta}
      </ButtonLink>
    </article>
  );
}
