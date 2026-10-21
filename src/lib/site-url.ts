/**
 * Canonical origin. NEXT_PUBLIC_SITE_URL overrides; any Vercel build (production and previews alike,
 * so previews point search engines at the real site) uses the league's domain; localhost otherwise.
 * Pinned rather than VERCEL_PROJECT_PRODUCTION_URL, which may pick the bare domain or the vercel.app one.
 */
const PRODUCTION = "https://www.fgvquant.com.br";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL ? PRODUCTION : "http://localhost:3000");
