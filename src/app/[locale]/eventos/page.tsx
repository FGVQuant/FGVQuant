import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { BullMark } from "@/components/brand/logo";
import { PageIntro } from "@/components/layout/page-intro";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { ButtonAnchor } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import {
  formatEventDate,
  getEvents,
  getQuantConnect,
  getSite,
  intlLocale,
  tr,
} from "@/lib/content";
import { getPageLocale } from "@/lib/locale";
import { pageAlternates } from "@/lib/seo";
import { cn } from "@/lib/utils";

type Translator = Awaited<ReturnType<typeof getTranslations>>;
type EventItem = ReturnType<typeof getEvents>[number];

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Events.meta");
  return {
    title: t("title"),
    description: t("description"),
    alternates: await pageAlternates("/eventos"),
  };
}

/**
 * The top of the page is shared: the Quant Connect (the league's flagship) beside this year's
 * events, so neither hides the other. On phones this year's events become a swipeable carousel
 * under the Quant Connect. Earlier years follow as a compact archive. Competitions live on
 * /projetos; the Quant Connect entry of the event list is covered by its own block.
 */
export default async function EventsPage() {
  const [t, tCommon, locale] = await Promise.all([
    getTranslations("Events"),
    getTranslations("Common"),
    getPageLocale(),
  ]);
  const plain = { em: (chunks: ReactNode) => chunks };

  const events = getEvents()
    .filter((e) => e.kind !== "competition" && !e.id.startsWith("quant-connect"))
    .reverse();
  const currentYear = events[0]?.date.slice(0, 4) ?? "";
  const thisYear = events.filter((e) => e.date.startsWith(currentYear));
  const earlier = events.filter((e) => !e.date.startsWith(currentYear));
  const years = [...new Set(earlier.map((e) => e.date.slice(0, 4)))];

  return (
    <main id="content">
      <PageIntro
        eyebrow={t("intro.eyebrow")}
        title={t.rich("intro.title", plain)}
        description={t("intro.description")}
      >
        {/* Follow the agenda: a compact line up top instead of a closing panel. */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <ButtonAnchor href={getSite().instagram} variant="outline">
            {t("cta.button")}
          </ButtonAnchor>
          <p className="text-sm text-muted-foreground">{t("cta.description")}</p>
        </div>
      </PageIntro>

      <section className="container-page section-y">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-6">
          <QuantConnect
            t={t}
            newTab={tCommon("newTab")}

            locale={locale}
          />

          {thisYear.length > 0 ? (
            <section
              aria-labelledby="este-ano"
              className="lg:rounded-3xl lg:border lg:border-border lg:bg-card lg:p-5"
            >
              <div className="lg:px-2">
                <h2
                  id="este-ano"
                  className="flex items-baseline gap-3 font-display text-3xl tracking-tight text-foreground"
                >
                  {t("highlights.title", { year: currentYear })}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">{t("highlights.description")}</p>
              </div>
              {/* Phones and tablets: swipeable photo cards bleeding to the screen edge. Desktop: a
                  compact list beside the Quant Connect. */}
              <ul className="-mx-5 mt-6 flex snap-x snap-mandatory scroll-px-5 scrollbar-none gap-3 overflow-x-auto px-5 pb-3 md:-mx-8 md:scroll-px-8 md:px-8 lg:mx-0 lg:mt-4 lg:snap-none lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
                {thisYear.map((e) => (
                  <li key={e.id} className="w-[80%] shrink-0 snap-start sm:w-[46%] lg:w-auto">
                    <ThisYearItem event={e} t={t} locale={locale} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </section>

      {years.length > 0 ? (
        <section className="border-t border-border section-tone">
          <div className="container-page section-y">
            <SectionHeader
              title={t.rich("timeline.title", plain)}
              description={t("timeline.description")}
            />
            <div className="mt-12 flex flex-col gap-12">
              {years.map((year) => {
                const ofYear = earlier.filter((e) => e.date.startsWith(year));
                return (
                  <section key={year} aria-labelledby={`ano-${year}`}>
                    <h3
                      id={`ano-${year}`}
                      className="flex items-baseline gap-3 font-display text-3xl tracking-tight"
                    >
                      {year}
                    </h3>
                    <ol className="mt-5 grid gap-x-8 border-t border-border lg:grid-cols-2">
                      {ofYear.map((e) => (
                        <li key={e.id} className="border-b border-border">
                          <ArchiveRow event={e} t={t} locale={locale} />
                        </li>
                      ))}
                    </ol>
                  </section>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function EventTitle({ event, locale }: { event: EventItem; locale: Locale }) {
  const title = tr(event.title, locale);
  return event.href ? (
    <Link
      href={event.href}
      className="rounded-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      {title}
    </Link>
  ) : (
    title
  );
}

function EventMeta({ event, t, locale }: { event: EventItem; t: Translator; locale: Locale }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 text-sm">
      <span className="text-foreground tabular-nums">{formatEventDate(event, locale)}</span>
      <span className="text-highlight">{t(`kinds.${event.kind}`)}</span>
    </p>
  );
}

/** Event photo, or a faint bull mark when the post had no usable photo. */
function Thumb({
  event,
  sizes,
  className,
  markSize,
}: {
  event: EventItem;
  sizes: string;
  className: string;
  markSize: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      {event.photo ? (
        <Image
          src={event.photo.src}
          alt=""
          width={event.photo.width}
          height={event.photo.height}
          placeholder={event.photo.blurDataURL ? "blur" : "empty"}
          blurDataURL={event.photo.blurDataURL}
          sizes={sizes}
          className="absolute inset-0 size-full object-cover"
        />
      ) : (
        <BullMark className={cn("absolute inset-0 m-auto text-highlight/25", markSize)} />
      )}
    </div>
  );
}

/** This year: a photo card in the phone carousel, a compact row in the desktop list. */
function ThisYearItem({ event, t, locale }: { event: EventItem; t: Translator; locale: Locale }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card lg:flex-row lg:items-center lg:gap-4 lg:rounded-xl lg:border-0 lg:bg-transparent lg:p-2 lg:transition-colors lg:hover:bg-accent/40">
      <Thumb
        event={event}
        sizes="(min-width: 1024px) 96px, (min-width: 640px) 46vw, 80vw"
        className="aspect-3/2 lg:w-24 lg:shrink-0 lg:rounded-lg"
        markSize="size-12 lg:size-7"
      />
      <div className="flex min-w-0 flex-1 flex-col p-4 lg:p-0">
        <EventMeta event={event} t={t} locale={locale} />
        <h3 className="mt-1.5 font-sans leading-snug font-semibold tracking-tight text-foreground lg:mt-0.5 lg:text-[0.95rem]">
          <EventTitle event={event} locale={locale} />
        </h3>
        {event.description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground lg:hidden">
            {tr(event.description, locale)}
          </p>
        ) : null}
      </div>
    </article>
  );
}

/** Earlier years: compact row with a small thumbnail. */
function ArchiveRow({ event, t, locale }: { event: EventItem; t: Translator; locale: Locale }) {
  return (
    <div className="flex gap-4 py-4">
      <Thumb
        event={event}
        sizes="112px"
        className="aspect-3/2 w-24 shrink-0 rounded-lg sm:w-28"
        markSize="size-8"
      />
      <div className="min-w-0">
        <EventMeta event={event} t={t} locale={locale} />
        <h4 className="mt-1 font-sans leading-snug font-semibold tracking-tight text-foreground">
          <EventTitle event={event} locale={locale} />
        </h4>
        {event.description ? (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {tr(event.description, locale)}
          </p>
        ) : null}
      </div>
    </div>
  );
}

const linkClass =
  "inline-flex items-center gap-1 rounded-sm underline-offset-4 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/**
 * Flagship card for the Quant Connect: photos on top, then identity, numbers, dates and the event's
 * channels; the program, panel themes, partners and past editions fold into a native <details>.
 */
function QuantConnect({ t, newTab, locale }: { t: Translator; newTab: string; locale: Locale }) {
  const qc = getQuantConnect();
  const [latest, ...past] = qc.editions;
  if (!latest) return null;
  const intl = intlLocale(locale);
  const day = new Intl.DateTimeFormat(intl, { timeZone: "UTC", day: "numeric" });
  const month = new Intl.DateTimeFormat(intl, { timeZone: "UTC", month: "short" });
  const weekday = new Intl.DateTimeFormat(intl, { timeZone: "UTC", weekday: "long" });
  const [hero, ...side] = qc.photos;

  const stats = [
    latest.days.length > 0 ? { value: latest.days.length, label: t("qc.statDays") } : null,
    latest.panels ? { value: latest.panels, label: t("qc.statPanels") } : null,
    { value: qc.organizers.length, label: t("qc.statLeagues") },
  ].filter((s) => s !== null);

  return (
    <article
      id="quant-connect"
      className="relative isolate scroll-mt-24 overflow-hidden rounded-3xl border border-highlight/30 bg-card"
    >
      <div aria-hidden className="absolute inset-0 -z-10 bg-glow opacity-70" />

      {/* Mosaic: the wide group photo on top, three smaller ones underneath (first four photos). */}
      {hero ? (
        <div className="grid grid-cols-3 gap-1.5 p-1.5">
          <Photo
            image={hero.image}
            alt={tr(hero.alt, locale)}
            className="col-span-3 h-48 rounded-t-[1.35rem] rounded-b-lg sm:h-64"
            sizes="(min-width: 1024px) 720px, 100vw"
          />
          {side.slice(0, 3).map((p, i) => (
            <Photo
              key={i}
              image={p.image}
              alt={tr(p.alt, locale)}
              position={p.position}
              className="h-20 rounded-lg sm:h-28"
              sizes="(min-width: 1024px) 240px, 33vw"
            />
          ))}
        </div>
      ) : null}

      <div className="p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="highlight" className="px-3 py-1 text-xs">
            {t("qc.label")}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {t("qc.edition", { number: latest.number, year: latest.year })}
          </span>
        </div>
        <h2 className="mt-4 font-display text-5xl leading-none tracking-tight text-foreground sm:text-6xl">
          {qc.name}
        </h2>
        <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-muted-foreground">
          {tr(qc.description, locale)}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm text-muted-foreground">{t("qc.organizers")}</span>
          {qc.organizers.map((o) => (
            <Badge key={o} variant={o === "FGV Quant" ? "highlight" : "outline"}>
              {o}
            </Badge>
          ))}
        </div>

        <div className="mt-6 grid gap-6 border-y border-border py-6">
          <dl className="grid grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-4xl text-foreground tabular-nums">
                    {s.value}
                  </span>
                  <span className="mt-1 block max-w-[9rem] text-xs text-muted-foreground">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <ul className="grid gap-3 sm:grid-cols-2">
            {latest.days.map((d) => {
              const date = new Date(d.date);
              return (
                <li key={d.date} className="flex items-center gap-3">
                  <span className="flex w-11 shrink-0 flex-col items-center rounded-lg bg-secondary py-1 text-center">
                    <span className="font-display text-lg leading-none text-foreground">
                      {day.format(date)}
                    </span>
                    <span className="mt-0.5 text-xs text-highlight uppercase">
                      {month.format(date).replace(".", "")}
                    </span>
                  </span>
                  <span className="min-w-0 text-sm">
                    <span className="block font-semibold text-foreground">{d.venue}</span>
                    <span className="block text-muted-foreground first-letter:uppercase">
                      {[weekday.format(date), d.area].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonAnchor href={qc.instagram} arrow>
            {t("qc.instagram")}
          </ButtonAnchor>
          <ButtonAnchor href={qc.linkedin} variant="outline" arrow>
            {t("qc.linkedin")}
          </ButtonAnchor>
        </div>
      </div>

      <details className="group border-t border-border">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-sans font-semibold text-foreground hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:px-8 [&::-webkit-details-marker]:hidden">
          {t("qc.details", { year: latest.year })}
          <ChevronDown
            aria-hidden
            className="size-5 text-muted-foreground transition-transform group-open:rotate-180"
          />
        </summary>

        <div className="grid gap-10 px-6 pt-2 pb-8 sm:px-8 md:grid-cols-2">
          {latest.days
            .filter((d) => d.program.length > 0)
            .map((d) => (
              <div key={d.date}>
                <h3 className="font-sans text-lg font-semibold tracking-tight">
                  {t("qc.programTitle", { venue: d.venue })}
                </h3>
                <ol className="mt-4 divide-y divide-border border-y border-border">
                  {d.program.map((item, i) => (
                    <li key={i} className="flex gap-4 py-2.5 text-sm">
                      <span className="w-12 shrink-0 text-muted-foreground tabular-nums">
                        {item.time}
                      </span>
                      <span>
                        <span className="text-foreground">{item.title}</span>
                        {item.by ? <span className="block text-highlight">{item.by}</span> : null}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}

          <div className="flex flex-col gap-8">
            {latest.themes.length > 0 ? (
              <div>
                <h3 className="font-sans text-lg font-semibold tracking-tight">
                  {t("qc.themesTitle")}
                </h3>
                <ol className="mt-4 divide-y divide-border border-y border-border">
                  {latest.themes.map((theme, i) => (
                    <li key={i} className="flex gap-4 py-2.5 text-sm">
                      <span className="text-muted-foreground tabular-nums">{i + 1}</span>
                      <span className="text-foreground">{tr(theme, locale)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}

            {latest.partners.length > 0 ? (
              <div>
                <h3 className="font-sans text-lg font-semibold tracking-tight">
                  {t("qc.partnersTitle", { year: latest.year })}
                </h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {latest.partners.map((p) => (
                    <li
                      key={p}
                      className="rounded-full border border-border bg-background/40 px-3 py-1.5 text-sm text-foreground"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  {latest.partnersSource ? (
                    <a
                      href={latest.partnersSource}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t("qc.partnersNote")} ${newTab}`}
                      className={linkClass}
                    >
                      {t("qc.partnersNote")}
                      <ArrowUpRight aria-hidden className="size-3.5" />
                    </a>
                  ) : null}
                  {latest.source ? (
                    <a
                      href={latest.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t("qc.source")} ${newTab}`}
                      className={linkClass}
                    >
                      {t("qc.source")}
                      <ArrowUpRight aria-hidden className="size-3.5" />
                    </a>
                  ) : null}
                </p>
              </div>
            ) : null}

            {past.length > 0 ? (
              <div>
                <h3 className="font-sans text-lg font-semibold tracking-tight">
                  {t("qc.pastTitle")}
                </h3>
                <ul className="mt-3 grid gap-2 text-sm">
                  {past.map((e) => (
                    <li key={e.year}>
                      <span className="font-semibold text-foreground">
                        {t("qc.edition", { number: e.number, year: e.year })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </details>
    </article>
  );
}

function Photo({
  image,
  alt,
  className,
  sizes,
  position,
}: {
  image: { src: string; width: number; height: number; blurDataURL?: string };
  alt: string;
  className?: string;
  sizes: string;
  position?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-secondary", className)}>
      <Image
        src={image.src}
        alt={alt}
        width={image.width}
        height={image.height}
        placeholder={image.blurDataURL ? "blur" : "empty"}
        blurDataURL={image.blurDataURL}
        sizes={sizes}
        className="absolute inset-0 size-full object-cover"
        style={position ? { objectPosition: position } : undefined}
      />
    </div>
  );
}
