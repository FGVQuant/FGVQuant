import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BookOpenText, Mail, Mic, Puzzle, Users, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageIntro } from "@/components/layout/page-intro";
import { LogoMarquee } from "@/components/sections/logo-marquee";
import { ButtonAnchor } from "@/components/ui/button";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { Em, SectionHeader } from "@/components/ui/section-header";
import { cn } from "@/lib/utils";
import { pageAlternates } from "@/lib/seo";
import { getPageLocale } from "@/lib/locale";
import { getPartners, getSite, tr } from "@/lib/content";
import { InstagramIcon, LinkedinIcon } from "./_components/brand-icons";

const PITCH: { key: string; icon: LucideIcon }[] = [
  { key: "talent", icon: Users },
  { key: "talks", icon: Mic },
  { key: "challenges", icon: Puzzle },
  { key: "newsletter", icon: BookOpenText },
];

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
  const em = { em: (chunks: ReactNode) => <Em>{chunks}</Em> };
  const plain = { em: (chunks: ReactNode) => chunks };
  const site = getSite();
  const partners = getPartners();

  const channels = [
    {
      key: "linkedin",
      icon: <LinkedinIcon className="size-5" />,
      href: site.linkedin,
    },
    {
      key: "instagram",
      icon: <InstagramIcon className="size-5" />,
      href: site.instagram,
    },
    {
      key: "newsletter",
      icon: <BookOpenText aria-hidden className="size-5" />,
      href: site.newsletterUrl,
    },
  ];

  return (
    <main id="content">
      <PageIntro
        eyebrow={t("intro.eyebrow")}
        title={t.rich("intro.title", em)}
        description={t("intro.description")}
      >
        <ButtonAnchor href={site.linkedin} size="lg" arrow>
          {t("pitch.ctaLinkedin")}
        </ButtonAnchor>
      </PageIntro>

      <section>
        <div className="container-page section-y">
          <SectionHeader
            eyebrow={t("pitch.eyebrow")}
            title={t.rich("pitch.title", plain)}
            description={t("pitch.description")}
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PITCH.map(({ key, icon: Icon }) => (
              <li key={key} className={cardCls}>
                <Icon aria-hidden className="size-5 text-highlight" />
                <h3 className="mt-4 font-sans text-lg font-semibold tracking-tight text-foreground">
                  {t(`pitch.items.${key}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t(`pitch.items.${key}.body`)}
                </p>
              </li>
            ))}
          </ul>
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
              eyebrow={t("list.eyebrow")}
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
            eyebrow={t("contact.eyebrow")}
            title={t.rich("contact.title", plain)}
            description={t("contact.description")}
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map(({ key, icon, href }) => (
              <li
                key={key}
                className={cn(cardCls, key === "linkedin" && "border-highlight/40 bg-card/80")}
              >
                <span className="text-highlight">{icon}</span>
                <h3 className="mt-4 font-sans text-lg font-semibold tracking-tight text-foreground">
                  {t(`contact.${key}.title`)}
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {t(`contact.${key}.body`)}
                </p>
                <ButtonAnchor
                  href={href}
                  variant={key === "linkedin" ? "primary" : "link"}
                  arrow
                  className="mt-5 self-start"
                >
                  {t(`contact.${key}.cta`)}
                </ButtonAnchor>
              </li>
            ))}
            <li className={cardCls}>
              <Mail aria-hidden className="size-5 text-highlight" />
              <h3 className="mt-4 font-sans text-lg font-semibold tracking-tight text-foreground">
                {t("contact.email.title")}
              </h3>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                {t("contact.email.body")}
              </p>
              {site.email ? (
                <ButtonAnchor
                  href={`mailto:${site.email}`}
                  target="_self"
                  variant="link"
                  className="mt-5 self-start"
                >
                  {site.email}
                </ButtonAnchor>
              ) : (
                <PlaceholderNote label={tCommon("pending")} className="mt-5 p-3 text-xs">
                  {t("contact.email.pending")}
                </PlaceholderNote>
              )}
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
