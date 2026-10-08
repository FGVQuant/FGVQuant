import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BrainCircuit, Code2, FlaskConical, LineChart, Sigma } from "lucide-react";
import type { ReactNode } from "react";
import { MonteCarloHero } from "@/components/hero/monte-carlo-hero";
import { TerminalPanel } from "@/components/terminal/terminal-panel";
import { KpiStrip } from "@/components/sections/kpi-strip";
import { DriftTimeline } from "@/components/sections/drift-timeline";
import {
  BentoCard,
  BentoGrid,
  CandlesBg,
  EquationBg,
  NodeGraphBg,
} from "@/components/sections/bento-grid";
import { NewsletterCard } from "@/components/cards/newsletter-card";
import { NumberTicker } from "@/components/data/number-ticker";
import { ButtonLink } from "@/components/ui/button";
import { Em, SectionHeader } from "@/components/ui/section-header";
import { getPageLocale } from "@/lib/locale";
import {
  formatEdition,
  formatEditionShort,
  getAreas,
  getEvents,
  getFeaturedIssue,
  getIssues,
  getStats,
  toTimelineItems,
  tr,
} from "@/lib/content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Home");
  return { title: { absolute: t("metaTitle") } };
}

/** Visual treatment per focus area (ids from content/areas.json). */
const AREA_STYLE: Record<string, { icon: ReactNode; span: string; bg?: ReactNode }> = {
  derivatives: { icon: <Sigma />, span: "lg:col-span-4", bg: <CandlesBg /> },
  ml: { icon: <BrainCircuit />, span: "lg:col-span-2", bg: <NodeGraphBg /> },
  algo: { icon: <LineChart />, span: "lg:col-span-2" },
  research: { icon: <FlaskConical />, span: "lg:col-span-2", bg: <EquationBg /> },
  python: { icon: <Code2 />, span: "lg:col-span-2" },
};

export default async function HomePage() {
  const locale = await getPageLocale();
  const t = await getTranslations("Home");
  const tc = await getTranslations("Common");
  const intlLocale = locale === "pt" ? "pt-BR" : "en-US";

  const stats = getStats();
  const featured = getFeaturedIssue();
  const recent = getIssues()
    .filter((i) => i.slug !== featured.slug)
    .slice(0, 2);
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
            <ButtonLink href="/newsletter" size="lg" variant="outline">
              {t("hero.newsletter")}
            </ButtonLink>
          </>
        }
        legend={t("hero.legend")}
      />

      <section className="container-page">
        <KpiStrip
          locale={intlLocale}
          items={[
            { label: t("stats.members"), value: stats.members },
            { label: t("stats.issues"), value: stats.issues },
            { label: t("stats.ranked"), value: stats.rankedTeams },
            {
              label: t("stats.fund"),
              value: stats.fundCumulative,
              prefix: "+",
              suffix: "%",
              decimals: 2,
              note: t("stats.fundNote", { month: fundMonth }),
            },
          ]}
        />
      </section>

      {/* Quem somos + terminal */}
      <section className="container-page grid items-center gap-12 py-24 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div>
          <SectionHeader
            eyebrow={t("about.eyebrow")}
            title={
              <>
                {t("about.titleA")} <Em>{t("about.titleEm")}</Em>
              </>
            }
            description={t("about.body")}
          />
          <ButtonLink href="/sobre" variant="outline" arrow className="mt-8">
            {t("about.cta")}
          </ButtonLink>
        </div>
        <TerminalPanel
          title={t("terminal.title")}
          introCommand={t("terminal.introCommand")}
          introLines={[t("terminal.intro1"), t("terminal.intro2"), t("terminal.intro3")]}
          commands={[
            { name: "join", description: t("terminal.cmdJoin"), href: "/processo-seletivo" },
            { name: "newsletter", description: t("terminal.cmdNewsletter"), href: "/newsletter" },
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
      </section>

      {/* Áreas */}
      <section className="border-t border-border py-24">
        <div className="container-page">
          <SectionHeader
            eyebrow={t("areas.eyebrow")}
            title={
              <>
                {t("areas.titleA")} <Em>{t("areas.titleEm")}</Em>.
              </>
            }
            description={t("areas.description")}
          />
          <BentoGrid className="mt-12">
            {getAreas().map((area) => {
              const style = AREA_STYLE[area.id];
              return (
                <BentoCard
                  key={area.id}
                  title={tr(area.title, locale)}
                  description={tr(area.description, locale)}
                  icon={style?.icon}
                  background={style?.bg}
                  className={style?.span}
                />
              );
            })}
          </BentoGrid>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-border py-24">
        <div className="container-page">
          <SectionHeader
            eyebrow={t("newsletter.eyebrow")}
            title={
              <>
                {t("newsletter.titleA")} <Em>{t("newsletter.titleEm")}</Em>
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
            <NewsletterCard
              featured
              className="lg:col-span-3"
              href={`/newsletter/${featured.slug}`}
              title={featured.title}
              dateLabel={formatEditionShort(featured.edition, locale)}
              excerpt={featured.excerpt}
              tags={featured.tags}
              readLabel={t("newsletter.read")}
            />
            {recent.map((issue) => (
              <NewsletterCard
                key={issue.slug}
                className="lg:col-span-1"
                href={`/newsletter/${issue.slug}`}
                title={issue.title}
                dateLabel={formatEditionShort(issue.edition, locale)}
                excerpt={issue.excerpt}
                tags={issue.tags}
                readLabel={t("newsletter.read")}
              />
            ))}
            <CapitalTeaser
              eyebrow={t("capital.eyebrow")}
              title={t("capital.title")}
              body={t("capital.body")}
              label={t("capital.label")}
              asOf={t("capital.asOf", { month: fundMonth })}
              simulated={tc("simulated")}
              cta={t("capital.cta")}
              value={stats.fundCumulative}
              locale={intlLocale}
            />
          </div>
        </div>
      </section>

      {/* Atividades */}
      <section className="border-t border-border py-24">
        <div className="container-page">
          <SectionHeader
            eyebrow={t("activities.eyebrow")}
            title={
              <>
                {t("activities.titleA")} <Em>{t("activities.titleEm")}</Em>
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

      {/* Join CTA */}
      <section className="relative isolate overflow-hidden border-t border-border">
        <div aria-hidden className="absolute inset-0 -z-10 bg-glow" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_60%_80%_at_50%_100%,black,transparent_75%)]"
        />
        <div className="container-page flex flex-col items-center py-28 text-center">
          <p className="font-mono text-xs tracking-[0.18em] text-highlight uppercase">
            {t("join.eyebrow")}
          </p>
          <h2 className="mt-5 max-w-3xl font-display text-4xl text-balance md:text-6xl">
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
    <div className="flex flex-col justify-between gap-8 rounded-2xl p-6 glass lg:col-span-1">
      <div>
        <p className="font-mono text-xs tracking-[0.18em] text-highlight uppercase">
          {props.eyebrow}
        </p>
        <h3 className="mt-3 font-display text-2xl">{props.title}</h3>
        <p className="mt-3 text-sm text-muted-foreground">{props.body}</p>
      </div>
      <div>
        <p className="font-mono text-[0.7rem] tracking-wide text-muted-foreground uppercase">
          {props.label}
        </p>
        <NumberTicker
          value={props.value}
          prefix="+"
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
