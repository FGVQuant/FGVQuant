import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ChartColumn,
  ChartLine,
  ChartPie,
  ChartScatter,
  Landmark,
  Sigma,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageIntro } from "@/components/layout/page-intro";
import { Badge } from "@/components/ui/badge";
import { ButtonAnchor } from "@/components/ui/button";
import { Em, SectionHeader } from "@/components/ui/section-header";
import { getSite } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";
import { Faq, type FaqItem } from "./_components/faq";

/** Trainee program topics, in the order the classes run. */
const TOPICS: { key: string; icon: LucideIcon }[] = [
  { key: "statistics", icon: ChartColumn },
  { key: "econometrics", icon: ChartScatter },
  { key: "strategies", icon: ChartLine },
  { key: "portfolios", icon: ChartPie },
  { key: "fixedIncome", icon: Landmark },
  { key: "derivatives", icon: Sigma },
];
const FORMAT = ["classes", "assessments", "project"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Join.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: await pageAlternates("/processo-seletivo"),
  };
}

/** Wraps the text between <em> tags in <Em>. */
function rich(t: Awaited<ReturnType<typeof getTranslations>>, key: string): ReactNode {
  return t.rich(key, { em: (chunks) => <Em>{chunks}</Em> });
}

/** Section (h2) titles stay plain: gradient emphasis is reserved for the page h1. */
function plain(t: Awaited<ReturnType<typeof getTranslations>>, key: string): ReactNode {
  return t.rich(key, { em: (chunks) => chunks });
}

export default async function JoinPage() {
  const t = await getTranslations("Join");
  const { recruitment, instagram, linkedin } = getSite();

  const statusKey =
    recruitment.open === true ? "open" : recruitment.open === false ? "closed" : "tbd";
  const canApply = recruitment.open !== false && Boolean(recruitment.formUrl);
  const faq = t.raw("faq.items") as FaqItem[];

  return (
    <main id="content">
      <PageIntro
        eyebrow={t("intro.eyebrow")}
        title={rich(t, "intro.title")}
        description={t("intro.description")}
      >
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="highlight" className="px-3.5 py-2 text-xs">
            <span className="sr-only">{t("status.label")}: </span>
            {t(`status.${statusKey}`)}
          </Badge>
          {canApply && recruitment.formUrl ? (
            <ButtonAnchor href={recruitment.formUrl} size="lg" arrow>
              {t("apply")}
            </ButtonAnchor>
          ) : null}
        </div>
      </PageIntro>

      <section className="container-page grid gap-12 section-y md:grid-cols-2 md:gap-16">
        <SectionHeader
          eyebrow={t("how.eyebrow")}
          title={plain(t, "how.title")}
          description={t("how.description")}
        />
        <SectionHeader
          eyebrow={t("who.eyebrow")}
          title={plain(t, "who.title")}
          description={t("who.body")}
        />
      </section>

      <section className="border-t border-border section-tone">
        <div className="container-page section-y">
          <SectionHeader
            eyebrow={t("build.eyebrow")}
            title={plain(t, "build.title")}
            description={t("build.description")}
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map(({ key, icon: Icon }) => (
              <li
                key={key}
                className="flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-border-strong"
              >
                <Icon aria-hidden className="size-5 text-highlight" />
                <h3 className="mt-4 font-sans text-lg font-semibold tracking-tight text-foreground">
                  {t(`build.items.${key}`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t(`build.descriptions.${key}`)}
                </p>
              </li>
            ))}
          </ul>

          <h3 className="mt-16 font-mono text-xs tracking-[0.18em] text-highlight uppercase">
            {t("build.formatTitle")}
          </h3>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {FORMAT.map((key, i) => (
              <li key={key} className="rounded-2xl border border-border bg-card/60 p-5">
                <span className="font-mono text-xs text-highlight">0{i + 1}</span>
                <p className="mt-3 font-sans text-lg font-semibold tracking-tight text-foreground">
                  {t(`build.format.${key}.title`)}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t(`build.format.${key}.body`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container-page grid gap-10 section-y lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <SectionHeader eyebrow={t("faq.eyebrow")} title={plain(t, "faq.title")} />
          <Faq items={faq} />
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container-page section-y">
          <div className="relative isolate overflow-hidden rounded-3xl border border-border-strong p-8 md:p-14">
            <div aria-hidden className="absolute inset-0 -z-10 bg-glow opacity-60" />
            <SectionHeader
              eyebrow={t("notify.eyebrow")}
              title={plain(t, "notify.title")}
              description={t("notify.description")}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonAnchor href={instagram} size="lg" arrow>
                {t("notify.instagram")}
              </ButtonAnchor>
              <ButtonAnchor href={linkedin} variant="outline" size="lg" arrow>
                {t("notify.linkedin")}
              </ButtonAnchor>
              {canApply && recruitment.formUrl ? (
                <ButtonAnchor href={recruitment.formUrl} variant="ghost" size="lg">
                  {t("apply")}
                </ButtonAnchor>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
