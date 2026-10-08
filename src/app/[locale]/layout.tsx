import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import { locale as rootLocale } from "next/root-params";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import "../globals.css";

const lora = Lora({ subsets: ["latin", "latin-ext"], variable: "--font-lora", display: "swap" });
const geistSans = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata");
  return {
    title: { default: t("title"), template: `%s · FGV Quant` },
    description: t("description"),
    metadataBase: new URL("http://localhost:3000"), // replaced with the real domain in Phase 7
    alternates: { languages: { pt: "/", en: "/en" } },
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
        <ThemeProvider>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
