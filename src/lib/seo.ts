import type { Metadata } from "next";
import { getPageLocale } from "@/lib/locale";

/**
 * Per-page `alternates` for generateMetadata. `path` is the PT (unprefixed) path, e.g. "/" or "/sobre".
 * URLs are relative: Next resolves them against `metadataBase` set in the root layout.
 * The canonical follows the current locale (the /en page is canonical for itself).
 */
export async function pageAlternates(path: string): Promise<NonNullable<Metadata["alternates"]>> {
  const locale = await getPageLocale();
  const pt = path;
  const en = path === "/" ? "/en" : `/en${path}`;
  return {
    canonical: locale === "en" ? en : pt,
    languages: { pt, en, "x-default": pt },
  };
}
