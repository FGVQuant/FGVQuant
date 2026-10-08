import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPageLocale } from "@/lib/locale";
import { getAreas, getTeam, tr } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";
import { PageIntro } from "@/components/layout/page-intro";
import { Em, SectionHeader } from "@/components/ui/section-header";
import { ButtonLink } from "@/components/ui/button";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { MemberCard } from "@/components/cards/member-card";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Team");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: await pageAlternates("/time"),
  };
}

export default async function TeamPage() {
  const locale = await getPageLocale();
  const t = await getTranslations("Team");
  const tCommon = await getTranslations("Common");
  const members = getTeam();
  const areaLabels = new Map(getAreas().map((a) => [a.id, tr(a.title, locale)]));

  return (
    <main id="content">
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t.rich("title", { em: (c) => <Em>{c}</Em> })}
        description={t("lead")}
      />

      <section className="container-page py-20 md:py-24">
        <SectionHeader
          eyebrow={t("leadership.eyebrow")}
          title={t.rich("leadership.title", { em: (c) => <Em>{c}</Em> })}
          description={t("leadership.description")}
        />
        <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {members.map((m) => (
            <li key={m.id}>
              <MemberCard
                name={m.placeholder ? tCommon("pending") : m.name}
                initials={m.placeholder ? "?" : undefined}
                role={tr(m.role, locale)}
                area={m.area ? (areaLabels.get(m.area) ?? m.area) : undefined}
                photo={m.photo ? { ...m.photo, alt: m.name } : undefined}
                linkedin={m.linkedin}
                linkedinLabel={t("linkedinLabel", { name: m.name })}
              />
            </li>
          ))}
        </ul>
        {members.some((m) => m.placeholder) ? (
          <PlaceholderNote label={tCommon("pending")} className="mt-12">
            {t("pending")}
          </PlaceholderNote>
        ) : null}
      </section>

      <section className="container-page border-t border-border py-20 md:py-24">
        <SectionHeader
          eyebrow={t("alumni.eyebrow")}
          title={t.rich("alumni.title", { em: (c) => <Em>{c}</Em> })}
        />
        <div className="mt-12 max-w-3xl rounded-2xl border border-border p-6 glass sm:p-8">
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("alumni.body")}
          </p>
          <p className="mt-4 font-mono text-xs text-muted-foreground">{t("alumni.selfReported")}</p>
          <ButtonLink href="/competicoes" variant="outline" className="mt-6" arrow>
            {t("alumni.cta")}
          </ButtonLink>
        </div>
      </section>

      <section className="container-page border-t border-border py-20 text-center md:py-24">
        <h2 className="mx-auto max-w-2xl font-display text-3xl text-balance sm:text-4xl md:text-5xl">
          {t.rich("cta.title", { em: (c) => <Em>{c}</Em> })}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("cta.body")}</p>
        <div className="mt-8 flex justify-center">
          <ButtonLink href="/processo-seletivo" size="lg" arrow>
            {t("cta.button")}
          </ButtonLink>
        </div>
      </section>
    </main>
  );
}
