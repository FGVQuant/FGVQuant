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
import { formatEdition, getIssue, getIssues, getSite } from "@/lib/content";
import { getPageLocale } from "@/lib/locale";

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

  const all = getIssues();
  const idx = all.findIndex((i) => i.slug === issue.slug);
  const newer = idx > 0 ? all[idx - 1] : undefined;
  const older = idx < all.length - 1 ? all[idx + 1] : undefined;

  return (
    <>
      <article className="container-page max-w-3xl pt-16 pb-8 md:pt-24">
        <Link
          href="/newsletter"
          className="inline-flex items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {t("issue.back")}
        </Link>

        <header className="mt-8">
          <p className="font-mono text-xs tracking-[0.18em] text-highlight uppercase">
            {formatEdition(issue.edition, locale)}
          </p>
          <h1 className="mt-4 font-display text-3xl leading-[1.1] tracking-tight text-balance sm:text-4xl md:text-5xl">
            {issue.title}
          </h1>
          {issue.tags.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tags">
              {issue.tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="outline">{tag}</Badge>
                </li>
              ))}
            </ul>
          ) : null}
          {issue.personality ? (
            <p className="mt-5 text-sm text-muted-foreground">
              {t("issue.personality")}:{" "}
              <span className="font-medium text-foreground">{issue.personality}</span>
            </p>
          ) : null}
          {locale === "en" ? (
            <p className="mt-5 text-sm text-muted-foreground">{t("issue.enNote")}</p>
          ) : null}
        </header>

        {issue.status === "summary" ? (
          <aside
            role="note"
            className="mt-10 rounded-2xl border border-highlight/30 bg-highlight/10 p-6"
          >
            <p className="flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-highlight uppercase">
              <Info aria-hidden className="size-4" />
              {t("issue.summaryTitle")}
            </p>
            <p className="mt-3 text-base text-foreground">{t("issue.summaryBody")}</p>
            <ButtonAnchor size="lg" href={issue.linkedinUrl} className="mt-5">
              {t("issue.readFull")}
              <ArrowUpRight aria-hidden className="size-4" />
            </ButtonAnchor>
          </aside>
        ) : null}

        <div className="mt-10">
          <MdxContent code={issue.body} />
        </div>

        {issue.status === "full" ? (
          <p className="mt-10">
            <a
              href={issue.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm text-sm text-highlight underline-offset-4 hover:underline"
            >
              {t("issue.originally")}
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
                className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-border-strong"
              >
                <span className="flex items-center gap-2 font-mono text-xs tracking-wide text-muted-foreground uppercase">
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
                className="group rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-border-strong sm:text-right"
              >
                <span className="flex items-center gap-2 font-mono text-xs tracking-wide text-muted-foreground uppercase sm:justify-end">
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

        <section className="mt-10 rounded-2xl border border-border bg-card p-6 md:p-8">
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
