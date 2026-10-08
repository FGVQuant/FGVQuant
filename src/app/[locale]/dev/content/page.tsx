import { notFound } from "next/navigation";
import { locale as rootLocale } from "next/root-params";
import { devSamples } from "#site/content";
import { routing, type Locale } from "@/i18n/routing";
import { MdxContent } from "@/components/mdx/mdx-content";
import { DriftTimeline } from "@/components/sections/drift-timeline";
import { KpiStrip } from "@/components/sections/kpi-strip";
import {
  formatEdition,
  getEvents,
  getFeaturedIssue,
  getFund,
  getIssues,
  getStats,
  toTimelineItems,
} from "@/lib/content";

export const metadata = { title: "Conteúdo (dev)", robots: { index: false } };

/** Dev-only check of the Phase 3 content layer: real content through the helpers + MDX/KaTeX prose. */
export default async function ContentShowcase() {
  if (process.env.NODE_ENV === "production") notFound();
  const raw = await rootLocale();
  const locale: Locale = (routing.locales as readonly string[]).includes(raw)
    ? (raw as Locale)
    : "pt";

  const stats = getStats();
  const fund = getFund();
  const featured = getFeaturedIssue();
  const sample = devSamples.find((d) => d.path === "_dev/prose");

  return (
    <main id="content" className="pb-24">
      <section className="container-page py-16">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          3 · getStats() → KpiStrip
        </p>
        <KpiStrip
          className="mt-6"
          items={[
            { label: "Membros", value: stats.members },
            { label: "Edições da newsletter", value: stats.issues },
            { label: "Times ranqueados", value: stats.rankedTeams },
            {
              label: "FGV Quant Capital",
              value: stats.fundCumulative,
              prefix: "+",
              suffix: "%",
              decimals: 2,
              note: `Fundo fictício · até ${formatEdition(stats.fundAsOf, locale)}`,
            },
          ]}
        />
      </section>

      <section className="container-page border-t border-border py-16">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          3 · getIssues()
        </p>
        <ul className="mt-6 divide-y divide-border font-mono text-sm">
          {getIssues().map((i) => (
            <li key={i.slug} className="flex flex-wrap gap-x-6 gap-y-1 py-3">
              <span className="w-40 text-highlight">{formatEdition(i.edition, locale)}</span>
              <span className="flex-1 text-foreground">{i.title}</span>
              <span className="text-muted-foreground">{i.status}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted-foreground">
          Fundo: {fund.monthly.map((m) => `${m.month} ${m.return}%`).join(" · ")} — acumulado +
          {fund.cumulativeReturn}% (fictício)
        </p>
      </section>

      <section className="container-page border-t border-border py-16">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          3 · getEvents() → DriftTimeline
        </p>
        <DriftTimeline className="mt-6" items={toTimelineItems(getEvents(), locale)} />
      </section>

      <section className="container-page border-t border-border py-16">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          3 · MdxContent — featured issue ({featured.slug})
        </p>
        <h2 className="mt-6 font-display text-3xl">{featured.title}</h2>
        <MdxContent code={featured.body} className="mt-6" />
      </section>

      {sample ? (
        <section className="container-page border-t border-border py-16">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            3 · MdxContent — prose + KaTeX fixture
          </p>
          <h2 className="mt-6 font-display text-3xl">{sample.title}</h2>
          <MdxContent code={sample.body} className="mt-6" />
        </section>
      ) : null}
    </main>
  );
}
