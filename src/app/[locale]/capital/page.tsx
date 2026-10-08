import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { NumberTicker } from "@/components/data/number-ticker";
import { PageIntro } from "@/components/layout/page-intro";
import { Badge } from "@/components/ui/badge";
import { ButtonAnchor } from "@/components/ui/button";
import { PlaceholderNote } from "@/components/ui/placeholder-note";
import { Em, SectionHeader } from "@/components/ui/section-header";
import { getPageLocale } from "@/lib/locale";
import { formatEdition, formatEditionShort, getFund, getSite } from "@/lib/content";
import { Disclaimer } from "./_components/disclaimer";
import { MonthlyBars } from "./_components/monthly-bars";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Capital");
  return { title: t("meta.title"), description: t("meta.description") };
}

export default async function CapitalPage() {
  const locale = await getPageLocale();
  const t = await getTranslations("Capital");
  const tCommon = await getTranslations("Common");
  const fund = getFund();
  const site = getSite();
  const intl = locale === "pt" ? "pt-BR" : "en-US";

  const pct = (n: number) =>
    `${n > 0 ? "+" : ""}${new Intl.NumberFormat(intl, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n)}%`;

  const bars = [...fund.monthly]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((m) => ({
      key: m.month,
      label: formatEditionShort(m.month, locale),
      value: m.return,
      valueLabel: pct(m.return),
    }));
  const asOf = formatEdition(fund.cumulativeAsOf, locale);
  const summary = bars.map((b) => `${b.label} ${b.valueLabel}`).join(", ");
  const disclaimerItems = [
    t("disclaimer.simulated"),
    t("disclaimer.noMoney"),
    t("disclaimer.past"),
    t("disclaimer.advice"),
  ];
  const purposes = ["construction", "risk", "reporting"] as const;

  return (
    <main id="content">
      <PageIntro
        eyebrow={t("eyebrow")}
        title={t.rich("title", { em: (c) => <Em>{c}</Em> })}
        description={t("description")}
      >
        <Badge variant="highlight">{tCommon("simulated")}</Badge>
      </PageIntro>

      <section className="container-page pt-10">
        <Disclaimer title={t("disclaimer.title")} items={disclaimerItems} />
      </section>

      <section className="container-page py-16 md:py-24">
        <SectionHeader eyebrow={t("results.eyebrow")} title={t("results.title")} />
        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-2">
            <p className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
              {t("results.cumulative")}
            </p>
            <p className="mt-4">
              <NumberTicker
                value={fund.cumulativeReturn}
                decimals={2}
                prefix="+"
                suffix="%"
                locale={intl}
                className="text-5xl text-foreground sm:text-6xl"
              />
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant="highlight">{tCommon("simulated")}</Badge>
              <Badge variant="outline">{t("results.asOf", { date: asOf })}</Badge>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
                {t("results.monthly")}
              </h3>
              <Badge variant="highlight">{tCommon("simulated")}</Badge>
            </div>
            <div className="mt-6">
              <MonthlyBars
                bars={bars}
                ariaLabel={t("results.chartLabel", { summary })}
                tableCaption={t("results.tableCaption")}
                monthHeader={t("results.month")}
                returnHeader={t("results.return")}
              />
            </div>
          </div>
        </div>
        <PlaceholderNote label={tCommon("pending")} className="mt-6">
          {t("results.pendingNote")}
        </PlaceholderNote>
      </section>

      <section className="border-t border-border">
        <div className="container-page py-16 md:py-24">
          <SectionHeader
            eyebrow={t("how.eyebrow")}
            title={t.rich("how.title", { em: (c) => <Em>{c}</Em> })}
            description={t("how.description")}
          />
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {purposes.map((key, i) => (
              <li key={key} className="rounded-2xl border border-border bg-card p-6">
                <span className="font-mono text-xs text-highlight">0{i + 1}</span>
                <h3 className="mt-3 font-display text-xl">{t(`how.items.${key}.title`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`how.items.${key}.body`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="container-page flex flex-col gap-8 py-16 md:py-24">
          <SectionHeader
            eyebrow={t("reports.eyebrow")}
            title={t("reports.title")}
            description={t("reports.description")}
            action={
              <ButtonAnchor href={site.linkedin} variant="outline" arrow>
                {t("reports.cta")}
              </ButtonAnchor>
            }
          />
          <Disclaimer title={t("disclaimer.title")} items={disclaimerItems} />
          <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ArrowUpRight aria-hidden className="size-3.5" />
            {t("reports.source")}
          </p>
        </div>
      </section>
    </main>
  );
}
