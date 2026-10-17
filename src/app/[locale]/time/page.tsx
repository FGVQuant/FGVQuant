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
  const all = getTeam();
  const members = all.filter((m) => !m.placeholder);
  const pendingRoles = all.filter((m) => m.placeholder);
  const areaLabels = new Map(getAreas().map((a) => [a.id, tr(a.title, locale)]));

  return (
    <main id="content">
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t.rich("title", { em: (c) => <Em>{c}</Em> })}
        description={t("lead")}
      />

      <section className="container-page section-y">
        <SectionHeader
          eyebrow={t("leadership.eyebrow")}
          title={t.rich("leadership.title", { em: (chunks) => chunks })}
          description={t("leadership.description")}
        />
        {members.length > 0 ? (
          <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {members.map((m) => (
              <li key={m.id}>
                <MemberCard
                  name={m.name}
                  role={tr(m.role, locale)}
                  area={m.area ? (areaLabels.get(m.area) ?? m.area) : undefined}
                  photo={m.photo ? { ...m.photo, alt: m.name } : undefined}
                  linkedin={m.linkedin}
                  linkedinLabel={t("linkedinLabel", { name: m.name })}
                />
              </li>
            ))}
          </ul>
        ) : null}
        {pendingRoles.length > 0 ? (
          <>
            <ul
              className={`max-w-3xl divide-y divide-border overflow-hidden rounded-2xl border border-border ${members.length > 0 ? "mt-12" : "mt-10"}`}
            >
              {pendingRoles.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-4"
                >
                  <div>
                    <p className="font-sans text-lg font-semibold tracking-tight text-foreground">
                      {tr(m.role, locale)}
                    </p>
                    {m.area ? (
                      <p className="text-sm text-muted-foreground">
                        {areaLabels.get(m.area) ?? m.area}
                      </p>
                    ) : null}
                  </div>
                  <span className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                    {t("nameTbd")}
                  </span>
                </li>
              ))}
            </ul>
            <PlaceholderNote label={tCommon("pending")} className="mt-6 max-w-3xl">
              {t("pending")}
            </PlaceholderNote>
          </>
        ) : null}
      </section>

      <section className="container-page border-t border-border section-y">
        <SectionHeader
          eyebrow={t("alumni.eyebrow")}
          title={t.rich("alumni.title", { em: (chunks) => chunks })}
        />
        <div className="mt-12 max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            {t("alumni.body")}
          </p>
          <p className="mt-4 font-mono text-xs text-muted-foreground">{t("alumni.selfReported")}</p>
          <ButtonLink href="/desafios" variant="outline" className="mt-6" arrow>
            {t("alumni.cta")}
          </ButtonLink>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container-page section-y">
          <div className="relative isolate overflow-hidden rounded-3xl border border-border-strong p-8 text-center md:p-14">
            <div aria-hidden className="absolute inset-0 -z-10 bg-glow opacity-60" />
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
