import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { PageIntro } from "@/components/layout/page-intro";
import { Badge } from "@/components/ui/badge";
import { ButtonAnchor } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { getProjects, getSite, tr } from "@/lib/content";
import { getPageLocale } from "@/lib/locale";
import { pageAlternates } from "@/lib/seo";

/** Trainee program topics, in the order the classes run. */
const TOPICS = [
  "statistics",
  "econometrics",
  "strategies",
  "portfolios",
  "fixedIncome",
  "derivatives",
  "programming",
  "ai",
] as const;
const FORMAT = ["classes", "assessments", "project"] as const;
const FACTS = ["frequency", "next", "prerequisites", "audience"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Join.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: await pageAlternates("/processo-seletivo"),
  };
}

/** Titles render plain: headline emphasis is reserved for the home hero. */
function plain(t: Awaited<ReturnType<typeof getTranslations>>, key: string): ReactNode {
  return t.rich(key, { em: (chunks) => chunks });
}

const index = (i: number) => String(i + 1).padStart(2, "0");

export default async function JoinPage() {
  const [t, locale] = await Promise.all([getTranslations("Join"), getPageLocale()]);
  const { recruitment, instagram, linkedin } = getSite();

  const statusKey =
    recruitment.open === true ? "open" : recruitment.open === false ? "closed" : "tbd";
  const canApply = recruitment.open !== false && Boolean(recruitment.formUrl);
  // Recruitment runs every semester; `next` (the sheet's Entidade tab) is the upcoming cycle, e.g. "2027.1".
  const next = { next: recruitment.next };
  const trainee = getProjects().filter((p) => p.kind === "trainee");

  return (
    <main id="content">
      <PageIntro
        eyebrow={t("intro.eyebrow")}
        title={plain(t, "intro.title")}
        description={t("intro.description", next)}
      >
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="highlight" className="px-3.5 py-2 text-xs">
            <span className="sr-only">{t("status.label")}: </span>
            {t(`status.${statusKey}`, next)}
          </Badge>
          {canApply && recruitment.formUrl ? (
            <ButtonAnchor href={recruitment.formUrl} size="lg" arrow>
              {t("apply")}
            </ButtonAnchor>
          ) : null}
        </div>
      </PageIntro>

      {/* Key facts at a glance */}
      <section className="container-page pt-12 md:pt-16">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border lg:grid-cols-4">
          {FACTS.map((key) => (
            <div key={key} className="bg-card p-5 md:p-6">
              <dt className="text-sm text-muted-foreground">{t(`facts.${key}.label`)}</dt>
              <dd className="mt-2 font-display text-2xl text-foreground md:text-3xl">
                {t(`facts.${key}.value`, next)}
              </dd>
            </div>
          ))}
        </dl>
        {/* Follow the league's channels to hear when applications open. */}
        <div className="mt-4 flex flex-col gap-4 rounded-2xl bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <p className="text-sm text-muted-foreground md:text-base">{t("notify.description")}</p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <ButtonAnchor href={instagram} size="sm" arrow>
              {t("notify.instagram")}
            </ButtonAnchor>
            <ButtonAnchor href={linkedin} variant="outline" size="sm" arrow>
              {t("notify.linkedin")}
            </ButtonAnchor>
          </div>
        </div>
      </section>

      {/* Trainee program: what you learn */}
      <section className="container-page section-y">
        <SectionHeader title={plain(t, "build.title")} description={t("build.description")} />
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOPICS.map((key, i) => (
            <li
              key={key}
              className="group relative flex flex-col rounded-2xl bg-card p-6 transition-colors hover:bg-secondary"
            >
              <span className="font-mono text-xs text-highlight tabular-nums">{index(i)}</span>
              <h3 className="mt-4 font-sans text-lg font-semibold tracking-tight text-foreground">
                {t(`build.items.${key}`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`build.descriptions.${key}`)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Program format, as a sequence (same rule-and-dot pattern as the path on /sobre) */}
      <section className="border-t border-border section-tone">
        <div className="container-page section-y">
          <SectionHeader title={t("build.formatTitle")} />
          <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
            {FORMAT.map((key, i) => (
              <li key={key} className="relative border-t border-border pt-6">
                <span
                  aria-hidden
                  className="absolute top-[-5px] left-0 size-[9px] rounded-full bg-highlight ring-4 ring-background"
                />
                <p className="font-mono text-xs text-highlight tabular-nums">{index(i)}</p>
                <h3 className="mt-2 font-sans text-lg font-semibold tracking-tight text-foreground">
                  {t(`build.format.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`build.format.${key}.body`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Final projects of past cycles: real photos from the presentations (league's Instagram). */}
      {trainee.length > 0 ? (
        <section className="border-t border-border">
          <div className="container-page section-y">
            <SectionHeader title={t("projects.title")} description={t("projects.description")} />
            <ul className="mt-12 grid gap-6 md:grid-cols-2">
              {trainee.map((p) => (
                <li key={p.id} className="flex flex-col overflow-hidden rounded-2xl bg-card">
                  {p.photo ? (
                    <div className="relative aspect-[16/10] bg-secondary">
                      <Image
                        src={p.photo.src}
                        alt={tr(p.title, locale)}
                        width={p.photo.width}
                        height={p.photo.height}
                        placeholder={p.photo.blurDataURL ? "blur" : "empty"}
                        blurDataURL={p.photo.blurDataURL}
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="absolute inset-0 size-full object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-mono text-highlight tabular-nums">{p.period}</span>
                      {p.award ? <Badge variant="highlight">{tr(p.award, locale)}</Badge> : null}
                    </p>
                    <h3 className="mt-3 font-sans text-xl font-semibold tracking-tight text-foreground">
                      {tr(p.title, locale)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {tr(p.summary, locale)}
                    </p>
                    {p.members.length > 0 ? (
                      <p className="mt-auto pt-4 text-sm text-muted-foreground">
                        <span className="text-foreground">{t("projects.members")}:</span>{" "}
                        {p.members.join(", ")}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}
