import { getLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";

/** Current locale (from the `[locale]` root param) narrowed to our `Locale` union. */
export async function getPageLocale(): Promise<Locale> {
  const locale = await getLocale();
  return (routing.locales as readonly string[]).includes(locale)
    ? (locale as Locale)
    : routing.defaultLocale;
}
