/** Canonical origin. Set NEXT_PUBLIC_SITE_URL at deploy time (Phase 7); localhost until then. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
