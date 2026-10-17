import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageIntro } from "@/components/layout/page-intro";
import { getPageLocale } from "@/lib/locale";
import { pageAlternates } from "@/lib/seo";
import { TeamSection } from "./_components/team-section";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Team.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: await pageAlternates("/equipe"),
  };
}

export default async function TeamPage() {
  const t = await getTranslations("Team.intro");
  const locale = await getPageLocale();

  return (
    <main id="content">
      <PageIntro eyebrow={t("eyebrow")} title={t("title")} description={t("description")} />
      <TeamSection locale={locale} />
    </main>
  );
}
