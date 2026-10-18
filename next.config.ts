import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  typedRoutes: true,
  // Competitions moved into /projetos: keep old links (and search results) working.
  async redirects() {
    return [
      { source: "/competicoes", destination: "/projetos#competicoes", permanent: true },
      { source: "/en/competicoes", destination: "/en/projetos#competicoes", permanent: true },
    ];
  },
  experimental: {
    // Root layout is app/[locale]/layout.tsx, so unmatched URLs need app/global-not-found.tsx
    // to get a branded 404 (with a real 404 status).
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

/**
 * Phase-aware config so the Velite content layer (content/ -> .velite/) runs with Next:
 * watch mode under `next dev`, a clean awaited build before `next build` compiles.
 * (argv sniffing doesn't work in Next 16 — config is evaluated in a child process.)
 */
export default async function config(phase: string) {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  if (!process.env.VELITE_STARTED && (isDev || phase === PHASE_PRODUCTION_BUILD)) {
    process.env.VELITE_STARTED = "1";
    const { build } = await import("velite");
    await build({ watch: isDev, clean: !isDev });
  }
  return withNextIntl(nextConfig);
}
