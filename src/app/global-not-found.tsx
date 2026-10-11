import type { Metadata, Route } from "next";
import Link from "next/link";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import { Logo } from "@/components/brand/logo";
import "./globals.css";

// Rendered for URLs that match no route at all (the root layout lives under [locale], so there is
// no locale context here) — hence bilingual copy, next/link (not the locale-aware Link), and the dark theme applied directly.
const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-lora",
});
const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
// Mono only styles small eyebrows/data: no preload, swap in when ready.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  preload: false,
  display: "swap",
});

// "/" and "/en" are served via the proxy's locale rewrite, so typed routes (which only know
// "/[locale]/…") can't see them — they are valid at runtime.
const HOME_PT = "/" as Route;
const HOME_EN = "/en" as Route;

export const metadata: Metadata = {
  title: "404 · FGV Quant",
  description: "Página não encontrada · Page not found",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html
      lang="pt-BR"
      className={`${lora.variable} ${geistSans.variable} ${geistMono.variable} dark`}
    >
      <body className="relative isolate flex min-h-dvh flex-col">
        <div aria-hidden className="absolute inset-0 -z-10 bg-glow" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-dots-strong [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />
        <header className="container-page flex h-16 items-center">
          <Link href={HOME_PT} aria-label="FGV Quant" className="rounded-md">
            <Logo />
          </Link>
        </header>
        <main id="content" className="container-page flex flex-1 flex-col justify-center py-24">
          <p className="font-mono text-sm text-highlight">404 · σ &gt; 3</p>
          <h1 className="mt-4 font-display text-4xl md:text-6xl">
            Página não encontrada
            <span className="mt-2 block text-2xl text-muted-foreground md:text-3xl" lang="en">
              Page not found
            </span>
          </h1>
          <p className="mt-6 max-w-prose text-muted-foreground">
            O caminho que você tentou não existe. Talvez um outlier.{" "}
            <span lang="en">
              The page you tried to reach doesn&apos;t exist. Perhaps an outlier.
            </span>
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={HOME_PT}
              className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Voltar ao início
            </Link>
            <Link
              href={HOME_EN}
              lang="en"
              className="inline-flex h-10 items-center rounded-full border border-border-strong px-5 text-sm transition-colors hover:bg-accent"
            >
              Back to home
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
