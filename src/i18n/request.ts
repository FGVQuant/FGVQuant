import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locale as rootLocale } from "next/root-params";
import { routing } from "./routing";

/**
 * Messages are split per page namespace (messages/{locale}/{file}.json) so pages can be
 * developed in parallel. Each file holds one or more top-level namespaces, e.g.
 * { "About": { ... } }; they are shallow-merged here. Add new files to this list.
 */
export const MESSAGE_FILES = [
  "common",
  "home",
  "about",
  "newsletter",
  "team",
  "join",
  "capital",
  "competitions",
  "events",
  "partners",
] as const;

async function loadMessages(locale: string) {
  const parts = await Promise.all(
    MESSAGE_FILES.map(
      async (file) => (await import(`../../messages/${locale}/${file}.json`)).default,
    ),
  );
  return Object.assign({}, ...parts);
}

// Locale comes from the `[locale]` root param (next/root-params), which keeps
// pages statically prerenderable under cacheComponents.
export default getRequestConfig(async ({ locale: override }) => {
  const candidate = override ?? (await rootLocale());
  const locale = hasLocale(routing.locales, candidate) ? candidate : routing.defaultLocale;

  return {
    locale,
    timeZone: "America/Sao_Paulo",
    messages: await loadMessages(locale),
  };
});
