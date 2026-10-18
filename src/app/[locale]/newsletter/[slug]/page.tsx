import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Info } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { MdxContent } from "@/components/mdx/mdx-content";
import { Badge } from "@/components/ui/badge";
import { ButtonAnchor } from "@/components/ui/button";
import { pageAlternates } from "@/lib/seo";
import { IssueCover } from "@/components/cards/issue-cover";
import { formatEdition, formatEditionParts, getIssue, getIssues, getSite } from "@/lib/content";
import { getPageLocale } from "@/lib/locale";
import { IssueContents } from "../_components/issue-contents";

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return getIssues().map((i) => ({ slug: i.slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const issue = getIssue(slug);
  if (!issue) return {};
  return {
    title: issue.title,
    description: issue.excerpt,
    alternates: await pageAlternates(`/newsletter/${slug}`),
  };
}

// params are URL data: awaiting them at the top of the page would block client navigations into an
// issue, so the issue body resolves inside Suspense and the page shell renders instantly.
// Unknown slugs are already rejected with a real 404 in proxy.ts, before this streams.
export default function IssuePage(props: Props) {
  return (
    <main id="content">
      <Suspense fallback={<IssueFallback />}>
        <Issue params={props.params} />
      </Suspense>
    </main>
  );
}

function IssueFallback() {
  return (
    <div aria-busy className="container-page max-w-3xl pt-16 pb-20 md:pt-24">
      <div className="h-4 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      <div className="mt-12 h-4 w-40 animate-pulse rounded bg-muted motion-reduce:animate-none" />
      <div className="mt-5 h-12 w-full max-w-xl animate-pulse rounded bg-muted motion-reduce:animate-none" />
      <div className="mt-10 h-40 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none" />
    </div>
  );
}

async function Issue({ params }: { params: Props["params"] }) {
  const { slug } = await params;
  const issue = getIssue(slug);
  if (!issue) notFound();

  const locale = await getPageLocale();
  const t = await getTranslations("Newsletter");
  const site = getSite();
  // where the issue was published: the 2025 issues on Substack, later ones on LinkedIn
  const platform = {
    platform: new URL(issue.url).hostname.endsWith("substack.com") ? "Substack" : "LinkedIn",
  };

  const cover = formatEditionParts(issue.edition, locale);

  const all = getIssues();
  const idx = all.findIndex((i) => i.slug === issue.slug);
  const newer = idx > 0 ? all[idx - 1] : undefined;
  const older = idx < all.length - 1 ? all[idx + 1] : undefined;

  return (
    <>
      <article className="container-page max-w-3xl pt-16 pb-8 md:pt-24">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/newsletter"
            className="inline-flex items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft aria-hidden className="size-4" />
            {t("issue.back")}
          </Link>
          {issue.status === "summary" ? (
            <ButtonAnchor size="sm" href={issue.url}>
              {t("issue.readFull", platform)}
              <ArrowUpRight aria-hidden className="size-4" />
            </ButtonAnchor>
          ) : null}
        </div>

        <header className="mt-8">
          <p className="text-sm font-medium text-highlight">
            {formatEdition(issue.edition, locale)}
          </p>
          <h1 className="mt-4 font-display text-3xl leading-[1.1] tracking-tight text-balance sm:text-4xl md:text-5xl">
            {issue.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-pretty text-muted-foreground md:text-xl">
            {issue.excerpt}
          </p>
          {issue.tags.length > 0 || issue.personality ? (
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
              {issue.tags.length > 0 ? (
                <ul className="flex flex-wrap gap-2" aria-label="Tags">
                  {issue.tags.map((tag) => (
                    <li key={tag}>
                      <Badge variant="outline">{tag}</Badge>
                    </li>
                  ))}
                </ul>
              ) : null}
              {issue.personality ? (
                <p className="text-sm text-muted-foreground">
                  {t("issue.personality")}:{" "}
                  <span className="font-medium text-foreground">{issue.personality}</span>
                </p>
              ) : null}
            </div>
          ) : null}
          {issue.status === "summary" ? (
            <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <Info aria-hidden className="size-4 text-highlight" />
              {t("issue.summaryNote")}
            </p>
          ) : null}
          {locale === "en" ? (
            <p className="mt-3 text-sm text-muted-foreground">{t("issue.enNote")}</p>
          ) : null}
        </header>

        <IssueCover
          large
          month={cover.month}
          year={cover.year}
          series={t("intro.eyebrow")}
          topic={issue.personality ?? issue.tags[0]}
          figure={issue.figure}
          figureNote={t("figureNote")}
          className="mt-10 aspect-2/1 border border-border sm:aspect-21/9"
        />

        {issue.body ? (
          <div className="mt-12">
            <MdxContent code={issue.body} components={{ ul: IssueContents }} />
          </div>
        ) : null}

        {issue.status === "full" ? (
          <p className="mt-10">
            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm text-sm text-highlight underline-offset-4 hover:underline"
            >
              {t("issue.originally", platform)}
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </p>
        ) : null}
      </article>

      <footer className="container-page max-w-3xl pb-20">
        {newer || older ? (
          <nav
            aria-label={t("issueNavLabel")}
            className="grid gap-4 border-t border-border pt-8 sm:grid-cols-2"
          >
            {older ? (
              <Link
                href={`/newsletter/${older.slug}`}
                className="group rounded-2xl bg-card p-5 transition-colors hover:bg-secondary"
              >
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowLeft aria-hidden className="size-4" />
                  {t("issue.prev")}
                </span>
                <span className="mt-2 block font-display text-lg leading-snug">
                  {formatEdition(older.edition, locale)}
                </span>
              </Link>
            ) : (
              <span aria-hidden className="hidden sm:block" />
            )}
            {newer ? (
              <Link
                href={`/newsletter/${newer.slug}`}
                className="group rounded-2xl bg-card p-5 text-left transition-colors hover:bg-secondary sm:text-right"
              >
                <span className="flex items-center gap-2 text-sm text-muted-foreground sm:justify-end">
                  {t("issue.next")}
                  <ArrowRight aria-hidden className="size-4" />
                </span>
                <span className="mt-2 block font-display text-lg leading-snug">
                  {formatEdition(newer.edition, locale)}
                </span>
              </Link>
            ) : null}
          </nav>
        ) : null}

        <section className="mt-10 rounded-2xl bg-card p-6 md:p-8">
          <h2 className="font-display text-2xl">{t("issue.subscribeTitle")}</h2>
          <p className="mt-2 text-muted-foreground">{t("issue.subscribeBody")}</p>
          <ButtonAnchor variant="outline" size="lg" href={site.newsletterUrl} className="mt-5">
            {t("issue.subscribe")}
            <ArrowUpRight aria-hidden className="size-4" />
          </ButtonAnchor>
        </section>
      </footer>
    </>
  );
}
