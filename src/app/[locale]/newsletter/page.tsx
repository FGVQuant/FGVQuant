import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageIntro } from "@/components/layout/page-intro";
import { NewsletterCard } from "@/components/cards/newsletter-card";
import { ButtonAnchor } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { ItemList } from "@/components/ui/item-list";
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

/** The recurring sections of every issue, in reading order. */
const SECTIONS = ["personality", "radar", "news", "culture", "jobs"] as const;

export default async function NewsletterPage() {
  const locale = await getPageLocale();
  const t = await getTranslations("Newsletter");
  const em = (chunks: React.ReactNode) => chunks;

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
          <h2 className="mb-6 font-sans text-lg font-semibold tracking-tight">
            {t("featured.eyebrow")}
          </h2>
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
              figure: featuredData.figure,
              figureNote: t("figureNote"),
            }}
            statusLabel={t(`status.${featuredData.status}`)}
            languageLabel={locale === "en" ? t("language") : undefined}
            readLabel={t(`read.${featuredData.status}`)}
          />
        </section>
      ) : null}

      {rest.length > 0 ? (
        <section className="container-page border-t border-border section-y">
          <SectionHeader title={t.rich("archive.title", { em: (chunks) => chunks })} />
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
          title={t.rich("format.title", { em: (chunks) => chunks })}
          description={t("format.description")}
        />
        <ItemList
          className="mt-10"
          items={SECTIONS.map((key, i) => ({
            key,
            marker: i + 1,
            title: t(`format.sections.${key}.title`),
            body: t(`format.sections.${key}.body`),
          }))}
        />
      </section>
    </main>
  );
}
