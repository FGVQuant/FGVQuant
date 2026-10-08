import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["pt", "en"],
  defaultLocale: "pt",
  // pt lives at "/", en at "/en"
  localePrefix: "as-needed",
  // Brand-first: don't auto-redirect visitors to /en based on Accept-Language.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
