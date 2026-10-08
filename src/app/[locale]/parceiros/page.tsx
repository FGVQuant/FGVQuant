import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BookOpenText, Mail, Mic, Puzzle, Users, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { PageIntro } from "@/components/layout/page-intro";
import { LogoMarquee } from "@/components/sections/logo-marquee";
import { ButtonAnchor } from "@/components/ui/button";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { Em, SectionHeader } from "@/components/ui/section-header";
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
  return { title: t("title"), description: t("description") };
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
  const site = getSite();
  const partners = getPartners();

  const channels = [
    {
      key: "instagram",
      icon: <InstagramIcon className="size-5" />,
      href: site.instagram,
    },
    {
      key: "linkedin",
      icon: <LinkedinIcon className="size-5" />,
      href: site.linkedin,
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
      />

      <section className="container-page py-20 md:py-28">
        <SectionHeader
          eyebrow={t("list.eyebrow")}
          title={t.rich("list.title", em)}
          description={t("list.description")}
        />
        {partners.length === 0 ? (
          <PlaceholderNote label={tCommon("pending")} className="mt-10">
            {t("list.pending")}
          </PlaceholderNote>
        ) : (
          <div className="mt-10 space-y-10">
            <LogoMarquee
              label={t("list.marqueeLabel")}
              items={partners.map((p) => ({
                name: p.name,
                href: p.url,
                logo: p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo} alt={p.name} className="h-8 w-auto" />
                ) : undefined,
              }))}
            />
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {partners.map((p) => (
                <li key={p.id} className={cardCls}>
                  <h3 className="font-display text-lg font-medium text-foreground">{p.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {tr(p.relation, locale)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="border-t border-border">
        <div className="container-page py-20 md:py-28">
          <SectionHeader
            eyebrow={t("pitch.eyebrow")}
            title={t.rich("pitch.title", em)}
            description={t("pitch.description")}
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PITCH.map(({ key, icon: Icon }) => (
              <li key={key} className={cardCls}>
                <Icon aria-hidden className="size-5 text-highlight" />
                <h3 className="mt-4 font-display text-lg font-medium text-foreground">
                  {t(`pitch.items.${key}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {t(`pitch.items.${key}.body`)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-10">
            {site.email ? (
              <ButtonAnchor href={`mailto:${site.email}`} target="_self" size="lg" arrow>
                {t("pitch.cta")}
              </ButtonAnchor>
            ) : (
              <ButtonAnchor href={site.linkedin} size="lg" arrow>
                {t("pitch.ctaLinkedin")}
              </ButtonAnchor>
            )}
          </div>
        </div>
      </section>

      <section id="contato" className="scroll-mt-24 border-t border-border">
        <div className="container-page py-20 md:py-28">
          <SectionHeader
            eyebrow={t("contact.eyebrow")}
            title={t.rich("contact.title", em)}
            description={t("contact.description")}
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map(({ key, icon, href }) => (
              <li key={key} className={cardCls}>
                <span className="text-highlight">{icon}</span>
                <h3 className="mt-4 font-display text-lg font-medium text-foreground">
                  {t(`contact.${key}.title`)}
                </h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {t(`contact.${key}.body`)}
                </p>
                <ButtonAnchor href={href} variant="link" arrow className="mt-5 self-start">
                  {t(`contact.${key}.cta`)}
                </ButtonAnchor>
              </li>
            ))}
            <li className={cardCls}>
              <Mail aria-hidden className="size-5 text-highlight" />
              <h3 className="mt-4 font-display text-lg font-medium text-foreground">
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
                <PlaceholderNote label={tCommon("pending")} className="mt-5 p-4">
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
