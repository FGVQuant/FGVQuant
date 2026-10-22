import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { NumberTicker } from "@/components/data/number-ticker";
import { PageIntro } from "@/components/layout/page-intro";
import { StrategiesMotif } from "@/components/layout/intro-motifs";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { ButtonAnchor, buttonVariants } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { getPageLocale } from "@/lib/locale";
import {
  formatEdition,
  formatEditionShort,
  getFund,
  getSite,
  getStrategies,
  intlLocale,
  tr,
} from "@/lib/content";
import { pageAlternates } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { Disclaimer } from "./_components/disclaimer";
import { PanelTabs } from "./_components/panel-tabs";
import { FundLineChart } from "./_components/fund-line-chart";
import { MonthlyBars } from "./_components/monthly-bars";
import { OverviewTable } from "./_components/overview-table";
import { ZScoreChart } from "./_components/zscore-chart";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Capital");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: await pageAlternates("/capital"),
  };
}

const OVERVIEW_ROWS = [
  "totalReturn",
  "volatility",
  "sharpe",
  "maxDrawdown",
  "positiveMonths",
  "negativeMonths",
  "monthsAboveBenchmark",
  "monthsBelowBenchmark",
  "bestMonth",
  "worstMonth",
] as const;
const KNOWN_STRATEGIES = ["pairs", "momentum"];

