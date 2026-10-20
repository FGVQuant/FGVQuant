import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { getIssues } from "@/lib/content";
import { routing } from "./i18n/routing";

// Next 16 renamed middleware.ts -> proxy.ts. next-intl rewrites "/x" to "/pt/x" and serves "/en/x" as-is.
const intl = createMiddleware(routing);

// Unknown newsletter slugs: with PPR, notFound() inside the page streams after a 200 status.
// Reject them here instead by rewriting to a path no route matches, which yields a real 404
// rendered by app/global-not-found.tsx.
const ISSUE_SLUGS = new Set(getIssues().map((issue) => issue.slug));
const ISSUE_PATH = /^(?:\/(pt|en))?\/newsletter\/([^/]+)\/?$/;

function isKnownSlug(raw: string) {
  try {
    return ISSUE_SLUGS.has(decodeURIComponent(raw));
  } catch {
    return false; // malformed escape (e.g. "%E0") → treat as unknown, never a 500
  }
}

// Pages folded into others (2026-10 structure pass): keep old links working with a permanent redirect.
const MOVED: Record<string, string> = { time: "/equipe", competicoes: "/projetos#competicoes" };
const MOVED_PATH = /^(?:\/(pt|en))?\/(time|competicoes)\/?$/;

export default function proxy(request: NextRequest) {
  const moved = request.nextUrl.pathname.match(MOVED_PATH);
  if (moved) {
    const prefix = moved[1] === "en" ? "/en" : "";
    return NextResponse.redirect(new URL(`${prefix}${MOVED[moved[2]]}`, request.url), 308);
  }

  const match = request.nextUrl.pathname.match(ISSUE_PATH);
  if (match && !isKnownSlug(match[2])) {
    const url = request.nextUrl.clone();
    url.pathname = `/${match[1] ?? routing.defaultLocale}/__not-found`;
    return NextResponse.rewrite(url, { status: 404 });
  }
  return intl(request);
}

export const config = {
  // Skip Next internals, API routes, any path with a file extension (icons, brand assets) and the
  // generated share images: og:image points at /pt/opengraph-image, which next-intl would
  // otherwise redirect (307) to /opengraph-image — some link-preview crawlers don't follow that.
  matcher: "/((?!api|_next|_vercel|.*\\..*|.*opengraph-image|.*twitter-image).*)",
};
