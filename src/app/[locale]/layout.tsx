import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import { locale as rootLocale } from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site-url";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SkipLink } from "@/components/layout/skip-link";
import { ThemeProvider } from "@/components/theme-provider";
import "../globals.css";

// latin covers Portuguese (À–ÿ); latin-ext only added weight. Italic stays preloaded: the hero
// headline emphasis ("com rigor") is above the fold.
const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});
const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
// Mono only styles small eyebrows/data: no preload, swap in when ready.
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  preload: false,
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    title: { default: t("title"), template: `%s · FGV Quant` },
    description: t("description"),
    metadataBase: new URL(SITE_URL), // NEXT_PUBLIC_SITE_URL in Phase 7; localhost until then
  };
}

export const viewport: Viewport = {
  themeColor: "#130421",
  colorScheme: "dark light",
};

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await rootLocale();
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html
      lang={locale === "pt" ? "pt-BR" : "en"}
      className={`${lora.variable} ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-dots" />
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-grain" />
        <ThemeProvider>
          <NextIntlClientProvider>
            <SkipLink />
            <SiteHeader />
            {children}
            <SiteFooter />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
