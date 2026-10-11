import type { Metadata } from "next";
import { pageAlternates } from "@/lib/seo";
import { getTranslations } from "next-intl/server";
import { DriftTimeline, type TimelineKind } from "@/components/sections/drift-timeline";
import { PageIntro } from "@/components/layout/page-intro";
import { ButtonAnchor } from "@/components/ui/button";
import { Em, SectionHeader } from "@/components/ui/section-header";
import { getEvents, getSite, toTimelineItems } from "@/lib/content";
import { getPageLocale } from "@/lib/locale";

const KINDS: TimelineKind[] = ["event", "competition", "class", "visit", "milestone"];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Events.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: await pageAlternates("/eventos"),
  };
}

export default async function EventsPage() {
  const [t, locale] = await Promise.all([getTranslations("Events"), getPageLocale()]);
  const em = { em: (chunks: React.ReactNode) => <Em>{chunks}</Em> };
  const plain = { em: (chunks: React.ReactNode) => chunks };

  const items = toTimelineItems(getEvents(), locale);
  const kindLabels = Object.fromEntries(KINDS.map((k) => [k, t(`kinds.${k}`)])) as Record<
    TimelineKind,
    string
  >;

  return (
    <main id="content">
      <PageIntro
        eyebrow={t("intro.eyebrow")}
        title={t.rich("intro.title", em)}
        description={t("intro.description")}
      />

      <section className="container-page section-y">
        <SectionHeader
          eyebrow={t("timeline.eyebrow")}
          title={t.rich("timeline.title", plain)}
          description={t("timeline.description")}
        />
        <DriftTimeline
          className="mt-14"
          items={items}
          kindLabels={kindLabels}
          ariaLabel={t("timeline.ariaLabel")}
          linkLabel={t("timeline.linkLabel")}
        />
      </section>

      <section className="border-t border-border">
        <div className="container-page section-y">
          <div className="relative isolate overflow-hidden rounded-3xl border border-border-strong p-8 md:p-14">
            <div aria-hidden className="absolute inset-0 -z-10 bg-glow opacity-60" />
            <SectionHeader
              eyebrow={t("cta.eyebrow")}
              title={t.rich("cta.title", plain)}
              description={t("cta.description")}
            />
            <div className="mt-8">
              <ButtonAnchor href={getSite().instagram} size="lg" arrow>
                {t("cta.button")}
              </ButtonAnchor>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
