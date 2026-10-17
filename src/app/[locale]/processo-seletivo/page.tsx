import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { PageIntro } from "@/components/layout/page-intro";
import { Badge } from "@/components/ui/badge";
import { ButtonAnchor } from "@/components/ui/button";
import { ItemList } from "@/components/ui/item-list";
import { SectionHeader } from "@/components/ui/section-header";
import { getSite } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";
import { Faq, type FaqItem } from "./_components/faq";

/** Trainee program topics, in the order the classes run. */
const TOPICS = ["statistics", "econometrics", "strategies", "portfolios", "fixedIncome", "derivatives"] as const;
const FORMAT = ["classes", "assessments", "project"] as const;

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
        title={plain(t, "intro.title")}
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
        <SectionHeader title={plain(t, "how.title")} description={t("how.description")} />
        <SectionHeader title={plain(t, "who.title")} description={t("who.body")} />
      </section>

      <section className="border-t border-border section-tone">
        <div className="container-page section-y">
          <SectionHeader title={plain(t, "build.title")} description={t("build.description")} />
          <ItemList
            className="mt-12"
            items={TOPICS.map((key) => ({
              key,
              title: t(`build.items.${key}`),
              body: t(`build.descriptions.${key}`),
            }))}
          />

          <h3 className="mt-16 font-sans text-xl font-semibold tracking-tight">
            {t("build.formatTitle")}
          </h3>
          <ItemList
            className="mt-6"
            items={FORMAT.map((key, i) => ({
              key,
              marker: i + 1,
              title: t(`build.format.${key}.title`),
              body: t(`build.format.${key}.body`),
            }))}
          />
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container-page grid gap-10 section-y lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <SectionHeader title={plain(t, "faq.title")} />
          <Faq items={faq} />
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container-page section-y">
          <div className="rounded-3xl bg-card p-8 md:p-14">
            <SectionHeader title={plain(t, "notify.title")} description={t("notify.description")} />
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
