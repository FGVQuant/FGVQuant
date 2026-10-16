import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSite } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";
import { PageIntro } from "@/components/layout/page-intro";
import { BullMotif } from "@/components/layout/intro-motifs";
import { SectionHeader } from "@/components/ui/section-header";
import { ButtonLink } from "@/components/ui/button";
import { ItemList } from "@/components/ui/item-list";
import { getPageLocale } from "@/lib/locale";
import { TeamSection } from "./_components/team-section";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("About");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: await pageAlternates("/sobre"),
  };
}

/** What members do. Study groups and research have no page of their own, so no link. */
const WAYS: { key: string; href?: string }[] = [
  { key: "study" },
  { key: "research" },
  { key: "newsletter", href: "/newsletter" },
  { key: "fund", href: "/capital" },
  { key: "competitions", href: "/eventos#competicoes" },
  { key: "events", href: "/eventos" },
];

export default async function AboutPage() {
  const t = await getTranslations("About");
  const locale = await getPageLocale();
  const site = getSite();

  return (
    <main id="content">
      <PageIntro
        motif={<BullMotif />}
        eyebrow={t("eyebrow")}
        title={t.rich("title", { em: (c) => c })}
        description={t("lead", { year: site.founded, members: site.members })}
      >
        <ButtonLink href="/parceiros" size="lg" arrow>
          {t("partnerCta")}
        </ButtonLink>
      </PageIntro>

      {/* Partner-facing first: identity and mission. Then the student-facing half: what members
          do, who leads the league, and how to join. Numbers and focus areas live on Home. */}
      <section className="container-page grid gap-12 section-y lg:grid-cols-[1fr_1.2fr]">
        <SectionHeader title={t.rich("mission.title", { em: (chunks) => chunks })} />
        <div className="space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
          <p>{t("mission.p1")}</p>
          <p>{t("mission.p2")}</p>
        </div>
      </section>

      <section className="border-t border-border section-tone">
        <div className="container-page section-y">
          <SectionHeader
            title={t.rich("how.title", { em: (chunks) => chunks })}
            description={t("how.description")}
          />
          <ItemList
            className="mt-12"
            items={WAYS.map(({ key, href }) => ({
              key,
              title: t(`how.${key}.title`),
              body: t(`how.${key}.body`),
              action: href ? (
                <ButtonLink href={href} variant="link" arrow>
                  {t(`how.${key}.cta`)}
                </ButtonLink>
              ) : undefined,
            }))}
          />
        </div>
      </section>

      <TeamSection locale={locale} />

      <section className="border-t border-border">
        <div className="container-page section-y">
          <div className="rounded-3xl bg-card p-8 text-center md:p-14">
            <h2 className="mx-auto max-w-2xl font-display text-3xl text-balance sm:text-4xl md:text-5xl">
              {t.rich("cta.title", { em: (chunks) => chunks })}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("cta.body")}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/processo-seletivo" size="lg" arrow>
                {t("cta.button")}
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
