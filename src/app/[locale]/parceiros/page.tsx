import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Mail, Newspaper } from "lucide-react";
import { InstagramIcon, LinkedinIcon } from "@/components/brand/social-icons";
import { PageIntro } from "@/components/layout/page-intro";
import { partnerLogo } from "@/components/sections/partner-marquee";
import { ButtonAnchor } from "@/components/ui/button";
import { Carousel } from "@/components/ui/carousel";
import { ItemList } from "@/components/ui/item-list";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { SectionHeader } from "@/components/ui/section-header";
import { pageAlternates } from "@/lib/seo";
import { getPageLocale } from "@/lib/locale";
import { getPartners, getSite, tr } from "@/lib/content";

const PITCH = ["talent", "talks", "challenges", "newsletter"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Partners.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: await pageAlternates("/parceiros"),
  };
}

export default async function PartnersPage() {
  const [t, tCommon, locale] = await Promise.all([
    getTranslations("Partners"),
    getTranslations("Common"),
    getPageLocale(),
  ]);
  const plain = { em: (chunks: ReactNode) => chunks };
  const site = getSite();
  const partners = getPartners();
  const email = site.email ? `mailto:${site.email}` : undefined;

  const iconClass = "size-5";
  const channels = [
    {
      key: "linkedin",
      href: site.linkedin,
      label: t("contact.linkedin.cta"),
      icon: <LinkedinIcon className={iconClass} />,
    },
    {
      key: "instagram",
      href: site.instagram,
      label: t("contact.instagram.cta"),
      icon: <InstagramIcon className={iconClass} />,
    },
    {
      key: "newsletter",
      href: site.newsletterUrl,
      label: t("contact.newsletter.cta"),
      icon: <Newspaper aria-hidden className={iconClass} />,
    },
    ...(email
      ? [
          {
            key: "email",
            href: email,
            label: site.email!,
            icon: <Mail aria-hidden className={iconClass} />,
          },
        ]
      : []),
  ];

  return (
    <main id="content">
      <PageIntro
        eyebrow={t("intro.eyebrow")}
        title={t.rich("intro.title", plain)}
        description={t("intro.description")}
      >
        <div className="flex flex-wrap gap-3">
          {email ? (
            <ButtonAnchor href={email} target="_self" size="lg" arrow>
              {t("pitch.cta")}
            </ButtonAnchor>
          ) : null}
          <ButtonAnchor href={site.linkedin} size="lg" variant={email ? "outline" : "primary"}>
            {t("pitch.ctaLinkedin")}
          </ButtonAnchor>
        </div>
      </PageIntro>

      {/* Who the league has worked with: one card per partner, in a carousel so the list can grow. */}
      <section className="container-page section-y">
        <SectionHeader title={t.rich("list.title", plain)} />
        {partners.length === 0 ? (
          <PlaceholderNote label={tCommon("pending")} className="mt-10">
            {t("list.pending")}
          </PlaceholderNote>
        ) : (
          <div className="mt-8">
            <Carousel prevLabel={t("list.prev")} nextLabel={t("list.next")}>
              {partners.map((p) => (
                <li
                  key={p.id}
                  className="flex w-[78%] shrink-0 snap-start flex-col rounded-2xl bg-card p-6 transition-colors hover:bg-secondary sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]"
                >
                  <div className="flex h-16 items-center">
                    {partnerLogo(p, "h-9 max-w-48") ?? (
                      <span className="font-display text-2xl text-foreground">{p.name}</span>
                    )}
                  </div>
                  <h3 className="mt-6 text-sm font-semibold text-foreground">{p.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {tr(p.relation, locale)}
                  </p>
                </li>
              ))}
            </Carousel>
          </div>
        )}
      </section>

      {/* The offer: header and call to action on the left, ways to collaborate on the right. */}
      <section className="border-t border-border section-tone">
        <div className="container-page grid items-start gap-10 section-y lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="lg:sticky lg:top-24">
            <SectionHeader
              title={t.rich("pitch.title", plain)}
              description={t("pitch.description")}
            />
            {email ? (
              <ButtonAnchor href={email} target="_self" size="lg" arrow className="mt-8">
                {t("pitch.cta")}
              </ButtonAnchor>
            ) : null}
          </div>
          <ItemList
            items={PITCH.map((key, i) => ({
              key,
              marker: String(i + 1).padStart(2, "0"),
              title: t(`pitch.items.${key}.title`),
              body: t(`pitch.items.${key}.body`),
            }))}
          />
        </div>
      </section>

      <section id="contato" className="scroll-mt-24 border-t border-border">
        <div className="container-page section-y">
          <SectionHeader
            title={t.rich("contact.title", plain)}
            description={t("contact.description")}
          />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map(({ key, href, label, icon }) => (
              <li key={key}>
                <a
                  href={href}
                  target={key === "email" ? undefined : "_blank"}
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col rounded-2xl bg-card p-6 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-highlight"
                >
                  <span className="flex items-start justify-between">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-secondary text-highlight transition-colors group-hover:bg-card">
                      {icon}
                    </span>
                    <ArrowUpRight
                      aria-hidden
                      className="size-4 text-highlight transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </span>
                  <span className="mt-5 font-sans text-lg font-semibold tracking-tight text-foreground">
                    {t(`contact.${key}.title`)}
                  </span>
                  <span className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(`contact.${key}.body`)}
                  </span>
                  <span className="mt-auto pt-6 text-sm font-medium break-all text-highlight">
                    {label}
                  </span>
                  {key === "email" ? null : <span className="sr-only">{tCommon("newTab")}</span>}
                </a>
              </li>
            ))}
          </ul>
          {email ? null : (
            <PlaceholderNote label={tCommon("pending")} className="mt-6">
              {t("contact.email.pending")}
            </PlaceholderNote>
          )}
        </div>
      </section>
    </main>
  );
}
