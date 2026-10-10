import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  Braces,
  CalendarDays,
  LineChart,
  Mail,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getPageLocale } from "@/lib/locale";
import { getAreas, getSite, getStats, intlLocale, tr } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";
import { PageIntro } from "@/components/layout/page-intro";
import { Em, SectionHeader } from "@/components/ui/section-header";
import { ButtonLink } from "@/components/ui/button";
import {
  BentoCard,
  BentoGrid,
  CandlesBg,
  EquationBg,
  NodeGraphBg,
} from "@/components/sections/bento-grid";
import { KpiStrip } from "@/components/sections/kpi-strip";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("About");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: await pageAlternates("/sobre"),
  };
}

const AREA_LAYOUT: Record<string, { span: string; bg: "graph" | "candles" | "eq" | null }> = {
  derivatives: { span: "lg:col-span-4", bg: "eq" },
  ml: { span: "lg:col-span-2", bg: "graph" },
  algo: { span: "lg:col-span-2", bg: "candles" },
  research: { span: "lg:col-span-2", bg: null },
  python: { span: "lg:col-span-2", bg: "graph" },
};

const WAYS: { key: string; href: string; Icon: LucideIcon }[] = [
  { key: "study", href: "/sobre", Icon: Users },
  { key: "research", href: "/newsletter", Icon: Braces },
  { key: "newsletter", href: "/newsletter", Icon: Mail },
  { key: "fund", href: "/capital", Icon: LineChart },
  { key: "competitions", href: "/competicoes", Icon: Trophy },
  { key: "events", href: "/eventos", Icon: CalendarDays },
];

export default async function AboutPage() {
  const locale = await getPageLocale();
  const t = await getTranslations("About");
  const tCommon = await getTranslations("Common");
  const site = getSite();
  const stats = getStats();
  const areas = getAreas();

  return (
    <main id="content">
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t.rich("title", { em: (c) => <Em>{c}</Em> })}
        description={t("lead", { year: site.founded, members: site.members })}
      >
        <ButtonLink href="/parceiros" size="lg" arrow>
          {t("partnerCta")}
        </ButtonLink>
      </PageIntro>

      {/* Partner-facing first: identity, evidence, expertise. Then the student-facing half:
          how we learn, what members do, and how to join. */}
      <section className="section-y">
        <div className="container-page">
          <SectionHeader
            eyebrow={t("numbers.eyebrow")}
            title={t.rich("numbers.title", { em: (chunks) => chunks })}
          />
          <KpiStrip
            className="mt-12"
            locale={intlLocale(locale)}
            items={[
              { label: t("numbers.members"), value: stats.members },
              { label: t("numbers.issues"), value: stats.issues },
              { label: t("numbers.teams"), value: stats.rankedTeams },
              {
                label: t("numbers.fund"),
                value: stats.fundCumulative,
                decimals: 2,
                prefix: stats.fundCumulative > 0 ? "+" : "",
                suffix: "%",
                note: tCommon("simulated"),
              },
            ]}
          />
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            {t("numbers.note", { asOf: site.membersAsOf })}
          </p>
        </div>
      </section>

      <section className="container-page border-t border-border section-y">
        <SectionHeader
          eyebrow={t("areas.eyebrow")}
          title={t.rich("areas.title", { em: (chunks) => chunks })}
          description={t("areas.description")}
        />
        <BentoGrid className="mt-12">
          {areas.map((a, i) => {
            const layout = AREA_LAYOUT[a.id] ?? { span: "lg:col-span-2", bg: null };
            const background =
              layout.bg === "graph" ? (
                <NodeGraphBg />
              ) : layout.bg === "candles" ? (
                <CandlesBg />
              ) : layout.bg === "eq" ? (
                <EquationBg />
              ) : undefined;
            return (
              <BentoCard
                key={a.id}
                eyebrow={String(i + 1).padStart(2, "0")}
                title={tr(a.title, locale)}
                description={tr(a.description, locale)}
                className={layout.span}
                background={background}
              />
            );
          })}
        </BentoGrid>
      </section>

      <section className="container-page grid gap-12 border-t border-border section-y lg:grid-cols-[1fr_1.2fr]">
        <SectionHeader
          eyebrow={t("mission.eyebrow")}
          title={t.rich("mission.title", { em: (chunks) => chunks })}
        />
        <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
          <p>{t("mission.p1")}</p>
          <p>{t("mission.p2")}</p>
        </div>
      </section>

      <section className="container-page border-t border-border section-y">
        <SectionHeader
          eyebrow={t("how.eyebrow")}
          title={t.rich("how.title", { em: (chunks) => chunks })}
          description={t("how.description")}
        />
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WAYS.map(({ key, href, Icon }) => {
            const linked = key !== "study" && key !== "research";
            const body = (
              <>
                <Icon aria-hidden className="size-6 stroke-[1.5] text-highlight" />
                <h3 className="mt-4 font-sans text-xl font-semibold tracking-tight text-foreground">
                  {t(`how.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`how.${key}.body`)}</p>
                {linked ? (
                  <span className="mt-4 inline-block font-mono text-xs text-highlight">
                    {t(`how.${key}.cta`)} →
                  </span>
                ) : null}
              </>
            );
            const cls =
              "block h-full rounded-2xl border border-border bg-card p-6 transition-colors";
            return (
              <li key={key}>
                {linked ? (
                  <Link href={href} className={`${cls} hover:border-border-strong`}>
                    {body}
                  </Link>
                ) : (
                  <div className={cls}>{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="container-page border-t border-border section-y text-center">
        <h2 className="mx-auto max-w-2xl font-display text-3xl text-balance sm:text-4xl md:text-5xl">
          {t.rich("cta.title", { em: (chunks) => chunks })}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("cta.body")}</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/processo-seletivo" size="lg" arrow>
            {t("cta.button")}
          </ButtonLink>
          <ButtonLink href="/time" variant="outline" size="lg">
            {t("cta.team")}
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