export default async function CapitalPage() {
  const locale = await getPageLocale();
  const t = await getTranslations("Capital");
  const tCommon = await getTranslations("Common");
  const fund = getFund();
  const site = getSite();
  const intl = intlLocale(locale);
  const em = (c: ReactNode) => c;

  const num = (n: number, digits = 2) =>
    new Intl.NumberFormat(intl, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(n);
  const pct = (n: number) => `${num(n)}%`;
  const signedPct = (n: number) => `${n > 0 ? "+" : ""}${num(n)}%`;

  const asOf = formatEdition(fund.cumulativeAsOf, locale);
  // Portuguese month names are lowercase mid-sentence ("desde julho de 2025").
  const inSentence = (s: string) => (locale === "pt" ? s.toLowerCase() : s);
  const asOfText = inSentence(asOf);
  const inception = fund.inception ? inSentence(formatEdition(fund.inception, locale)) : "";
  const overview = fund.overview;
  const benchmark = overview?.benchmark ?? "CDI";
  const row = (id: string) => overview?.rows.find((r) => r.id === id);
  // pairs, momentum, then any strategy the sheet adds (under its own name), fund, benchmark
  const extraIds = (overview?.rows ?? [])
    .map((r) => r.id)
    .filter((id) => ![...KNOWN_STRATEGIES, "fund", "benchmark"].includes(id));
  const columnOrder = [...KNOWN_STRATEGIES, ...extraIds, "fund", "benchmark"];
  const columnLabel = (id: string) =>
    extraIds.includes(id)
      ? (row(id)?.label ?? id)
      : t(`snapshot.columns.${id as "pairs" | "momentum" | "fund" | "benchmark"}`, { benchmark });
  const fundRow = row("fund");
  const strategyRows = [row("pairs"), row("momentum")];

  // Overview table: one formatter per metric, null where a metric doesn't apply.
  type Row = NonNullable<ReturnType<typeof row>>;
  const formatMetric = (r: Row | undefined, key: (typeof OVERVIEW_ROWS)[number]) => {
    const v = r?.[key];
    if (v === undefined) return null;
    if (key === "sharpe") return num(v);
    if (key.endsWith("Months") || key.startsWith("months")) return String(v);
    return pct(v);
  };
  const tableColumns = columnOrder
    .filter((id) => row(id))
    .map((id) => ({
      id,
      label: columnLabel(id),
      highlight: id === "fund",
    }));
  const tableRows = OVERVIEW_ROWS.filter((key) =>
    tableColumns.some((c) => formatMetric(row(c.id), key) !== null),
  ).map((key) => ({
    label: t(`snapshot.rows.${key}`, { benchmark }),
    values: tableColumns.map((c) => formatMetric(row(c.id), key)),
  }));

  // Volatility comparison (risk section): strategies vs the combined fund.
  const vols = columnOrder
    .filter((id) => id !== "benchmark")
    .map((id) => ({ id, label: columnLabel(id), v: row(id)?.volatility }))
    .filter((x): x is { id: string; label: string; v: number } => Number.isFinite(x.v));
  const volMax = Math.max(...vols.map((x) => x.v), 1);

  const monthly = [...fund.monthly].sort((a, b) => a.month.localeCompare(b.month));
  // management reports the sheet links (Fundo mensal → Relatório (PDF)), newest first
  const reports = monthly.filter((m) => m.report).reverse();
  const bars = monthly.map((m) => ({
    key: m.month,
    label: formatEditionShort(m.month, locale),
    value: m.return,
    valueLabel: signedPct(m.return),
  }));
  // months between the first and last report that the league did not report (named in the legend only)
  const monthIndex = (key: string) => Number(key.slice(0, 4)) * 12 + Number(key.slice(5, 7));
  const missing = monthly.length
    ? monthIndex(monthly[monthly.length - 1].month) -
      monthIndex(monthly[0].month) +
      1 -
      monthly.length
    : 0;
  const coverage = [
    t("results.coverage", {
      count: monthly.length,
      range:
        bars.length > 1
          ? `${bars[0].label}–${bars[bars.length - 1].label}`
          : (bars[0]?.label ?? ""),
    }),
    missing ? t("results.missing", { count: missing }) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  // Official daily history (latest History_Master on the Drive): cumulative return and drawdown
  const history = fund.history;
  const historyAsOf = history ? formatEdition(history.month, locale) : "";
  const seriesLabel = (s: { id: string; label: string }) =>
    s.id === "cdi"
      ? benchmark
      : [...KNOWN_STRATEGIES, "fund"].includes(s.id)
        ? columnLabel(s.id)
        : s.label;
  const historySeries = history?.series.map((s) => ({ id: s.id, label: seriesLabel(s) })) ?? [];
  const lastPoint = history?.points.at(-1);
  // value over the running peak, for every series but the benchmark
  const ddIdx = historySeries.flatMap((s, k) => (s.id === "cdi" ? [] : [k]));
  const peaks = ddIdx.map(() => 0);
  const drawdown =
    history?.points.map((p) => ({
      date: p.date,
      values: ddIdx.map((k, j) => {
        peaks[j] = Math.max(peaks[j], p.values[k]);
        return p.values[k] / peaks[j];
      }),
    })) ?? [];
  const ddSeries = ddIdx.map((k) => historySeries[k]);
  const ddWorst = ddSeries.map((s, j) => ({
    label: s.label,
    v: (Math.min(...drawdown.map((p) => p.values[j])) - 1) * 100,
  }));

  const disclaimerItems = [
    t("disclaimer.simulated"),
    t("disclaimer.noMoney"),
    t("disclaimer.past"),
    t("disclaimer.advice"),
  ];
  const strategies = getStrategies();
  const outcomes = ["converged", "diverged", "carry"] as const;
  const definitions = ["volatility", "sharpe", "drawdown", "correlation"] as const;
  const processSteps = ["research", "execution", "monitoring", "report"] as const;

  return (
    <main id="content">
      <PageIntro
        motif={<StrategiesMotif />}
        eyebrow={t("eyebrow")}
        title={t.rich("title", { em })}
        description={t("description")}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="highlight">{tCommon("simulated")}</Badge>
          {/* the latest management report up front; the full list sits in the panel's monthly tab */}
          {reports[0] ? (
            <a
              href={reports[0].report}
              download
              className={buttonVariants({ variant: "primary", size: "sm" })}
            >
              <Download aria-hidden className="size-4" />
              {t("results.reportLatest", {
                month: inSentence(formatEdition(reports[0].month, locale)),
              })}
            </a>
          ) : null}
          <ButtonAnchor href={site.linkedin} variant="outline" size="sm" arrow>
            {t("reports.title")}
          </ButtonAnchor>
        </div>
      </PageIntro>

      {/* Panorama: official figures from the monthly report — one KPI row and one tabbed card. */}
      <section className="container-page section-y">
        <SectionHeader
          title={t.rich("snapshot.title", { em })}
          description={t("snapshot.description", {
            inception,
            asOf: asOfText,
          })}
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi
            label={t("snapshot.cumulative")}
            note={
              overview
                ? t("snapshot.vsBenchmark", { benchmark, value: pct(overview.benchmarkReturn) })
                : undefined
            }
            highlight
          >
            <NumberTicker
              value={fund.cumulativeReturn}
              decimals={2}
              prefix={fund.cumulativeReturn > 0 ? "+" : ""}
              suffix="%"
              locale={intl}
            />
          </Kpi>
          {fundRow?.volatility !== undefined ? (
            <Kpi label={t("snapshot.volatility")} note={t("snapshot.volatilityNote")}>
              {pct(fundRow.volatility)}
            </Kpi>
          ) : null}
          {fundRow?.sharpe !== undefined ? (
            <Kpi label={t("snapshot.sharpe")} note={t("snapshot.sharpeNote", { benchmark })}>
              {num(fundRow.sharpe)}
            </Kpi>
          ) : null}
          {overview ? (
            <Kpi label={t("snapshot.correlation")} note={t("snapshot.correlationNote")}>
              {num(overview.correlation, 3)}
            </Kpi>
          ) : null}
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-card p-4 sm:p-8">
          <PanelTabs
            label={t("panel.label")}
            items={[
              history &&
                lastPoint && {
                  id: "cumulative",
                  label: t("panel.tabs.cumulative"),
                  content: (
                    <>
                      <PanelMeta
                        badges={[tCommon("simulated"), t("panel.official", { asOf: historyAsOf })]}
                      />
                      <FundLineChart
                        points={history.points}
                        series={historySeries}
                        locale={intl}
                        ariaLabel={t("cumulative.chartLabel", {
                          inception,
                          asOf: inSentence(historyAsOf),
                          summary: historySeries
                            .map(
                              (s, k) => `${s.label} ${signedPct((lastPoint.values[k] - 1) * 100)}`,
                            )
                            .join(", "),
                        })}
                      />
                      <p className="mt-4 text-xs text-muted-foreground">{t("cumulative.note")}</p>
                    </>
                  ),
                },
              bars.length > 0 && {
                id: "monthly",
                label: t("panel.tabs.monthly"),
                content: (
                  <>
                    <PanelMeta badges={[tCommon("simulated"), t("panel.official", { asOf })]} />
                    <MonthlyBars
                      bars={bars}
                      ariaLabel={t("results.chartLabel", {
                        summary: bars.map((b) => `${b.label} ${b.valueLabel}`).join(", "),
                      })}
                      tableCaption={t("results.tableCaption")}
                      coverage={coverage}
                      windowNote={t("results.window", { count: 24 })}
                    />
                  </>
                ),
              },
              overview && {
                id: "strategies",
                label: t("panel.tabs.strategies"),
                content: (
                  <>
                    <PanelMeta badges={[tCommon("simulated"), t("panel.official", { asOf })]} />
                    <OverviewTable
                      caption={t("snapshot.tableCaption", { benchmark, asOf: asOfText })}
                      metricHeader={t("snapshot.metric")}
                      columns={tableColumns}
                      rows={tableRows}
                    />
                    <p className="mt-4 text-xs text-muted-foreground">
                      {t("snapshot.correlation")}: {num(overview.correlation, 3)} (
                      {t("snapshot.correlationNote")}) · {t("snapshot.source", { asOf: asOfText })}
                    </p>
                  </>
                ),
              },
              drawdown.length > 0 && {
                id: "drawdown",
                label: t("panel.tabs.drawdown"),
                content: (
                  <>
                    <PanelMeta
                      badges={[tCommon("simulated"), t("panel.official", { asOf: historyAsOf })]}
                    />
                    <FundLineChart
                      points={drawdown}
                      series={ddSeries}
                      locale={intl}
                      step={2}
                      ariaLabel={t("drawdown.chartLabel", {
                        summary: ddWorst.map((d) => `${d.label} ${pct(d.v)}`).join(", "),
                      })}
                    />
                    <p className="mt-4 text-xs text-muted-foreground">
                      {t("drawdown.note", {
                        summary: ddWorst.map((d) => `${d.label} ${pct(d.v)}`).join(" · "),
                      })}
                    </p>
                  </>
                ),
              },
              reports.length > 0 && {
                id: "reports",
                label: t("panel.tabs.reports"),
                content: (
                  <>
                    <PanelMeta badges={[tCommon("simulated"), t("results.reportsTitle")]} />
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {reports.map((m, i) => (
                        <li key={m.month}>
                          <a
                            href={m.report}
                            download
                            aria-label={t("results.reportDownload", {
                              month: inSentence(formatEdition(m.month, locale)),
                            })}
                            className={cn(
                              "flex items-center justify-between gap-3 rounded-xl border p-4 transition-colors hover:border-highlight focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                              i === 0 ? "border-highlight bg-muted" : "border-border",
                            )}
                          >
                            <span>
                              <span className="block font-sans font-semibold text-foreground">
                                {formatEdition(m.month, locale)}
                              </span>
                              <span className="font-mono text-xs text-muted-foreground">
                                {i === 0 ? `${t("results.latest")} · PDF` : "PDF"} ·{" "}
                                {signedPct(m.return)}
                              </span>
                            </span>
                            <Download
                              aria-hidden
                              className="size-4 shrink-0 text-muted-foreground"
                            />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                ),
              },
            ]}
          />
        </div>
      </section>

      {/* Estratégias: one section per active strategy in the sheet. Pairs keeps its illustration;
          any strategy with exposure columns gets the long/short bars. */}
      {strategies.map((st, i) => {
        const visual =
          st.id === "pairs" ? (
            <div className="flex flex-col gap-6 lg:pt-4">
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <h3 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                  {t("pairs.chart.title")}
                </h3>
                <div className="mt-6">
                  <ZScoreChart
                    ariaLabel={t("pairs.chart.aria")}
                    entryLabel={t("pairs.chart.entry")}
                    exitLabel={t("pairs.chart.exit")}
                    openLabel={t("pairs.chart.open")}
                    locale={intl}
                  />
                </div>
                <p className="mt-4 text-xs text-muted-foreground">{t("pairs.chart.note")}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                  {t("pairs.formulaLabel")}
                </p>
                <p className="mt-3 font-mono text-base text-foreground sm:text-lg">
                  {t("pairs.formula")}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                  {t("pairs.outcomesTitle")}
                </h3>
                <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                  {outcomes.map((key) => (
                    <li key={key}>
                      <p className="font-sans text-sm font-semibold text-foreground">
                        {t(`pairs.outcomes.${key}.title`)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t(`pairs.outcomes.${key}.body`)}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : st.exposure ? (
            <div className="lg:pt-4">
              <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                <h3 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                  {t("exposure.title")}
                </h3>
                <ExposureBars
                  className="mt-6"
                  items={[
                    { label: t("exposure.long"), value: st.exposure.long, tone: "long" },
                    { label: t("exposure.short"), value: -st.exposure.short, tone: "short" },
                    {
                      label: t("exposure.gross"),
                      value: st.exposure.long + st.exposure.short,
                      tone: "total",
                    },
                    {
                      label: t("exposure.net"),
                      value: st.exposure.long - st.exposure.short,
                      tone: "total",
                    },
                  ]}
                  format={(v) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v)}%`}
                />
                <p className="mt-6 text-xs text-muted-foreground">{t("exposure.note")}</p>
              </div>
            </div>
          ) : null;
        return (
          <section
            key={st.id}
            className={cn("border-t border-border", i % 2 === 0 && "section-tone")}
          >
            <div
              className={cn(
                "container-page grid gap-12 section-y",
                visual && "lg:grid-cols-[1fr_1.1fr] lg:gap-16",
              )}
            >
              <div>
                <SectionHeader title={tr(st.name, locale)} description={tr(st.summary, locale)} />
                <Steps
                  className="mt-10"
                  items={st.rules.map((r) => ({
                    title: tr(r.title, locale),
                    body: tr(r.body, locale),
                  }))}
                />
              </div>
              {visual}
            </div>
          </section>
        );
      })}

      {/* Risco */}
      <section className="border-t border-border section-tone">
        <div className="container-page grid gap-12 section-y lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeader title={t.rich("risk.title", { em })} />
            <div className="mt-6 flex max-w-xl flex-col gap-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              <p>{t("risk.p1", { correlation: num(overview?.correlation ?? 0, 3) })}</p>
              <p>{t("risk.p2")}</p>
            </div>
            {vols.length > 0 ? (
              <div className="mt-10 rounded-2xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                    {t("risk.volTitle")}
                  </h3>
                  <Badge variant="outline">{asOf}</Badge>
                </div>
                <ul
                  className="mt-5 flex flex-col gap-4"
                  aria-label={t("risk.volAria", {
                    summary: vols.map((x) => `${x.label} ${pct(x.v)}`).join(", "),
                  })}
                >
                  {vols.map((x) => (
                    <li key={x.id}>
                      <div className="flex items-baseline justify-between gap-4 text-sm">
                        <span className={x.id === "fund" ? "font-semibold text-foreground" : ""}>
                          {x.label}
                        </span>
                        <span className="font-mono tabular-nums">{pct(x.v)}</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-accent">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            x.id === "fund" ? "bg-highlight" : "bg-highlight/45",
                          )}
                          style={{ width: `${(x.v / volMax) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <div className="lg:pt-4">
            <h3 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
              {t("risk.definitionsTitle")}
            </h3>
            <dl className="mt-4 divide-y divide-border border-y border-border">
              {definitions.map((key) => (
                <div key={key} className="py-5">
                  <dt className="font-sans font-semibold text-foreground">
                    {t(`risk.definitions.${key}.term`)}
                  </dt>
                  <dd className="mt-1 text-sm text-muted-foreground">
                    {t(`risk.definitions.${key}.body`)}
                  </dd>
                </div>
              ))}
            </dl>
            {strategyRows.some((r) => r?.maxDrawdown !== undefined) ? (
              <div className="mt-6 grid grid-cols-2 gap-4">
                {(["pairs", "momentum"] as const).map((id) =>
                  row(id)?.maxDrawdown !== undefined ? (
                    <div key={id} className="rounded-2xl border border-border bg-card p-5">
                      <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                        {t("snapshot.rows.maxDrawdown")}
                      </p>
                      <p className="mt-2 font-mono text-2xl text-foreground">
                        {pct(row(id)!.maxDrawdown!)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t(`snapshot.columns.${id}`, { benchmark })}
                      </p>
                    </div>
                  ) : null,
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Rotina */}
      <section className="border-t border-border">
        <div className="container-page section-y">
          <SectionHeader
            title={t.rich("process.title", { em })}
            description={t("process.description")}
          />
          <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((key, i) => (
              <li key={key} className="rounded-2xl border border-border bg-card p-6">
                <span className="font-mono text-xs text-highlight">0{i + 1}</span>
                <h3 className="mt-3 font-sans text-lg font-semibold tracking-tight">
                  {t(`process.steps.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t(`process.steps.${key}.body`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Aviso importante (the reports link sits in the page intro) */}
      <section className="border-t border-border">
        <div className="container-page flex flex-col gap-8 section-y">
          <Disclaimer title={t("disclaimer.title")} items={disclaimerItems} />
          <p className="max-w-4xl text-xs leading-relaxed text-muted-foreground">
            {t("reports.legal")}
          </p>
        </div>
      </section>
    </main>
  );
}

function Kpi({
  label,
  note,
  highlight,
  children,
}: {
  label: string;
  note?: string;
  highlight?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6",
        highlight ? "border-highlight/40 bg-highlight/10" : "border-border bg-card",
      )}
    >
      <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-3 font-mono text-4xl text-foreground tabular-nums">{children}</p>
      {note ? <p className="mt-2 text-sm text-muted-foreground">{note}</p> : null}
    </div>
  );
}

/** Badges on top of a fund-panel tab: simulated label, data source, date. */
function PanelMeta({ badges }: { badges: string[] }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {badges.map((b, i) => (
        <Badge key={b} variant={i === 0 ? "highlight" : "outline"}>
          {b}
        </Badge>
      ))}
    </div>
  );
}

/** Numbered vertical list for a strategy's rules. */
function Steps({
  items,
  className,
}: {
  items: { title: string; body: string }[];
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-col", className)}>
      {items.map((item, i) => (
        <li
          key={item.title}
          className="relative grid grid-cols-[2.5rem_1fr] gap-x-2 pb-8 last:pb-0"
        >
          {i < items.length - 1 ? (
            <span aria-hidden className="absolute top-8 bottom-1 left-[0.95rem] w-px bg-border" />
          ) : null}
          <span className="flex size-8 items-center justify-center rounded-full border border-highlight/40 bg-highlight/10 font-mono text-xs text-highlight">
            {i + 1}
          </span>
          <div className="pt-1">
            <h3 className="font-sans text-lg font-semibold tracking-tight text-foreground">
              {item.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Horizontal exposure bars (percent of net assets). Short exposure is drawn as a negative bar. */
function ExposureBars({
  items,
  format,
  className,
}: {
  items: { label: string; value: number; tone: "long" | "short" | "total" }[];
  format: (v: number) => string;
  className?: string;
}) {
  const max = Math.max(...items.map((x) => Math.abs(x.value)), 1);
  return (
    <ul className={cn("flex flex-col gap-5", className)}>
      {items.map((x) => (
        <li key={x.label}>
          <div className="flex items-baseline justify-between gap-4 text-sm">
            <span className={x.tone === "total" ? "text-muted-foreground" : "text-foreground"}>
              {x.label}
            </span>
            <span className="font-mono text-foreground tabular-nums">{format(x.value)}</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-accent">
            <div
              className={cn(
                "h-full rounded-full",
                x.tone === "long" && "bg-highlight",
                x.tone === "short" && "bg-destructive/70",
                x.tone === "total" && "bg-foreground/35",
              )}
              style={{ width: `${(Math.abs(x.value) / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
