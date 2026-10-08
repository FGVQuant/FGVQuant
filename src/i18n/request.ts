import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { routing } from "./routing";

// Locale comes from the `[locale]` root param (next/root-params), which keeps
// pages statically prerenderable under cacheComponents.
export default getRequestConfig(async ({ locale: override }) => {
  const candidate = override ?? (await rootLocale());
  const locale = hasLocale(routing.locales, candidate) ? candidate : routing.defaultLocale;

  return {
    locale,
    timeZone: "America/Sao_Paulo",
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
