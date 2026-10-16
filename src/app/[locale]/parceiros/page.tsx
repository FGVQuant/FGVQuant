import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { PageIntro } from "@/components/layout/page-intro";
import { LogoMarquee } from "@/components/sections/logo-marquee";
import { ButtonAnchor } from "@/components/ui/button";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { SectionHeader } from "@/components/ui/section-header";
import { pageAlternates } from "@/lib/seo";
import { getPageLocale } from "@/lib/locale";
import { getPartners, getSite, tr } from "@/lib/content";
import { ItemList } from "@/components/ui/item-list";

const PITCH = ["talent", "talks", "challenges", "newsletter"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Partners.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: await pageAlternates("/parceiros"),
  };
}

const cardCls =
  "relative flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-border-strong";

export default async function PartnersPage() {
  const [t, tCommon, locale] = await Promise.all([
    getTranslations("Partners"),
    getTranslations("Common"),
    getPageLocale(),
  ]);
  const plain = { em: (chunks: ReactNode) => chunks };
  const site = getSite();
  const partners = getPartners();

  const channels = [
    { key: "linkedin", href: site.linkedin },
    { key: "instagram", href: site.instagram },
    { key: "newsletter", href: site.newsletterUrl },
  ];

  return (
    <main id="content">
      <PageIntro
        eyebrow={t("intro.eyebrow")}
        title={t.rich("intro.title", plain)}
        description={t("intro.description")}
      >
        <ButtonAnchor href={site.linkedin} size="lg" arrow>
          {t("pitch.ctaLinkedin")}
        </ButtonAnchor>
      </PageIntro>

      <section>
        <div className="container-page section-y">
          <SectionHeader
            title={t.rich("pitch.title", plain)}
            description={t("pitch.description")}
          />
          <ItemList
            className="mt-12"
            items={PITCH.map((key) => ({
              key,
              title: t(`pitch.items.${key}.title`),
              body: t(`pitch.items.${key}.body`),
            }))}
          />
          {site.email ? (
            <div className="mt-10">
              <ButtonAnchor href={`mailto:${site.email}`} target="_self" size="lg" arrow>
                {t("pitch.cta")}
              </ButtonAnchor>
            </div>
          ) : null}
        </div>
      </section>

      {partners.length === 0 ? (
        <section className="container-page section-y-tight pt-0">
          <PlaceholderNote label={tCommon("pending")}>{t("list.pending")}</PlaceholderNote>
        </section>
      ) : (
        <section className="border-t border-border">
          <div className="container-page section-y">
            <SectionHeader
              title={t.rich("list.title", plain)}
              description={t("list.description")}
            />
            <div className="mt-10 space-y-10">
              <LogoMarquee
                label={t("list.marqueeLabel")}
                items={partners.map((p) => ({
                  name: p.name,
                  href: p.url,
                  logo: p.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.logo}
                      alt={p.name}
                      width={160}
                      height={32}
                      loading="lazy"
                      className="h-8 w-auto"
                    />
                  ) : undefined,
                }))}
              />
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {partners.map((p) => (
                  <li key={p.id} className={cardCls}>
                    <h3 className="font-sans text-lg font-semibold tracking-tight text-foreground">
                      {p.name}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {tr(p.relation, locale)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <section id="contato" className="scroll-mt-24 border-t border-border">
        <div className="container-page section-y">
          <SectionHeader
            title={t.rich("contact.title", plain)}
            description={t("contact.description")}
          />
          <ItemList
            className="mt-12"
            items={[
              ...channels.map(({ key, href }) => ({
                key,
                title: t(`contact.${key}.title`),
                body: t(`contact.${key}.body`),
                action: (
                  <ButtonAnchor
                    href={href}
                    variant={key === "linkedin" ? "primary" : "outline"}
                    size="sm"
                    arrow
                  >
                    {t(`contact.${key}.cta`)}
                  </ButtonAnchor>
                ),
              })),
              {
                key: "email",
                title: t("contact.email.title"),
                body: site.email ? (
                  t("contact.email.body")
                ) : (
                  <>
                    {t("contact.email.body")}
                    <PlaceholderNote label={tCommon("pending")} className="mt-3 p-3 text-xs">
                      {t("contact.email.pending")}
                    </PlaceholderNote>
                  </>
                ),
                action: site.email ? (
                  <ButtonAnchor href={`mailto:${site.email}`} target="_self" variant="link">
                    {site.email}
                  </ButtonAnchor>
                ) : undefined,
              },
            ]}
          />
        </div>
      </section>
    </main>
  );
}
