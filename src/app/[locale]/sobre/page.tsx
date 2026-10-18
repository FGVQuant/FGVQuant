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
import { JoinCta } from "@/components/sections/join-cta";
import { Testimonials } from "./_components/testimonials";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("About");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: await pageAlternates("/sobre"),
  };
}

/** What members do, each with the page that shows it. */
const WAYS: { key: string; href?: string }[] = [
  { key: "projects", href: "/projetos#projetos" },
  { key: "newsletter", href: "/newsletter" },
  { key: "fund", href: "/capital" },
  { key: "competitions", href: "/projetos#competicoes" },
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

      {/* Partner-facing first: identity. Then a member's path through the league. Then the student-facing half: what members
          do, what members say about it (the team itself lives on /equipe), and how to join. Numbers and focus areas live on Home. */}
      {/* A member's path, left to right: recruitment → trainee program → teams → the market. */}
      <section className="container-page section-y">
        <SectionHeader title={t("path.title")} />
        <ol className="mt-12 grid gap-8 md:grid-cols-4 md:gap-6">
          {(t.raw("path.steps") as { title: string; body: string }[]).map((step, i) => (
            <li key={step.title} className="relative border-t border-border pt-6">
              <span
                aria-hidden
                className="absolute -top-[5px] left-0 size-[9px] rounded-full bg-highlight ring-4 ring-background"
              />
              <p className="font-mono text-xs text-highlight tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-sans text-lg font-semibold tracking-tight text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
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

      <Testimonials locale={locale} />

      <JoinCta />
    </main>
  );
}
