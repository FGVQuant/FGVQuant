/**
 * Canonical origin. NEXT_PUBLIC_SITE_URL overrides; on Vercel it falls back to the project's
 * production domain (follows a custom domain once one is added); localhost otherwise.
 */
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercel ? `https://${vercel}` : "http://localhost:3000");
