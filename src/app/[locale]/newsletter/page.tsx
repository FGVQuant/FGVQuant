import type { Metadata } from "next";
import { ArrowUpRight, Briefcase, Compass, Newspaper, Radar, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageIntro } from "@/components/layout/page-intro";
import { NewsletterCard } from "@/components/cards/newsletter-card";
import { ButtonAnchor } from "@/components/ui/button";
import { Em, SectionHeader } from "@/components/ui/section-header";
import { getFeaturedIssue, getIssues, getIssueTags, getSite } from "@/lib/content";
import { getPageLocale } from "@/lib/locale";
import { pageAlternates } from "@/lib/seo";
import { IssueArchive } from "./_components/issue-archive";
import { toCardData } from "./_lib/issues";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Newsletter.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: await pageAlternates("/newsletter"),
  };
}

const SECTIONS = [
  { key: "personality", Icon: Sparkles },
  { key: "radar", Icon: Radar },
  { key: "news", Icon: Newspaper },
  { key: "culture", Icon: Compass },
  { key: "jobs", Icon: Briefcase },
] as const;

export default async function NewsletterPage() {
  const locale = await getPageLocale();
  const t = await getTranslations("Newsletter");
  const em = (chunks: React.ReactNode) => <Em>{chunks}</Em>;

  const site = getSite();
  const issues = getIssues();
  const featured = getFeaturedIssue();
  const rest = issues.filter((i) => i.slug !== featured?.slug).map((i) => toCardData(i, locale));
  const restTags = new Set(rest.flatMap((i) => i.tags));
  const tags = getIssueTags().filter((tag) => restTags.has(tag));
  const featuredData = featured ? toCardData(featured, locale) : null;

  return (
    <main id="content">
      <PageIntro
        eyebrow={t("intro.eyebrow")}
        title={t.rich("intro.title", { em })}
        description={t("intro.description")}
      >
        <div className="flex flex-col items-start gap-4">
          <ButtonAnchor size="lg" href={site.newsletterUrl}>
            {t("intro.subscribe")}
            <ArrowUpRight aria-hidden className="size-4" />
          </ButtonAnchor>
          {locale === "en" ? (
            <p className="text-sm text-muted-foreground">{t("intro.enNote")}</p>
          ) : null}
        </div>
      </PageIntro>

      {featuredData ? (
        <section className="container-page border-t border-border section-y">
          <p className="mb-6 font-mono text-xs tracking-[0.18em] text-highlight uppercase">
            {t("featured.eyebrow")}
          </p>
          <NewsletterCard
            featured
            href={`/newsletter/${featuredData.slug}`}
            title={featuredData.title}
            dateLabel={featuredData.dateLabel}
            excerpt={featuredData.excerpt}
            tags={featuredData.tags}
            coverText={{
              month: featuredData.month,
              year: featuredData.year,
              series: t("intro.eyebrow"),
            }}
            statusLabel={t(`status.${featuredData.status}`)}
            languageLabel={locale === "en" ? t("language") : undefined}
            readLabel={t(`read.${featuredData.status}`)}
          />
        </section>
      ) : null}

      {rest.length > 0 ? (
        <section className="container-page border-t border-border section-y">
          <SectionHeader
            eyebrow={t("archive.eyebrow")}
            title={t.rich("archive.title", { em: (chunks) => chunks })}
          />
          <div className="mt-10">
            <IssueArchive
              issues={rest}
              tags={tags}
              labels={{
                filter: t("archive.filterLabel"),
                all: t("archive.all"),
                empty: t("archive.empty"),
              }}
            />
          </div>
        </section>
      ) : null}

      <section className="container-page border-t border-border section-y">
        <SectionHeader
          eyebrow={t("format.eyebrow")}
          title={t.rich("format.title", { em: (chunks) => chunks })}
          description={t("format.description")}
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SECTIONS.map(({ key, Icon }, i) => (
            <li key={key} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <Icon aria-hidden className="size-5 text-highlight" />
                <span className="font-mono text-xs text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-4 font-sans text-lg leading-snug font-semibold tracking-tight">
                {t(`format.sections.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(`format.sections.${key}.body`)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
